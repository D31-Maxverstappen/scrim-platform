const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!

const MEMBER_ALLOW = '3146752' // VIEW_CHANNEL | CONNECT | SPEAK
const EVERYONE_DENY = '1024'   // VIEW_CHANNEL
const TEXT_MEMBER_ALLOW = '68608' // VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY

const SCRIM_CATEGORY_NAME = '🎮 스크림'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://d31.gg'

// ── 스크림 카테고리 가져오거나 생성 ──
async function getOrCreateScrimCategory(): Promise<string | null> {
  const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  })
  if (!res.ok) return null
  const channels: { id: string; type: number; name: string }[] = await res.json()

  const existing = channels.find((c) => c.type === 4 && c.name === SCRIM_CATEGORY_NAME)
  if (existing) return existing.id

  const createRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: SCRIM_CATEGORY_NAME,
      type: 4,
      permission_overwrites: [
        { id: GUILD_ID, type: 0, allow: '0', deny: EVERYONE_DENY },
      ],
    }),
  })
  if (!createRes.ok) return null
  const category = await createRes.json()
  return category.id ?? null
}

// ── 역할 관리 ──

export async function createDiscordRole(name: string, color: number): Promise<string | null> {
  const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/roles`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color, hoist: false, mentionable: false }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.id ?? null
}

export async function assignDiscordRole(discordUserId: string, roleId: string): Promise<boolean> {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUserId}/roles/${roleId}`,
    { method: 'PUT', headers: { Authorization: `Bot ${BOT_TOKEN}` } },
  )
  return res.ok || res.status === 204
}

export async function removeDiscordRole(discordUserId: string, roleId: string): Promise<boolean> {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUserId}/roles/${roleId}`,
    { method: 'DELETE', headers: { Authorization: `Bot ${BOT_TOKEN}` } },
  )
  return res.ok || res.status === 204
}

export async function deleteDiscordRole(roleId: string): Promise<boolean> {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/roles/${roleId}`,
    { method: 'DELETE', headers: { Authorization: `Bot ${BOT_TOKEN}` } },
  )
  return res.ok || res.status === 204
}

// ── 스크림 음성채널 생성 (팀별 각 1개) ──

export async function createScrimVoiceChannels(
  team1Abbr: string,
  team2Abbr: string,
  team1DiscordIds: string[],
  team2DiscordIds: string[],
): Promise<{ team1ChannelId: string | null; team2ChannelId: string | null }> {
  const categoryId = await getOrCreateScrimCategory()

  const makeChannel = async (teamAbbr: string, memberIds: string[]) => {
    const permissionOverwrites = [
      { id: GUILD_ID, type: 0, allow: '0', deny: EVERYONE_DENY },
      ...memberIds.filter(Boolean).map(id => ({
        id,
        type: 1,
        allow: MEMBER_ALLOW,
        deny: '0',
      })),
    ]

    const body: { name: string; type: number; permission_overwrites: typeof permissionOverwrites; parent_id?: string } = {
      name: teamAbbr,
      type: 2,
      permission_overwrites: permissionOverwrites,
    }
    if (categoryId) body.parent_id = categoryId

    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
      method: 'POST',
      headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id ?? null
  }

  const [team1ChannelId, team2ChannelId] = await Promise.all([
    makeChannel(team1Abbr, team1DiscordIds),
    makeChannel(team2Abbr, team2DiscordIds),
  ])

  return { team1ChannelId, team2ChannelId }
}

// ── 매치 로비: 양 팀이 함께 보는 텍스트 채널 + 리치 임베드 ──
export async function createMatchLobby(opts: {
  matchId: string
  team1: { name: string; tierAvg?: string | null }
  team2: { name: string; tierAvg?: string | null }
  format: string
  matchDate?: string | null
  memberIds: string[]
}): Promise<string | null> {
  const categoryId = await getOrCreateScrimCategory()

  const permissionOverwrites = [
    { id: GUILD_ID, type: 0, allow: '0', deny: EVERYONE_DENY },
    ...opts.memberIds.filter(Boolean).map((id) => ({ id, type: 1, allow: TEXT_MEMBER_ALLOW, deny: '0' })),
  ]

  const body: { name: string; type: number; topic: string; permission_overwrites: typeof permissionOverwrites; parent_id?: string } = {
    name: `📋ㆍ${opts.team1.name}-vs-${opts.team2.name}`,
    type: 0, // GUILD_TEXT
    topic: `${opts.team1.name} vs ${opts.team2.name} 스크림 로비`,
    permission_overwrites: permissionOverwrites,
  }
  if (categoryId) body.parent_id = categoryId

  const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  const channel = await res.json()
  const channelId: string | null = channel.id ?? null
  if (!channelId) return null

  // Discord 타임스탬프(<t:UNIX:F>)는 각 유저 로컬 시간으로 자동 표시
  const ts = opts.matchDate ? `<t:${Math.floor(new Date(opts.matchDate).getTime() / 1000)}:F>` : '미정'
  const embed = {
    title: `⚔️  ${opts.team1.name}  vs  ${opts.team2.name}`,
    description: '스크림 매치가 잡혔어요! 정보 확인하고 각 팀 대기실에서 만나요.',
    color: 0xff4655,
    fields: [
      { name: '포맷', value: opts.format || 'BO3', inline: true },
      { name: '일정', value: ts, inline: true },
      { name: '​', value: '​', inline: false },
      { name: `🔴 ${opts.team1.name}`, value: opts.team1.tierAvg ? `평균 ${opts.team1.tierAvg}` : '—', inline: true },
      { name: `🔵 ${opts.team2.name}`, value: opts.team2.tierAvg ? `평균 ${opts.team2.tierAvg}` : '—', inline: true },
    ],
    footer: { text: 'D31.GG · 스크림 매칭' },
  }
  const components = [{
    type: 1,
    components: [{ type: 2, style: 5, label: '매치 상세 보기', url: `${SITE_URL}/matches/${opts.matchId}` }],
  }]

  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed], components }),
  })

  return channelId
}

// 하위 호환용 (기존 코드에서 사용 중인 경우)
export async function createScrimVoiceChannel(
  team1Abbr: string,
  team2Abbr: string,
  discordIds: string[],
): Promise<string | null> {
  const { team1ChannelId } = await createScrimVoiceChannels(team1Abbr, team2Abbr, discordIds, [])
  return team1ChannelId
}

export async function deleteDiscordChannel(channelId: string): Promise<void> {
  await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  })
}

// 채널에서 특정 유저 권한 제거
export async function removeChannelPermission(channelId: string, discordUserId: string): Promise<void> {
  await fetch(`https://discord.com/api/v10/channels/${channelId}/permissions/${discordUserId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  })
}
