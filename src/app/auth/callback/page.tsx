'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSSRClient } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      // 일반 supabase-js 클라이언트 - hash fragment 자동 감지
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { detectSessionInUrl: true, persistSession: true } }
      )

      // hash/code 처리 대기
      await new Promise(r => setTimeout(r, 800))

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.replace('/login?error=' + encodeURIComponent(error?.message ?? 'no_session'))
        return
      }

      // SSR 클라이언트에도 세션 동기화
      const ssrClient = createSSRClient()
      await ssrClient.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })

      const user = session.user

      const { data: existing } = await ssrClient
        .from('users')
        .select('id, riot_puuid')
        .eq('id', user.id)
        .single()

      if (!existing) {
        const discordName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
        const discordAvatar = user.user_metadata?.avatar_url ?? null
        await ssrClient.from('users').insert({
          id: user.id,
          email: user.email,
          riot_gamename: discordName,
          avatar_url: discordAvatar,
        })
        router.replace('/onboarding')
      } else {
        router.replace(existing.riot_puuid ? '/dashboard' : '/onboarding')
      }
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
