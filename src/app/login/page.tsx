'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const url = searchParams.get('url')

  const handleDiscordLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'identify email',
      },
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setEmailError('이메일 또는 비밀번호가 올바르지 않아요')
      setEmailLoading(false)
    } else {
      router.push('/valorant/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00D2BE]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-6">
        <div className="text-center mb-8">
          <a href="/" className="flex justify-center">
            <Image src="/logo.png" alt="D31" width={120} height={120} className="object-contain" />
          </a>
          <p className="text-slate-500 text-sm mt-2">Korea's First Scrim Platform</p>
        </div>

        <div className="bg-[#1e1e2e]/80 backdrop-blur border border-white/10 rounded p-8 flex flex-col gap-5 shadow-2xl">
          <p className="text-white font-black text-3xl text-center">로그인</p>

          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-50 text-white font-semibold py-4 rounded transition text-base"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
            </svg>
            {loading ? '연결 중...' : 'Discord로 로그인 / 회원가입'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">또는</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-white/30"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-white/30"
            />
            {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-semibold py-3 rounded transition text-sm"
            >
              {emailLoading ? '로그인 중...' : '이메일로 로그인'}
            </button>
          </form>

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2 break-all">
              <p className="font-bold mb-1">{decodeURIComponent(error)}</p>
              {url && <p className="text-slate-400">{decodeURIComponent(url)}</p>}
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          <a href="/" className="hover:text-white transition">← 메인으로 돌아가기</a>
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
