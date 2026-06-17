'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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
        router.replace(userData?.riot_puuid ? '/dashboard' : '/onboarding')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-6">
        <div className="text-center mb-8">
          <a href="/" className="text-white font-extrabold text-4xl tracking-widest hover:text-indigo-400 transition">
            D31
          </a>
          <p className="text-slate-500 text-sm mt-2">Korea's First Scrim Platform</p>
        </div>

        <div className="bg-[#1e1e2e]/80 backdrop-blur border border-white/10 rounded-2xl p-8 flex flex-col gap-5 shadow-2xl">

          {/* 탭 */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => { setTab('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'login' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              로그인
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); setSuccess('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signup' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
            <input
              type="password"
              required
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
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
