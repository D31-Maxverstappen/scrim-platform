'use client'

import { useState } from 'react'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655' }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

function parseTiers(tier: string | null): string[] {
  if (!tier) return []
  return tier.split(',').map((t) => t.trim()).filter(Boolean)
}

function LftCard({ post, currentUserId, onClose, onDelete }: {
  post: any
  currentUserId: string
  onClose: (id: string) => void
  onDelete: (id: string) => void
}) {
  const u = Array.isArray(post.users) ? post.users[0] : post.users
  const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
  const gameName = u?.val_gamename ?? u?.riot_gamename
  const profileTier = u?.val_tier ?? u?.tier
  const tiers = parseTiers(post.tier) // 선택한 티어들
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
          {profileTier && tiers.length === 0 && (
            <p className="text-xs" style={{ color: gc }}>{profileTier}</p>
          )}
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
          style={{ background: gc + '22', color: gc }}>VAL</span>
      </div>

      {/* 선택 티어 */}
      {tiers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tiers.map((t) => (
            <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: gc + '22', color: gc }}>{t}</span>
          ))}
        </div>
      )}

      {post.roles?.length > 0 && (
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
  post: any
  currentUserId: string
  currentUserHasTeam: boolean
  onClose: (id: string) => void
  onDelete: (id: string) => void
}) {
  const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
  const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
  const isOwn = post.user_id === currentUserId
  const tiers = parseTiers(post.tier)

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

      {post.roles?.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-slate-600">모집 포지션</span>
          {post.roles.map((r: string) => (
            <span key={r} className="text-[10px] font-semibold bg-[#00D2BE]/10 text-[#00D2BE] px-2 py-0.5 rounded">{r}</span>
          ))}
        </div>
      )}

      {/* 희망 티어 (다중) */}
      {tiers.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-slate-600">희망 티어</span>
          {tiers.map((t) => (
            <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: gc + '22', color: gc }}>{t}</span>
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
              <button onClick={() => onClose(post.id)} className="text-[10px] text-slate-500 hover:text-[#00D2BE] transition font-semibold">완료</button>
              <button onClick={() => onDelete(post.id)} className="text-[10px] text-slate-500 hover:text-red-400 transition font-semibold">삭제</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecruitBoard({ posts, currentUserId, currentUserHasTeam, initialType, initialGame }: {
  posts: any[]
  currentUserId: string
  currentUserHasTeam: boolean
  initialType: string
  initialGame: string
}) {
  const [tab, setTab] = useState(initialType === 'lfp' ? 'lfp' : 'lft')
  const [game, setGame] = useState(initialGame)
  const [localPosts, setLocalPosts] = useState(posts)

  const filtered = localPosts
    .filter((p) => p.type === tab)
    .filter((p) => !game || p.game_type === game)

  const chipCls = (active: boolean) =>
    `px-3 py-1.5 rounded text-xs font-semibold transition ${active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`

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
          <button onClick={() => setTab('lft')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition ${tab === 'lft' ? 'bg-[#00D2BE] text-white' : 'text-slate-400 hover:text-white'}`}>
            LFT <span className="text-[10px] opacity-60 ml-1">팀 구함</span>
          </button>
          <button onClick={() => setTab('lfp')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition ${tab === 'lfp' ? 'bg-[#00D2BE] text-white' : 'text-slate-400 hover:text-white'}`}>
            LFP <span className="text-[10px] opacity-60 ml-1">선수 구함</span>
          </button>
        </div>

        <div className="flex gap-2">
          {[['', '전체'], ['valorant', 'VALORANT']].map(([val, label]) => (
            <button key={val} onClick={() => setGame(val)} className={chipCls(game === val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-600 bg-[#13131f] border border-white/5 rounded">
          <p className="text-3xl mb-4">{tab === 'lft' ? '🎮' : '🔍'}</p>
          <p className="font-semibold text-sm">{tab === 'lft' ? '팀을 찾는 선수가 없어요' : '선수를 찾는 팀이 없어요'}</p>
          <p className="text-xs mt-1">첫 번째로 올려보세요!</p>
          <a href="/recruit/post" className="mt-5 bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">
            + 글 올리기
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((post) =>
            tab === 'lft'
              ? <LftCard key={post.id} post={post} currentUserId={currentUserId} onClose={handleClose} onDelete={handleDelete} />
              : <LfpCard key={post.id} post={post} currentUserId={currentUserId} currentUserHasTeam={currentUserHasTeam} onClose={handleClose} onDelete={handleDelete} />
          )}
        </div>
      )}
    </>
  )
}
