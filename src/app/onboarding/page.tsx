'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const LOL_TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger', 'Unranked']
const VAL_TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant', 'Unranked']

type GameProfile = { gameName: string; tagLine: string; tier: string }

function GameForm({
  gameType, color, label, tiers, onSave, onSkip, saved,
}: {
  gameType: string; color: string; label: string; tiers: string[]
  onSave: (p: GameProfile) => void; onSkip: () => void; saved: GameProfile | null
}) {
  const [gameName, setGameName] = useState(saved?.gameName ?? '')
  const [tagLine, setTagLine] = useState(saved?.tagLine ?? 'KR1')
  const [tier, setTier] = useState(saved?.tier ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!gameName.trim() || !tier) return
    setLoading(true); setError('')
    const res = await fetch('/api/riot/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: gameName.trim(), tagLine: tagLine.trim(), gameType, tier }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) setError(data.error)
    else onSave({ gameName: gameName.trim(), tagLine: tagLine.trim(), tier })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-2 h-8 rounded-full" style={{ background: color }} />
        <h2 className="text-white font-bold text-lg">{label}</h2>
        {saved && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">저장됨 ✓</span>}
      </div>

      <div>
        <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">라이엇 ID</label>
        <div className="flex gap-2">
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="닉네임"
            className="flex-1 bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition text-sm"
          />
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-3">
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

      <div>
        <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">현재 티어</label>
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((t) => (
            <button key={t} type="button" onClick={() => setTier(t)}
              className={`py-2 rounded text-xs font-semibold transition ${tier === t ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-4 py-3">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading || !gameName.trim() || !tier}
          className="flex-1 bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-bold py-3 rounded transition text-sm"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
        <button onClick={onSkip} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-semibold rounded transition">
          건너뛰기
        </button>
      </div>
    </div>
  )
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const add = searchParams.get('add') // 'lol' | 'valorant' | null
  const [step, setStep] = useState<'val' | 'lol' | 'done'>(add === 'lol' ? 'lol' : 'val')
  const [valProfile, setValProfile] = useState<GameProfile | null>(null)
  const [lolProfile, setLolProfile] = useState<GameProfile | null>(null)

  const handleValSave = (p: GameProfile) => { setValProfile(p); setStep('lol') }
  const handleLolSave = (p: GameProfile) => { setLolProfile(p); setStep('done') }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-xl mb-4">설정 완료!</h2>
          <div className="flex flex-col gap-2 mb-8 text-sm">
            {valProfile && <p className="text-[#ff4655]">VALORANT · {valProfile.gameName}#{valProfile.tagLine} · {valProfile.tier}</p>}
            {lolProfile && <p className="text-[#c89b3c]">League of Legends · {lolProfile.gameName}#{lolProfile.tagLine} · {lolProfile.tier}</p>}
            {!valProfile && !lolProfile && <p className="text-slate-500">나중에 프로필에서 등록할 수 있어요</p>}
          </div>
          <button onClick={() => router.replace('/dashboard')} className="w-full bg-[#00D2BE] hover:bg-[#00a896] text-white font-bold py-3 rounded transition">
            대시보드로 이동 →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-white font-black text-3xl tracking-widest bg-gradient-to-r from-[#00D2BE] to-[#00edd6] bg-clip-text text-transparent">D31</span>
          <h1 className="text-white font-bold text-xl mt-4 mb-1">프로필 설정</h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`w-8 h-1.5 rounded-full transition-all ${step === 'val' ? 'bg-[#ff4655]' : 'bg-[#ff4655]/80'}`} />
            <div className={`w-8 h-1.5 rounded-full transition-all ${step === 'lol' ? 'bg-[#c89b3c]' : 'bg-white/10'}`} />
          </div>
        </div>

        <div className="bg-[#111118] border border-white/5 rounded p-6">
          {step === 'val' && (
            <GameForm
              gameType="valorant" color="#ff4655" label="VALORANT"
              tiers={VAL_TIERS} saved={valProfile}
              onSave={handleValSave} onSkip={() => setStep('lol')}
            />
          )}
          {step === 'lol' && (
            <GameForm
              gameType="lol" color="#c89b3c" label="League of Legends"
              tiers={LOL_TIERS} saved={lolProfile}
              onSave={handleLolSave} onSkip={() => setStep('done')}
            />
          )}
        </div>

        <button onClick={() => router.replace('/dashboard')} className="w-full text-center text-slate-600 text-xs mt-4 hover:text-slate-400 transition">
          나중에 하기
        </button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
