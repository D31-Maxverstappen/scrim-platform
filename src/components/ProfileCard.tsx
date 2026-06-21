'use client'

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

type Props = {
  userId: string
  avatarUrl: string | null
  valGamename: string | null
  valTagline: string | null
  valTier: string | null
}

export default function ProfileCard({ userId, avatarUrl, valGamename, valTagline, valTier }: Props) {
  const gameColor = '#ff4655'

  return (
    <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
      {/* 상단 배너 */}
      <div className="h-14 relative" style={{ background: `linear-gradient(135deg, ${gameColor}22, transparent)` }}>
        <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
          {!valGamename && (
            <a href="/onboarding?add=valorant"
              className="w-7 h-7  flex items-center justify-center bg-white/5 hover:bg-white/10 transition border border-white/10"
              title="VALORANT 추가">
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: 1, marginTop: '-1px' }}>+</span>
            </a>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 -mt-7">
        <AvatarUpload
          userId={userId}
          initialUrl={avatarUrl}
          initials={valGamename?.[0]?.toUpperCase() ?? '?'}
        />
        <div className="mt-2">
          {valGamename ? (
            <>
              <p className="text-white font-bold text-sm leading-tight">
                {valGamename}
                {valTagline && <span className="text-slate-500 font-normal text-xs"> #{valTagline}</span>}
              </p>
              {valTier && (
                <p className="text-xs font-bold mt-1" style={{ color: tierColor(valTier) }}>
                  {valTier}
                </p>
              )}
            </>
          ) : (
            <div>
              <p className="text-slate-500 text-xs">게임 미등록</p>
              <a href="/onboarding" className="text-[#00D2BE] text-xs hover:underline">연동하기 →</a>
              <a href="/onboarding" className="mt-2 block text-center bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold py-1.5  transition">
                라이엇 계정 연동
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
