'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient()

      // PKCE 코드 교환
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      // Discord 유저면 서버 자동 참여
      if (session.provider_token && session.user.app_metadata?.provider === 'discord') {
        fetch('/api/discord/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.provider_token }),
        }).catch(() => {})
      }

      // users 테이블에 없으면 생성 (Discord 신규 유저)
      const { data: existing } = await supabase
        .from('users')
        .select('id, riot_puuid')
        .eq('id', session.user.id)
        .single()

      if (!existing) {
        const discordName = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null
        const discordAvatar = session.user.user_metadata?.avatar_url ?? null
        await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email,
          riot_gamename: discordName,
          avatar_url: discordAvatar,
        })
        router.replace('/onboarding')
        return
      }

      router.replace(existing.riot_puuid ? '/dashboard' : '/onboarding')
    }

    handle()
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00D2BE] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
