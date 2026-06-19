'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient()

      // hash fragment에서 토큰 파싱 (implicit flow)
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error || !session) {
          router.replace('/login?error=' + encodeURIComponent(error?.message ?? 'set_session_failed'))
          return
        }

        const user = session.user

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
          router.replace('/onboarding')
        } else {
          router.replace(existing.riot_puuid ? '/dashboard' : '/onboarding')
        }
        return
      }

      // PKCE code 방식 시도
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.replace('/login?error=' + encodeURIComponent(error.message))
          return
        }
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/login?error=no_session_after_exchange')
          return
        }
        const user = session.user
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
          router.replace('/onboarding')
        } else {
          router.replace(existing.riot_puuid ? '/dashboard' : '/onboarding')
        }
        return
      }

      router.replace('/login?error=no_token')
    }

    handle()
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-[#00D2BE] border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">로그인 처리 중...</p>
    </div>
  )
}
