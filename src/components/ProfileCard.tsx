'use client'

import { useState } from 'react'
import AvatarUpload from './AvatarUpload'

const TIER_COLOR: Record<string, string> = {
  Iron: '#6b7280', Bronze: '#92400e', Silver: '#94a3b8', Gold: '#f59e0b',
  Platinum: '#2dd4bf', Emerald: '#10b981', Diamond: '#60a5fa',
  Master: '#a78bfa', Grandmaster: '#f87171', Challenger: '#fde68a',
  Ascendant: '#34d399', Immortal: '#fb7185', Radiant: '#fef08a', Unranked: '#374151',
}

function tierColor(tier: string | null) {
  if (!tier) return '#6b7280'
  return TIER_COLOR[tier.split(' ')[0]] ?? '#6b7280'
}

// V 아이콘 (발로란트)
function ValorantIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-md flex items-center justify-center transition ${active ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
      style={{ background: active ? '#ff455522' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${active ? '#ff4655' : 'transparent'}` }}>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
        <path d="M2 3.5 L8 13 L14 3.5 L11 3.5 L8 9 L5 3.5 Z" fill="#ff4655"/>
      </svg>
    </div>
  )
}

// L 아이콘 (롤)
function LolIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-md flex items-center justify-center transition ${active ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
      style={{ background: active ? '#c89b3c22' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${active ? '#c89b3c' : 'transparent'}` }}>
      <span style={{ color: '#c89b3c', fontSize: '11px', fontWeight: 900, lineHeight: 1 }}>L</span>
    </div>
  )
}

type Props = {
  userId: string
  avatarUrl: string | null
  valGamename: string | null
  valTagline: string | null
  valTier: string | null
  lolGamename: string | null
  lolTagline: string | null
  lolTier: string | null
  primaryGame: 'valorant' | 'lol' | null
}

export default function ProfileCard({
  userId, avatarUrl,
  valGamename, valTagline, valTier,
  lolGamename, lolTagline, lolTier,
  primaryGame,
}: Props) {
  const hasVal = !!valGamename
  const hasLol = !!lolGamename

  const defaultGame = primaryGame === 'lol' && hasLol ? 'lol'
    : primaryGame === 'valorant' && hasVal ? 'valorant'
    : hasVal ? 'valorant' : hasLol ? 'lol' : null

  const [activeGame, setActiveGame] = useState<'valorant' | 'lol' | null>(defaultGame)

  const gamename = activeGame === 'valorant' ? valGamename : activeGame === 'lol' ? lolGamename : null
  const tagline = activeGame === 'valorant' ? valTagline : activeGame === 'lol' ? lolTagline : null
  const tier = activeGame === 'valorant' ? valTier : activeGame === 'lol' ? lolTier : null
  const gameColor = activeGame === 'valorant' ? '#ff4655' : activeGame === 'lol' ? '#c89b3c' : '#00D2BE'

  return (
    <div className="bg-[#13131f] border border-white/5 rounded-xl overflow-hidden">
      {/* 상단 배너 + 게임 아이콘 */}
      <div className="h-14 relative" style={{ background: `linear-gradient(135deg, ${gameColor}22, transparent)` }}>
        <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
          {hasVal && (
            <button onClick={() => setActiveGame('valorant')}>
              <ValorantIcon active={activeGame === 'valorant'} />
            </button>
          )}
          {hasLol && (
            <button onClick={() => setActiveGame('lol')}>
              <LolIcon active={activeGame === 'lol'} />
            </button>
          )}
          {(!hasVal || !hasLol) && (
            <a href="/onboarding"
              className="w-7 h-7 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/10 transition border border-white/10"
              title="게임 추가">
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: 1, marginTop: '-1px' }}>+</span>
            </a>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 -mt-7">
        <AvatarUpload
          userId={userId}
          initialUrl={avatarUrl}
          initials={gamename?.[0]?.toUpperCase() ?? '?'}
        />
        <div className="mt-2">
          {gamename ? (
            <>
              <p className="text-white font-bold text-sm leading-tight">
                {gamename}
                {tagline && <span className="text-slate-500 font-normal text-xs"> #{tagline}</span>}
              </p>
              {tier && (
                <p className="text-xs font-bold mt-1" style={{ color: tierColor(tier) }}>
                  {tier}
                </p>
              )}
            </>
          ) : (
            <div>
              <p className="text-slate-500 text-xs">게임 미등록</p>
              <a href="/onboarding" className="text-[#00D2BE] text-xs hover:underline">연동하기 →</a>
            </div>
          )}

          {/* 두 게임 모두 없을 때 */}
          {!hasVal && !hasLol && (
            <a href="/onboarding" className="mt-2 block text-center bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold py-1.5 rounded-lg transition">
              라이엇 계정 연동
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
