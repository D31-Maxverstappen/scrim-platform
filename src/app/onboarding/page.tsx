'use client'
import Link from 'next/link'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

const VAL_TIERS = [
  'Iron 3', 'Iron 2', 'Iron 1',
  'Bronze 3', 'Bronze 2', 'Bronze 1',
  'Silver 3', 'Silver 2', 'Silver 1',
  'Gold 3', 'Gold 2', 'Gold 1',
  'Platinum 3', 'Platinum 2', 'Platinum 1',
  'Diamond 3', 'Diamond 2', 'Diamond 1',
  'Ascendant 3', 'Ascendant 2', 'Ascendant 1',
  'Immortal 3', 'Immortal 2', 'Immortal 1',
  'Radiant',
]

type GameProfile = { gameName: string; tagLine: string; tier: string }

function GameForm({
  gameType, color, label, tiers, onSave, onSkip, onBack, saved, coachMode = false,
}: {
  gameType: string; color: string; label: string; tiers: string[]
  onSave: (p: GameProfile) => void; onSkip?: () => void; onBack?: () => void
  saved: GameProfile | null; coachMode?: boolean
}) {
  const [gameName, setGameName] = useState(saved?.gameName ?? '')
  const [tagLine, setTagLine] = useState(saved?.tagLine ?? 'KR1')
  const [tier, setTier] = useState(saved?.tier ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 코치는 티어 없이 라이엇 연동(신원확인)만, 선수는 라이엇 ID + 티어 필수.
  const canSave = coachMode ? !!gameName.trim() : (!!gameName.trim() && !!tier)

  const handleSave = async () => {
    if (!canSave) return
    setLoading(true); setError('')
    const res = await fetch('/api/riot/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameName: gameName.trim(), tagLine: tagLine.trim(), gameType,
        tier: coachMode ? undefined : tier,
        accountType: coachMode ? 'coach' : 'player',
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) setError(data.error)
    else onSave({ gameName: gameName.trim(), tagLine: tagLine.trim(), tier: coachMode ? '' : tier })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-2 h-8 rounded-none" style={{ background: color }} />
        <h2 className="text-white font-bold text-lg">{label}</h2>
        {saved && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">저장됨 ✓</span>}
      </div>

      <div>
        <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">라이엇 ID</label>
        <div className="flex gap-2">
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="닉네임"
            className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition text-sm"
          />
          <div className="shrink-0 flex items-center gap-1 bg-white/5 border border-white/10 rounded px-3">
            <span className="text-slate-500 text-sm">#</span>
            <input
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              className="w-14 bg-transparent text-white text-sm focus:outline-none"
            />
          </div>
        </div>
        <p className="text-slate-600 text-xs mt-1.5">
          {coachMode ? '코치 본인 확인용으로 연동돼요 · 예: 페이커#KR1' : '예: 페이커#KR1'}
        </p>
      </div>

      {!coachMode && (
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
      )}

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-4 py-3">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading || !canSave}
          className="flex-1 bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-bold py-3 rounded transition text-sm"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
        {coachMode
          ? (onBack && (
              <button onClick={onBack} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-semibold rounded transition">
                뒤로
              </button>
            ))
          : (onSkip && (
              <button onClick={onSkip} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-semibold rounded transition">
                건너뛰기
              </button>
            ))}
      </div>
    </div>
  )
}

// 가입 시 선수/코치 선택 (계정 유형은 가입 시 고정)
function RoleStep({ onSelect }: { onSelect: (role: 'player' | 'coach') => void }) {
  const cards: { role: 'player' | 'coach'; emoji: string; title: string; desc: string; color: string }[] = [
    { role: 'player', emoji: '🎮', title: '선수', desc: '팀에 소속돼 스크림을 뛰어요. 라이엇 ID와 티어를 등록해요.', color: '#ff4655' },
    { role: 'coach', emoji: '📋', title: '코치', desc: '여러 팀의 전략·피드백을 맡아요. 티어 없이 라이엇 연동만 해요.', color: '#60a5fa' },
  ]
  return (
    <div className="flex flex-col gap-3">
      {cards.map((c) => (
        <button key={c.role} onClick={() => onSelect(c.role)}
          className="flex items-center gap-4 bg-white/3 border border-white/10 hover:border-white/30 rounded p-5 text-left transition group">
          <div className="w-12 h-12 shrink-0 rounded flex items-center justify-center text-2xl"
            style={{ background: `${c.color}1a` }}>{c.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base" style={{ color: c.color }}>{c.title}</p>
            <p className="text-slate-500 text-xs mt-0.5">{c.desc}</p>
          </div>
          <span className="text-slate-600 group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      ))}
    </div>
  )
}

function DoneStep({ valProfile, isCoach, onGo }: {
  valProfile: GameProfile | null
  isCoach: boolean
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
      <div className="w-full max-w-sm">
        {/* 완료 헤더 */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#00D2BE]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#00D2BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-xl mb-1">프로필 설정 완료!</h2>
          <div className="flex flex-col gap-1 text-xs mt-2">
            {valProfile && (
              <p style={{ color: isCoach ? '#60a5fa' : '#ff4655' }}>
                {isCoach
                  ? `코치 · ${valProfile.gameName}#${valProfile.tagLine}`
                  : `VALORANT · ${valProfile.gameName}#${valProfile.tagLine} · ${valProfile.tier}`}
              </p>
            )}
            {!valProfile && <p className="text-slate-500">나중에 프로필에서 등록할 수 있어요</p>}
          </div>
        </div>

        {/* 다음 단계 */}
        <div className="bg-[#111118] border border-white/5 rounded p-5 mb-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">다음 단계</p>
          <div className="flex flex-col gap-2">
            {!isCoach && (
              <Link href="/teams/create"
                className="flex items-center gap-3 bg-[#00D2BE]/10 border border-[#00D2BE]/20 hover:border-[#00D2BE]/40 rounded px-4 py-3.5 transition group">
                <div className="w-8 h-8 bg-[#00D2BE]/20 rounded flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#00D2BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">새 팀 만들기</p>
                  <p className="text-slate-500 text-xs">팀을 만들고 캡틴이 되세요</p>
                </div>
                <span className="text-[#00D2BE] text-sm group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            )}
            <Link href="/teams"
              className="flex items-center gap-3 bg-white/3 border border-white/5 hover:border-white/10 rounded px-4 py-3.5 transition group">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{isCoach ? '맡을 팀 찾기' : '팀 찾아 가입하기'}</p>
                <p className="text-slate-500 text-xs">{isCoach ? '팀에 코치로 합류하세요' : '기존 팀에 합류하세요'}</p>
              </div>
              <span className="text-slate-500 text-sm group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Discord */}
        <div className="bg-[#1e1e2e] border border-[#5865F2]/30 rounded p-4 mb-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#5865F2]/20 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-xs">D31 Discord 서버</p>
            <p className="text-slate-500 text-xs">팀원 모집, 커뮤니티</p>
          </div>
          {!inviteLoading && inviteUrl && (
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer"
              className="bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold px-3 py-1.5 rounded transition shrink-0">
              참여
            </a>
          )}
        </div>

        <button onClick={onGo} className="w-full text-center text-slate-500 text-xs hover:text-slate-300 transition py-2">
          나중에 → 대시보드로
        </button>
      </div>
    </div>
  )
}

function OnboardingContent() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'val' | 'coach' | 'done'>('role')
  const [valProfile, setValProfile] = useState<GameProfile | null>(null)
  const [isCoach, setIsCoach] = useState(false)

  const handleValSave = (p: GameProfile) => { setValProfile(p); setStep('done') }

  if (step === 'done') {
    return <DoneStep valProfile={valProfile} isCoach={isCoach} onGo={() => router.replace('/dashboard')} />
  }

  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-black text-3xl tracking-widest text-[#00D2BE]">D31</span>
          <h1 className="text-white font-bold text-xl mt-4 mb-1">프로필 설정</h1>
          <p className="text-slate-500 text-xs mt-1">
            {step === 'role' ? '어떤 유형으로 시작할까요?' : isCoach ? '코치로 시작해요' : '선수로 시작해요'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-8 h-1.5 rounded-full" style={{ background: isCoach ? '#60a5fa' : '#ff4655' }} />
          </div>
        </div>

        <div className="bg-[#111118] border border-white/5 rounded p-6">
          {step === 'role' ? (
            <RoleStep onSelect={(role) => { setIsCoach(role === 'coach'); setStep(role === 'coach' ? 'coach' : 'val') }} />
          ) : (
            <GameForm
              gameType="valorant"
              color={isCoach ? '#60a5fa' : '#ff4655'}
              label={isCoach ? '코치 등록' : 'VALORANT'}
              tiers={VAL_TIERS} saved={valProfile} coachMode={step === 'coach'}
              onSave={handleValSave}
              onSkip={() => setStep('done')}
              onBack={() => setStep('role')}
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
