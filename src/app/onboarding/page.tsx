'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const GAMES = [
  { value: 'lol', label: '리그 오브 레전드', tag: 'KR1', placeholder: '소환사명' },
  { value: 'valorant', label: '발로란트', tag: 'KR1', placeholder: '라이엇 ID' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [game, setGame] = useState('lol')
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('KR1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ account: { gameName: string; tagLine: string }; tier: string | null; debug?: string | null } | null>(null)

  const handleVerify = async () => {
    if (!gameName.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/riot/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: gameName.trim(), tagLine: tagLine.trim(), gameType: game }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
    } else {
      setResult(data)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <span className="text-white font-black text-3xl tracking-widest bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">D31</span>
          <h1 className="text-white font-bold text-xl mt-4 mb-1">게임 계정 연동</h1>
          <p className="text-slate-500 text-sm">라이엇 계정을 연결해서 티어를 자동으로 가져와요</p>
        </div>

        <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">

          {/* 게임 선택 */}
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">게임</label>
            <div className="grid grid-cols-2 gap-2">
              {GAMES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => { setGame(g.value); setTagLine(g.tag); setResult(null); setError('') }}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    game === g.value ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 라이엇 ID 입력 */}
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">라이엇 ID</label>
            <div className="flex gap-2">
              <input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder={GAMES.find(g => g.value === game)?.placeholder}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition text-sm"
              />
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-3">
                <span className="text-slate-500 text-sm">#</span>
                <input
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value)}
                  className="w-14 bg-transparent text-white text-sm focus:outline-none"
                />
              </div>
            </div>
            <p className="text-slate-600 text-xs mt-1.5">예: 페이커#KR1</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          {result && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-green-400 text-sm font-semibold">{result.account.gameName}#{result.account.tagLine}</p>
              {result.tier ? (
                <p className="text-slate-300 text-xs mt-0.5">티어: {result.tier}</p>
              ) : (
                <p className="text-slate-500 text-xs mt-0.5">{result.debug ?? '언랭 또는 티어 정보 없음'}</p>
              )}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || !gameName.trim()}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            {loading ? '확인 중...' : result ? '✓ 연동 완료 — 다시 인증하기' : '계정 인증하기'}
          </button>

          {result && (
            <button
              onClick={() => router.replace('/dashboard')}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              대시보드로 이동 →
            </button>
          )}
        </div>

        <button
          onClick={() => router.replace('/dashboard')}
          className="w-full text-center text-slate-600 text-xs mt-4 hover:text-slate-400 transition"
        >
          나중에 하기
        </button>
      </div>
    </div>
  )
}
