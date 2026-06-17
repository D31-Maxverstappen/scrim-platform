'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function ConfirmContent() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')

  useEffect(() => {
    if (!code) {
      router.replace('/login')
      return
    }

    const supabase = createClient()

    // 브라우저 클라이언트가 직접 코드 → 세션 교환 + 쿠키 저장
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace('/login')
      } else {
        router.replace('/dashboard')
      }
    })
  }, [code, router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">로그인 중...</p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
