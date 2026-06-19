import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    const msg = encodeURIComponent(error?.message ?? 'no session')
    return NextResponse.redirect(`${origin}/login?error=${msg}`)
  }

  const session = data.session
  const user = session.user

  // users 테이블에 없으면 생성
  const { data: existing } = await supabase
    .from('users')
    .select('id, riot_puuid')
    .eq('id', user.id)
    .single()

  if (!existing) {
    const discordName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
    const discordAvatar = user.user_metadata?.avatar_url ?? null
    await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      riot_gamename: discordName,
      avatar_url: discordAvatar,
    })
  }

  // Discord 서버 자동 참여
  const providerToken = session.provider_token
  const discordUserId = user.user_metadata?.provider_id ?? user.identities?.find((i: any) => i.provider === 'discord')?.identity_data?.sub
  const botToken = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID

  if (providerToken && discordUserId && botToken && guildId) {
    await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: providerToken }),
    }).catch(() => {})
  }

  const isNew = !existing
  const hasRiot = existing?.riot_puuid
  return NextResponse.redirect(`${origin}${isNew || !hasRiot ? '/onboarding' : '/dashboard'}`)
}
