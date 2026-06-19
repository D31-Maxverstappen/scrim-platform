'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const game = searchParams.get('game') // 'valorant' | 'lol' | null
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const supabase = createClient()

    if (tab === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('가입 완료! 이메일 인증 없이 바로 로그인 가능해요.')
        setTab('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 틀렸어요.' : error.message)
      } else {
        // 이미 라이엇 계정 연동했으면 대시보드로, 아니면 온보딩으로
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: userData } = await supabase.from('users').select('riot_puuid').eq('id', (await supabase.auth.getUser()).data.user!.id).single()
        const onboardingUrl = game === 'lol' ? '/onboarding?add=lol' : '/onboarding'
        router.replace(userData?.riot_puuid ? '/dashboard' : onboardingUrl)
      }
    }

    setLoading(false)
  }

  const handleDiscordLogin = async () => {
    setDiscordLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00D2BE]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-6">
        <div className="text-center mb-8">
          <a href="/" className="text-white font-extrabold text-4xl tracking-widest hover:text-[#00D2BE] transition">
            D31
          </a>
          <p className="text-slate-500 text-sm mt-2">Korea's First Scrim Platform</p>
        </div>

        <div className="bg-[#1e1e2e]/80 backdrop-blur border border-white/10 rounded p-8 flex flex-col gap-5 shadow-2xl">

          {/* 탭 */}
          <div className="flex bg-white/5 rounded p-1">
            <button
              onClick={() => { setTab('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2  text-sm font-semibold transition ${tab === 'login' ? 'bg-[#00D2BE] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              로그인
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); setSuccess('') }}
              className={`flex-1 py-2  text-sm font-semibold transition ${tab === 'signup' ? 'bg-[#00D2BE] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              회원가입
            </button>
          </div>

          {/* 디스코드 로그인 */}
          <button
            onClick={handleDiscordLogin}
            disabled={discordLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-50 text-white font-semibold py-3 rounded transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            {discordLoading ? '연결 중...' : 'Discord로 로그인'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">또는</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition"
            />
            <input
              type="password"
              required
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition"
            />

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded px-4 py-3">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-semibold py-3 rounded transition"
            >
              {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          <a href="/" className="hover:text-slate-400 transition">← 메인으로 돌아가기</a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
