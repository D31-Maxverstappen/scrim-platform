'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // createBrowserClient가 URL의 code를 자동으로 교환함 — 결과만 기다림
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/dashboard')
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // 아무것도 안 함
      }
    })

    // 이미 로그인된 경우 바로 처리
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })

    // 10초 지나도 안 되면 로그인으로
    const timer = setTimeout(() => router.replace('/login'), 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">로그인 처리 중...</p>
      </div>
    </div>
  )
}
