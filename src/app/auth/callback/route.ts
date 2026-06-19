import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // users 테이블에 없으면 생성
      const { data: existing } = await supabase
        .from('users')
        .select('id, riot_puuid')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        const discordName = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null
        const discordAvatar = data.user.user_metadata?.avatar_url ?? null
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          riot_gamename: discordName,
          avatar_url: discordAvatar,
        })
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}/${existing.riot_puuid ? 'dashboard' : 'onboarding'}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
