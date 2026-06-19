'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient()

      // hash fragment 방식(implicit flow) 처리
      // onAuthStateChange가 hash를 감지하고 세션을 설정함
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()

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
            router.replace('/onboarding')
          } else {
            router.replace(existing.riot_puuid ? '/dashboard' : '/onboarding')
          }
        } else if (event === 'SIGNED_OUT') {
          subscription.unsubscribe()
          router.replace('/login')
        }
      })

      // 5초 후에도 이벤트 없으면 로그인 페이지로
      setTimeout(() => {
        subscription.unsubscribe()
        router.replace('/login?error=timeout')
      }, 5000)
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
