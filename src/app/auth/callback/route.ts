import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const response = NextResponse.redirect(`${origin}/dashboard`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
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
      email: user.email,
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

  if (discordId) {
    fetch(`${origin}/api/discord/dm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId }),
    }).catch(() => {})
  }

  const redirectTo = (!existing || !existing.riot_puuid) ? '/onboarding' : '/dashboard'
  response.headers.set('location', `${origin}${redirectTo}`)
  return response
}
