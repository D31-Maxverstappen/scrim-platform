'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13]">
      <div className="bg-[#1e1e2e] rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white">🎮 스크림 플랫폼</h1>
        <p className="text-slate-400 text-sm text-center">
          발로란트 &amp; 리그 오브 레전드<br />스크림 매칭 플랫폼
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition"
        >
          Discord로 로그인
        </button>
      </div>
    </div>
  )
}
