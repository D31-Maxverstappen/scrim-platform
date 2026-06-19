import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { accessToken } = await req.json()
  if (!accessToken) return NextResponse.json({ error: 'No access token' }, { status: 400 })

  const botToken = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID
  if (!botToken || !guildId) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

  // Discord 유저 ID는 user_metadata에서 가져옴
  const discordUserId = user.user_metadata?.provider_id ?? user.identities?.find((i: any) => i.provider === 'discord')?.identity_data?.sub

  if (!discordUserId) return NextResponse.json({ error: 'Discord user ID not found' }, { status: 400 })

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ access_token: accessToken }),
  })

  // 201 = 추가됨, 204 = 이미 멤버
  if (res.status === 201 || res.status === 204) {
    return NextResponse.json({ success: true })
  }

  const error = await res.json().catch(() => ({}))
  return NextResponse.json({ error: 'Discord API error', detail: error }, { status: res.status })
}
