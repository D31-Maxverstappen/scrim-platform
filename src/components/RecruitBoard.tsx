'use client'

import { useState } from 'react'
import { GAME_COLOR } from '@/lib/games'
import { getTierColor } from '@/lib/tiers'
import { EmptyState, EmptyIcons } from '@/components/EmptyState'
import type { RecruitPost } from '@/lib/types'

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
  const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
  const gameName = u?.val_gamename ?? u?.riot_gamename
  const profileTier = u?.val_tier ?? u?.tier
  const tierDisplay = formatTierDisplay(post.tier)
  const isOwn = post.user_id === currentUserId

  return (
    <div className={`bg-[#13131f] border rounded p-4 flex flex-col gap-3 relative ${isOwn ? 'border-[#00D2BE]/30' : 'border-white/5'}`}>
      {isOwn && <span className="absolute top-3 right-3 text-[9px] font-black text-[#00D2BE] bg-[#00D2BE]/10 px-1.5 py-0.5 rounded">내 글</span>}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 shrink-0 flex items-center justify-center text-sm font-black text-white/30">
          {u?.avatar_url
            ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
            : gameName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{gameName ?? '—'}</p>
          {tierDisplay.length === 0 && profileTier && (
            <p className="text-xs" style={{ color: getTierColor(profileTier) }}>{profileTier}</p>
          )}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
          style={{ background: gc + '22', color: gc }}>VAL</span>
      </div>

      {tierDisplay.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tierDisplay.map((d, i) => (
            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded border"
              style={{ background: d.color + '22', color: d.color, borderColor: d.color + '55' }}>{d.text}</span>
          ))}
        </div>
      )}

      {post.roles && post.roles.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.roles.map((r: string) => (
            <span key={r} className="text-[10px] font-semibold bg-white/5 text-slate-400 px-2 py-0.5 rounded">{r}</span>
          ))}
        </div>
      )}

      {post.note && <p className="text-slate-400 text-xs leading-relaxed">{post.note}</p>}

      <div className="flex items-center justify-between mt-auto pt-1 border-t border-white/5">
        {post.discord_tag ? (
          <span className="text-[#5865F2] text-xs font-semibold">{post.discord_tag}</span>
        ) : (
          <span className="text-slate-600 text-xs">Discord 미등록</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-[10px]">{timeAgo(post.created_at)}</span>
          {isOwn && (
            <>
              <a href={`/recruit/post/edit/${post.id}`} className="text-[10px] text-slate-500 hover:text-white transition font-semibold">수정</a>
              <button onClick={() => onClose(post.id)} className="text-[10px] text-slate-500 hover:text-[#00D2BE] transition font-semibold">완료</button>
              <button onClick={() => onDelete(post.id)} className="text-[10px] text-slate-500 hover:text-red-400 transition font-semibold">삭제</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LfpCard({ post, currentUserId, currentUserHasTeam, onClose, onDelete }: {
  post: RecruitPost
  currentUserId: string
  currentUserHasTeam: boolean
  onClose: (id: string) => void
  onDelete: (id: string) => void
}) {
  const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
  const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
  const isOwn = post.user_id === currentUserId
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

  const showApplyBtn = !isOwn && !currentUserHasTeam

  return (
    <div className={`bg-[#13131f] border rounded p-4 flex flex-col gap-3 relative ${isOwn ? 'border-[#00D2BE]/30' : 'border-white/5'}`}>
      {isOwn && <span className="absolute top-3 right-3 text-[9px] font-black text-[#00D2BE] bg-[#00D2BE]/10 px-1.5 py-0.5 rounded">내 글</span>}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded flex items-center justify-center text-lg font-black shrink-0"
          style={{ background: gc + '22', color: gc }}>
          {team?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{team?.name ?? '팀 없음'}</p>
          {team?.tier_avg && <p className="text-xs text-slate-400">Avg. {team.tier_avg}</p>}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
          style={{ background: gc + '22', color: gc }}>VAL</span>
      </div>

      {post.roles && post.roles.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-slate-600">모집 포지션</span>
          {post.roles.map((r: string) => (
            <span key={r} className="text-[10px] font-semibold bg-[#00D2BE]/10 text-[#00D2BE] px-2 py-0.5 rounded">{r}</span>
          ))}
        </div>
      )}

      {tierDisplay.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-slate-600 shrink-0">희망 티어</span>
          {tierDisplay.map((d, i) => (
            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded border"
              style={{ background: d.color + '22', color: d.color, borderColor: d.color + '55' }}>{d.text}</span>
          ))}
        </div>
      )}

      {post.note && <p className="text-slate-400 text-xs leading-relaxed">{post.note}</p>}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {post.discord_tag ? (
            <span className="text-[#5865F2] text-xs font-semibold truncate">{post.discord_tag}</span>
          ) : (
            <span className="text-slate-600 text-xs">Discord 미등록</span>
          )}
          <span className="text-slate-600 text-[10px] shrink-0">{timeAgo(post.created_at)}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showApplyBtn && (
            applyState === 'done' ? (
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded">✓ 신청 완료</span>
            ) : (
              <button
                onClick={handleApply}
                disabled={applyState === 'loading'}
                className="text-[10px] font-bold bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white px-3 py-1.5 rounded transition"
              >
                {applyState === 'loading' ? '신청 중...' : '가입 신청'}
              </button>
            )
          )}
          {isOwn && (
            <>
              <a href={`/recruit/post/edit/${post.id}`} className="text-[10px] text-slate-500 hover:text-white transition font-semibold">수정</a>
              <button onClick={() => onClose(post.id)} className="text-[10px] text-slate-500 hover:text-[#00D2BE] transition font-semibold">완료</button>
              <button onClick={() => onDelete(post.id)} className="text-[10px] text-slate-500 hover:text-red-400 transition font-semibold">삭제</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecruitBoard({ posts, currentUserId, currentUserHasTeam, activeType, activeGame }: {
  posts: RecruitPost[]
  currentUserId: string
  currentUserHasTeam: boolean
  activeType: string
  activeGame: string
}) {
  const [localPosts, setLocalPosts] = useState(posts)

  const chipCls = (active: boolean) =>
    `px-3 py-1.5 rounded text-xs font-semibold transition ${active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`

  const tabUrl = (type: string) => `/recruit?type=${type}${activeGame ? `&game=${activeGame}` : ''}`
  const gameUrl = (game: string) => `/recruit?type=${activeType}${game ? `&game=${game}` : ''}`

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
      {/* 탭 + 게임 필터 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-white/5 rounded p-1">
          <a href={tabUrl('lft')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition ${activeType === 'lft' ? 'bg-[#00D2BE] text-white' : 'text-slate-400 hover:text-white'}`}>
            LFT <span className="text-[10px] opacity-60 ml-1">팀 구함</span>
          </a>
          <a href={tabUrl('lfp')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition ${activeType === 'lfp' ? 'bg-[#00D2BE] text-white' : 'text-slate-400 hover:text-white'}`}>
            LFP <span className="text-[10px] opacity-60 ml-1">선수 구함</span>
          </a>
        </div>

        <div className="flex gap-2">
          {[['', '전체'], ['valorant', 'VALORANT']].map(([val, label]) => (
            <a key={val} href={gameUrl(val)} className={chipCls(activeGame === val)}>{label}</a>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      {localPosts.length === 0 ? (
        <EmptyState
          accent="#00D2BE"
          icon={activeType === 'lft' ? EmptyIcons.megaphone : EmptyIcons.search}
          title={activeType === 'lft' ? '팀을 찾는 선수가 없어요' : '선수를 찾는 팀이 없어요'}
          description="첫 번째로 올려보세요!"
          action={<a href="/recruit/post" className="bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">+ 글 올리기</a>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {localPosts.map((post) =>
            activeType === 'lft'
              ? <LftCard key={post.id} post={post} currentUserId={currentUserId} onClose={handleClose} onDelete={handleDelete} />
              : <LfpCard key={post.id} post={post} currentUserId={currentUserId} currentUserHasTeam={currentUserHasTeam} onClose={handleClose} onDelete={handleDelete} />
          )}
        </div>
      )}
    </>
  )
}
