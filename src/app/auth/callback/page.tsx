'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient()

      // @supabase/ssr이 초기화 시 hash/code를 자동 처리함 - 잠깐 대기 후 세션 확인
      await new Promise(r => setTimeout(r, 500))

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.replace('/login?error=' + encodeURIComponent(error?.message ?? 'no_session'))
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
