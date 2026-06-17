'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [msg, setMsg] = useState('로그인 처리 중...')

  useEffect(() => {
    const code = params.get('code')
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      setMsg(`OAuth 오류: ${error} - ${errorDescription}`)
      return
    }

    if (!code) {
      setMsg('코드 없음 - URL: ' + window.location.href)
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ data, error: exchError }) => {
      if (exchError) {
        setMsg(`교환 실패: ${exchError.message} | status: ${exchError.status} | code: ${code.slice(0, 20)}`)
        return
      }
      if (!data.session) {
        setMsg('세션 없음 (error 없음)')
        return
      }
      router.replace('/dashboard')
    })
  }, [params, router])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300 text-sm break-all">{msg}</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
}
