const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!

// VIEW_CHANNEL | CONNECT | SPEAK
const MEMBER_ALLOW = '3146752'
// VIEW_CHANNEL
const EVERYONE_DENY = '1024'

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

export async function createScrimVoiceChannel(
  team1Abbr: string,
  team2Abbr: string,
  discordIds: string[],
): Promise<string | null> {
  const permissionOverwrites = [
    // @everyone 숨김
    { id: GUILD_ID, type: 0, allow: '0', deny: EVERYONE_DENY },
    // 양 팀 멤버만 허용
    ...discordIds.filter(Boolean).map(id => ({
      id,
      type: 1,
      allow: MEMBER_ALLOW,
      deny: '0',
    })),
  ]

  const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `${team1Abbr} vs ${team2Abbr}`,
      type: 2, // GUILD_VOICE
      permission_overwrites: permissionOverwrites,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.id ?? null
}

export async function deleteDiscordChannel(channelId: string): Promise<void> {
  await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  })
}
