'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const supabase = createClient()

    // 이미 세션 있으면 바로 이동
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
        return
      }

      // 세션 변화 감지 (싱글톤 클라이언트가 URL의 code를 자동 교환함)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe()
          router.replace('/dashboard')
        }
      })

      // 15초 타임아웃
      setTimeout(() => {
        subscription.unsubscribe()
        router.replace('/login')
      }, 15000)
    })
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
