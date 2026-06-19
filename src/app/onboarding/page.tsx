'use client'

import { useState, useEffect } from 'react'
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

function DoneStep({ valProfile, lolProfile, onGo }: {
  valProfile: GameProfile | null
  lolProfile: GameProfile | null
  onGo: () => void
}) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(true)

  useEffect(() => {
    fetch('/api/discord/invite')
      .then(r => r.json())
      .then(d => { if (d.inviteUrl) setInviteUrl(d.inviteUrl) })
      .finally(() => setInviteLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-2">설정 완료!</h2>
        <div className="flex flex-col gap-1.5 mb-6 text-sm">
          {valProfile && <p className="text-[#ff4655]">VALORANT · {valProfile.gameName}#{valProfile.tagLine} · {valProfile.tier}</p>}
          {lolProfile && <p className="text-[#c89b3c]">League of Legends · {lolProfile.gameName}#{lolProfile.tagLine} · {lolProfile.tier}</p>}
          {!valProfile && !lolProfile && <p className="text-slate-500">나중에 프로필에서 등록할 수 있어요</p>}
        </div>

        {/* Discord 서버 초대 카드 */}
        <div className="bg-[#1e1e2e] border border-[#5865F2]/30 rounded-lg p-5 mb-4 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#5865F2]/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">D31 공식 Discord 서버</p>
              <p className="text-slate-500 text-xs">스크림 공지, 팀원 모집, 커뮤니티</p>
            </div>
          </div>
          {inviteLoading ? (
            <div className="w-full h-10 bg-white/5 rounded animate-pulse" />
          ) : inviteUrl ? (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-2.5 rounded transition text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              서버 참여하기
            </a>
          ) : (
            <p className="text-slate-500 text-xs text-center">초대 링크를 불러올 수 없어요. 나중에 다시 시도해주세요.</p>
          )}
        </div>

        <button onClick={onGo} className="w-full bg-[#00D2BE] hover:bg-[#00a896] text-white font-bold py-3 rounded transition">
          대시보드로 이동 →
        </button>
        <p className="text-slate-600 text-xs mt-3">Discord 서버는 나중에 참여해도 돼요</p>
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
    return <DoneStep valProfile={valProfile} lolProfile={lolProfile} onGo={() => router.replace('/dashboard')} />
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
