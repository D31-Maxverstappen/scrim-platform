'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const GAMES = [
  { value: 'lol', label: '리그 오브 레전드', tag: 'KR1' },
  { value: 'valorant', label: '발로란트', tag: 'KR1' },
]

const LOL_TIERS = [
  'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger', 'Unranked',
]

const VAL_TIERS = [
  'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant', 'Unranked',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [game, setGame] = useState('lol')
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('KR1')
  const [tier, setTier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const tiers = game === 'lol' ? LOL_TIERS : VAL_TIERS

  const handleSubmit = async () => {
    if (!gameName.trim() || !tier) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/riot/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: gameName.trim(), tagLine: tagLine.trim(), gameType: game, tier }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) setError(data.error)
    else setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">연동 완료!</h2>
          <p className="text-slate-500 text-sm mb-8">{gameName}#{tagLine} · {tier}</p>
          <button
            onClick={() => router.replace('/dashboard')}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] text-white font-bold py-3 rounded-xl transition"
          >
            대시보드로 이동 →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <span className="text-white font-black text-3xl tracking-widest bg-gradient-to-r from-[#00D2BE] to-[#00edd6] bg-clip-text text-transparent">D31</span>
          <h1 className="text-white font-bold text-xl mt-4 mb-1">프로필 설정</h1>
          <p className="text-slate-500 text-sm">게임 계정과 티어를 입력해주세요</p>
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
                  onClick={() => { setGame(g.value); setTagLine(g.tag); setTier('') }}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition ${
                    game === g.value ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 라이엇 ID */}
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">라이엇 ID</label>
            <div className="flex gap-2">
              <input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="닉네임"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition text-sm"
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

          {/* 티어 선택 */}
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">현재 티어</label>
            <div className="grid grid-cols-3 gap-2">
              {tiers.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`py-2 rounded-xl text-xs font-semibold transition ${
                    tier === t ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !gameName.trim() || !tier}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
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
