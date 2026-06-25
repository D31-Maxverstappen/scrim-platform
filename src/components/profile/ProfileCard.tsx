'use client'

import AvatarUpload from '@/components/profile/AvatarUpload'

const TIER_COLOR: Record<string, string> = {
  Iron: '#8899aa', Bronze: '#a57c52', Silver: '#b0b8c8',
  Gold: '#e8b84b', Platinum: '#4fd1c5', Diamond: '#6fa8dc',
  Ascendant: '#52be80', Immortal: '#e74c3c', Radiant: '#f8d568', Unranked: '#475569',
}

function tierColor(tier: string | null) {
  if (!tier) return '#475569'
  return TIER_COLOR[tier.split(' ')[0]] ?? '#475569'
}

type Props = {
  userId: string
  avatarUrl: string | null
  valGamename: string | null
  valTagline: string | null
  valTier: string | null
}

export default function ProfileCard({ userId, avatarUrl, valGamename, valTagline, valTier }: Props) {
  return (
    <div className="bg-[#0d0d1a] border border-white/[0.06] rounded p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-4">My Profile</p>

      <div className="flex items-center gap-3">
        <AvatarUpload
          userId={userId}
          initialUrl={avatarUrl}
          initials={valGamename?.[0]?.toUpperCase() ?? '?'}
        />
        <div className="flex-1 min-w-0">
          {valGamename ? (
            <>
              <p className="text-white font-bold text-sm leading-tight truncate">
                {valGamename}
                {valTagline && <span className="text-slate-600 font-normal text-xs"> #{valTagline}</span>}
              </p>
              {valTier && (
                <p className="text-xs font-bold mt-1" style={{ color: tierColor(valTier) }}>
                  {valTier}
                </p>
              )}
            </>
          ) : (
            <div>
              <p className="text-slate-500 text-xs mb-1.5">게임 미등록</p>
              <a href="/onboarding"
                className="inline-block text-[10px] font-bold bg-[#00D2BE]/10 text-[#00D2BE] px-3 py-1 rounded-full hover:bg-[#00D2BE]/20 transition">
                계정 연동 →
              </a>
            </div>
          )}
        </div>
      </div>

      {valGamename && (
        <a href="/profile"
          className="mt-4 flex items-center justify-between text-[10px] text-slate-600 hover:text-slate-400 transition border-t border-white/[0.04] pt-3">
          <span>프로필 보기</span>
          <span>→</span>
        </a>
      )}
    </div>
  )
}
