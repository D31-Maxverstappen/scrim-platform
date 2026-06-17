'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Suspense } from 'react'

function ConfirmContent() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')
  const [status, setStatus] = useState('로그인 처리 중...')

  useEffect(() => {
    if (!code) {
      router.replace('/login')
      return
    }

    // 싱글톤 아닌 새 클라이언트로 코드 교환 — 캐시 충돌 없음
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { isSingleton: false }
    )

    supabase.auth.exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error || !data.session) {
          setStatus('로그인 실패. 다시 시도해주세요.')
          setTimeout(() => router.replace('/login'), 2000)
        } else {
          router.replace('/dashboard')
        }
      })
  }, [code, router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">{status}</p>
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
