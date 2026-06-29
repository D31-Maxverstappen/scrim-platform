'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GAME_COLOR } from '@/lib/games'
import { getTierColor } from '@/lib/tiers'
import RankIcon from '@/components/common/RankIcon'
import { EmptyState, EmptyIcons } from '@/components/common/EmptyState'
import { D31ScoreBadge } from '@/components/profile/D31ScoreCard'
import type { RecruitPost } from '@/lib/types'

// 필터용 — 티어 그룹(LFP는 콤마결합이라 그룹 ilike로 매칭), 포지션(roles 배열 contains)
const TIER_GROUPS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']
const ROLE_OPTIONS = ['Duelist', 'Initiator', 'Sentinel', 'Controller', 'IGL', 'Flex']

const VAL_TIERS = [
  'Iron 3','Iron 2','Iron 1','Bronze 3','Bronze 2','Bronze 1',
  'Silver 3','Silver 2','Silver 1','Gold 3','Gold 2','Gold 1',
  'Platinum 3','Platinum 2','Platinum 1','Diamond 3','Diamond 2','Diamond 1',
  'Ascendant 3','Ascendant 2','Ascendant 1','Immortal 3','Immortal 2','Immortal 1','Radiant',
]

function formatTierDisplay(tierStr: string | null | undefined): Array<{ text: string; color: string }> {
  if (!tierStr) return []
  const selected = tierStr.split(',').map((t) => t.trim()).filter(Boolean)
  if (selected.length === 0) return []

  const sorted = [...selected].sort((a, b) => VAL_TIERS.indexOf(a) - VAL_TIERS.indexOf(b))

  const groups: string[][] = []
  let current = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    if (VAL_TIERS.indexOf(sorted[i]) === VAL_TIERS.indexOf(sorted[i - 1]) + 1) {
      current.push(sorted[i])
    } else {
      groups.push(current)
      current = [sorted[i]]
    }
  }
  groups.push(current)

  return groups.map((g) => {
    if (g.length === 1) return { text: g[0], color: getTierColor(g[0]) }
    return { text: `${g[0]} ~ ${g[g.length - 1]}`, color: getTierColor(g[0]) }
  })
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}


function LftCard({ post, currentUserId, onClose, onDelete }: {
  post: RecruitPost
  currentUserId: string
  onClose: (id: string) => void
  onDelete: (id: string) => void
}) {
  const u = Array.isArray(post.users) ? post.users[0] : post.users
  const gameName = u?.val_gamename ?? u?.riot_gamename
  const profileTier = u?.val_tier ?? u?.tier
  const tierDisplay = formatTierDisplay(post.tier)
  const isOwn = post.user_id === currentUserId
  const isCoach = u?.account_type === 'coach'

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition ${isOwn ? 'bg-[#00D2BE]/[0.04]' : ''}`}>
      {/* 선수 */}
      <a href={`/users/${u?.id ?? ''}`} className="flex items-center gap-3 w-44 shrink-0 min-w-0 group">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 shrink-0 flex items-center justify-center text-sm font-black text-white/30">
          {u?.avatar_url
            ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
            : gameName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-white font-bold text-sm truncate group-hover:text-[#00D2BE] transition">{gameName ?? '—'}</p>
            {isOwn && <span className="text-[9px] font-black text-[#00D2BE] bg-[#00D2BE]/10 px-1 py-0.5 rounded shrink-0">내 글</span>}
          </div>
          <span className="text-[11px] font-bold" style={isCoach ? { color: '#60a5fa' } : { color: '#94a3b8' }}>
            {isCoach ? '코치' : '선수'}
          </span>
          {profileTier && !isCoach && <span className="inline-flex items-center gap-0.5 text-[11px] ml-1.5" style={{ color: getTierColor(profileTier) }}><RankIcon tier={profileTier} size={20} />{profileTier}</span>}
        </div>
      </a>

      {/* 티어 / 포지션 태그 */}
      <div className="hidden md:flex items-center gap-1 flex-wrap w-52 shrink-0">
        {tierDisplay.map((d, i) => (
          <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded border"
            style={{ background: d.color + '22', color: d.color, borderColor: d.color + '55' }}>{d.text}</span>
        ))}
        {post.roles?.map((r: string) => (
          <span key={r} className="text-[11px] font-semibold bg-white/5 text-slate-400 px-2 py-0.5 rounded">{r}</span>
        ))}
      </div>

      {/* 한 줄 소개 (항상 공간 확보, 텍스트는 lg부터) */}
      <div className="flex-1 min-w-0">
        <p className="hidden lg:block truncate text-slate-400 text-xs">{post.note ?? ''}</p>
      </div>

      {/* D31 Score */}
      <div className="w-28 shrink-0">
        {!isCoach && u?.id && <D31ScoreBadge seed={u.id} />}
      </div>

      {/* 연락 · 등록 + 액션 */}
      <div className="w-44 shrink-0 flex items-center justify-end gap-3">
        {post.discord_tag && <span className="hidden xl:inline text-[#5865F2] text-[11px] font-semibold truncate">{post.discord_tag}</span>}
        <span className="text-slate-600 text-[11px] w-12 text-right shrink-0">{timeAgo(post.created_at)}</span>
        {isOwn && (
          <div className="flex items-center gap-1.5">
            <a href={`/recruit/post/edit/${post.id}`} className="text-[11px] text-slate-500 hover:text-white transition font-semibold">수정</a>
            <button onClick={() => onClose(post.id)} className="text-[11px] text-slate-500 hover:text-[#00D2BE] transition font-semibold">완료</button>
            <button onClick={() => onDelete(post.id)} className="text-[11px] text-slate-500 hover:text-red-400 transition font-semibold">삭제</button>
          </div>
        )}
      </div>
    </div>
  )
}

function LfpCard({ post, currentUserId, currentUserHasTeam, currentUserAccountType, onClose, onDelete }: {
  post: RecruitPost
  currentUserId: string
  currentUserHasTeam: boolean
  currentUserAccountType: string
  onClose: (id: string) => void
  onDelete: (id: string) => void
}) {
  const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
  const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
  const isOwn = post.user_id === currentUserId
  const isLfc = post.type === 'lfc' // 코치 구함
  const tierDisplay = formatTierDisplay(post.tier)

  const [applyState, setApplyState] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleApply = async () => {
    setApplyState('loading')
    const res = await fetch('/api/recruit/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    })
    setApplyState(res.ok ? 'done' : 'idle')
    if (!res.ok) {
      const d = await res.json()
      alert(d.error ?? '오류가 발생했어요.')
    }
  }

  // 선수 구함=선수계정·무소속만 신청 / 코치 구함=코치계정만 신청
  const showApplyBtn = !isOwn && (isLfc
    ? currentUserAccountType === 'coach'
    : currentUserAccountType !== 'coach' && !currentUserHasTeam)

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition ${isOwn ? 'bg-[#00D2BE]/[0.04]' : ''}`}>
      {/* 팀 */}
      <a href={team?.id ? `/teams/${team.id}` : '#'} className="flex items-center gap-3 w-44 shrink-0 min-w-0 group">
        <div className="w-9 h-9 rounded flex items-center justify-center text-base font-black shrink-0"
          style={{ background: gc + '22', color: gc }}>
          {team?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-white font-bold text-sm truncate group-hover:text-[#00D2BE] transition">{team?.name ?? '팀 없음'}</p>
            {isOwn && <span className="text-[9px] font-black text-[#00D2BE] bg-[#00D2BE]/10 px-1 py-0.5 rounded shrink-0">내 글</span>}
          </div>
          <span className="text-[11px] font-bold" style={isLfc ? { color: '#60a5fa' } : { color: '#00D2BE' }}>
            {isLfc ? '코치 구함' : '선수 구함'}
          </span>
          {team?.tier_avg && <span className="text-[11px] text-slate-500 ml-1.5">Avg. {team.tier_avg}</span>}
        </div>
      </a>

      {/* 모집 포지션 / 희망 티어 */}
      <div className="hidden md:flex items-center gap-1 flex-wrap w-52 shrink-0">
        {!isLfc && post.roles?.map((r: string) => (
          <span key={r} className="text-[11px] font-semibold bg-[#00D2BE]/10 text-[#00D2BE] px-2 py-0.5 rounded">{r}</span>
        ))}
        {!isLfc && tierDisplay.map((d, i) => (
          <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded border"
            style={{ background: d.color + '22', color: d.color, borderColor: d.color + '55' }}>{d.text}</span>
        ))}
        {isLfc && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: '#60a5fa1a', color: '#60a5fa' }}>코치</span>
        )}
      </div>

      {/* 한 줄 소개 (항상 공간 확보, 텍스트는 lg부터) */}
      <div className="flex-1 min-w-0">
        <p className="hidden lg:block truncate text-slate-400 text-xs">{post.note ?? ''}</p>
      </div>

      {/* 지원 · 등록 + 액션 */}
      <div className="w-48 shrink-0 flex items-center justify-end gap-3">
        {post.discord_tag && <span className="hidden xl:inline text-[#5865F2] text-[11px] font-semibold truncate">{post.discord_tag}</span>}
        <span className="text-slate-600 text-[11px] w-12 text-right shrink-0">{timeAgo(post.created_at)}</span>
        {showApplyBtn && (
          applyState === 'done' ? (
            <span className="text-[11px] font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded">✓ 신청 완료</span>
          ) : (
            <button
              onClick={handleApply}
              disabled={applyState === 'loading'}
              className="text-[11px] font-bold bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white px-3 py-1.5 rounded transition shrink-0"
            >
              {applyState === 'loading' ? '신청 중...' : isLfc ? '코치 지원' : '가입 신청'}
            </button>
          )
        )}
        {isOwn && (
          <div className="flex items-center gap-1.5">
            <a href={`/recruit/post/edit/${post.id}`} className="text-[11px] text-slate-500 hover:text-white transition font-semibold">수정</a>
            <button onClick={() => onClose(post.id)} className="text-[11px] text-slate-500 hover:text-[#00D2BE] transition font-semibold">완료</button>
            <button onClick={() => onDelete(post.id)} className="text-[11px] text-slate-500 hover:text-red-400 transition font-semibold">삭제</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RecruitBoard({ posts, currentUserId, currentUserHasTeam, currentUserAccountType, activeType, activeTier, activeRole }: {
  posts: RecruitPost[]
  currentUserId: string
  currentUserHasTeam: boolean
  currentUserAccountType: string
  activeType: string
  activeTier: string
  activeRole: string
}) {
  const router = useRouter()
  const [localPosts, setLocalPosts] = useState(posts)

  // type/tier/role 보존하며 한 값만 교체한 /recruit URL 생성 (페이지는 1로 리셋)
  const buildUrl = (next: { type?: string; tier?: string; role?: string }) => {
    const type = next.type ?? activeType
    const tier = next.tier ?? activeTier
    const role = next.role ?? activeRole
    const q = new URLSearchParams({ type })
    if (tier) q.set('tier', tier)
    if (role) q.set('role', role)
    return `/recruit?${q.toString()}`
  }

  const handleClose = async (id: string) => {
    await fetch(`/api/recruit/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    })
    setLocalPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제할까요?')) return
    await fetch(`/api/recruit/${id}`, { method: 'DELETE' })
    setLocalPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <>
      {/* 글 올리기 + 필터 (탭 전환은 사이드바 '팀 구하기' / '선수·코치 구하기'로) */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <a href={`/recruit/post?type=${activeType}`}
          className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold px-4 py-2 rounded transition shrink-0">
          + 글 올리기
        </a>
        <div className="flex gap-2">
          <select value={activeTier} onChange={(e) => router.push(buildUrl({ tier: e.target.value }))}
            className="bg-white/5 border border-white/10 text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#00D2BE] cursor-pointer">
            <option value="">{activeType === 'lfp' ? '모집 티어 전체' : '티어 전체'}</option>
            {TIER_GROUPS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={activeRole} onChange={(e) => router.push(buildUrl({ role: e.target.value }))}
            className="bg-white/5 border border-white/10 text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#00D2BE] cursor-pointer">
            <option value="">{activeType === 'lfp' ? '모집 포지션 전체' : '포지션 전체'}</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* 카드 그리드 */}
      {localPosts.length === 0 ? (
        <EmptyState
          accent="#00D2BE"
          icon={activeType === 'lft' ? EmptyIcons.megaphone : EmptyIcons.search}
          title={activeType === 'lft' ? '팀을 찾는 사람이 없어요' : '선수·코치를 찾는 팀이 없어요'}
          description="첫 번째로 올려보세요!"
          action={<a href={`/recruit/post?type=${activeType}`} className="bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">+ 글 올리기</a>}
        />
      ) : (
        <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
          {/* 컬럼 헤더 (행과 동일한 컬럼 폭으로 정렬) */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span className="w-44 shrink-0">{activeType === 'lft' ? '선수' : '팀'}</span>
            <span className="hidden md:block w-52 shrink-0">{activeType === 'lft' ? '티어 · 포지션' : '모집 대상'}</span>
            <span className="flex-1 min-w-0"><span className="hidden lg:inline">소개</span></span>
            {activeType === 'lft' && <span className="w-28 shrink-0">D31 Rating</span>}
            <span className={`${activeType === 'lft' ? 'w-44' : 'w-48'} shrink-0 text-right`}>
              {activeType === 'lft' ? '등록' : '지원 · 등록'}
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {localPosts.map((post) =>
              activeType === 'lft'
                ? <LftCard key={post.id} post={post} currentUserId={currentUserId} onClose={handleClose} onDelete={handleDelete} />
                : <LfpCard key={post.id} post={post} currentUserId={currentUserId} currentUserHasTeam={currentUserHasTeam} currentUserAccountType={currentUserAccountType} onClose={handleClose} onDelete={handleDelete} />
            )}
          </div>
        </div>
      )}
    </>
  )
}
