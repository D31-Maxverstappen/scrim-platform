const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!

const MEMBER_ALLOW = '3146752' // VIEW_CHANNEL | CONNECT | SPEAK
const EVERYONE_DENY = '1024'   // VIEW_CHANNEL

const SCRIM_CATEGORY_NAME = '🎮 스크림'

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
