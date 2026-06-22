import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const pendingCookies: { name: string; value: string; options: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  const user = data.session?.user
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  const discordId = user.user_metadata?.provider_id ?? user.user_metadata?.sub ?? null
  const discordName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
  const discordAvatar = user.user_metadata?.avatar_url ?? null
  const providerToken = data.session?.provider_token ?? null

  const { data: existing } = await supabase
    .from('users')
    .select('id, riot_puuid')
    .eq('id', user.id)
    .single()

  if (!existing) {
    await supabase.from('users').insert({
      id: user.id,
      riot_gamename: discordName,
      avatar_url: discordAvatar,
      discord_id: discordId ?? null,
      discord_access_token: providerToken,
    })
  } else {
    await supabase.from('users').update({
      discord_id: discordId ?? null,
      discord_access_token: providerToken,
    }).eq('id', user.id)
  }

  const invitePending = request.cookies.get('invite_pending')?.value
  let redirectTo: string
  if (invitePending && existing?.riot_puuid) {
    redirectTo = `/invite/${invitePending}`
  } else {
    redirectTo = (!existing || !existing.riot_puuid) ? '/onboarding' : '/dashboard'
  }

  const response = NextResponse.redirect(`${origin}${redirectTo}`)

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  // 초대 쿠키 소비
  if (invitePending) response.cookies.delete('invite_pending')

  return response
}
