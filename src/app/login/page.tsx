'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center relative overflow-hidden">

      {/* 배경 글로우 효과 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 로그인 카드 */}
      <div className="relative z-10 w-full max-w-sm mx-6">

        {/* 로고 */}
        <div className="text-center mb-8">
          <a href="/" className="text-white font-extrabold text-4xl tracking-widest hover:text-indigo-400 transition">
            D31
          </a>
          <p className="text-slate-500 text-sm mt-2">Korea&apos;s First Scrim Platform</p>
        </div>

        {/* 카드 */}
        <div className="bg-[#1e1e2e]/80 backdrop-blur border border-white/10 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">
          <div className="text-center">
            <h2 className="text-white font-bold text-xl mb-1">시작하기</h2>
            <p className="text-slate-400 text-sm">Discord 계정으로 간편하게 로그인하세요</p>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-3 rounded-xl transition cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.907 19.907 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Discord로 로그인
          </button>

          <p className="text-center text-slate-600 text-xs">
            로그인 시{' '}
            <span className="text-slate-400">서비스 이용약관</span>
            {' '}및{' '}
            <span className="text-slate-400">개인정보처리방침</span>
            에 동의하게 됩니다.
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          <a href="/" className="hover:text-slate-400 transition">← 메인으로 돌아가기</a>
        </p>
      </div>
    </div>
  )
}
