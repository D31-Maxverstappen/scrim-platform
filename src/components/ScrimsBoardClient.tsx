'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655' }

function formatDate(dt: string | null) {
  if (!dt) return null
  return new Date(dt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ScrimsBoardClient({ posts, game, server, format }: {
  posts: any[]
  game: string
  server: string
  format: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterTier, setFilterTier] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const allTiers = Array.from(new Set(
    posts.map((p: any) => {
      const t = Array.isArray(p.teams) ? p.teams[0] : p.teams
      return t?.tier_avg
    }).filter(Boolean)
  ))

  const displayed = posts.filter((p: any) => {
    if (!filterTier) return true
    const t = Array.isArray(p.teams) ? p.teams[0] : p.teams
    return t?.tier_avg === filterTier
  })

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v); else sp.delete(k)
    })
    router.push(`/scrims?${sp.toString()}`)
  }

  const chipCls = (active: boolean) =>
    `px-3 py-1.5 rounded text-xs font-semibold transition ${
      active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
    }`

  const smChipCls = (active: boolean) =>
    `px-2.5 py-1 text-[10px] font-bold rounded transition ${
      active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
    }`

  const activeCount = (server ? 1 : 0) + (format ? 1 : 0) + (filterTier ? 1 : 0)

  const resetAll = () => {
    setFilterTier('')
    navigate({ game, server: '', format: '' })
  }

  return (
    <>
      {/* 상단 바: 게임 필터 + 필터 버튼 */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {[['', '전체'], ['valorant', 'VALORANT']].map(([val, label]) => (
            <button key={val} onClick={() => navigate({ game: val, server, format })} className={chipCls(game === val)}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={resetAll} className="text-[10px] text-slate-500 hover:text-slate-300 transition">
              초기화
            </button>
          )}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition border
              ${filterOpen || activeCount > 0
                ? 'bg-[#00D2BE]/10 border-[#00D2BE]/40 text-[#00D2BE]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
            </svg>
            필터
            {activeCount > 0 && (
              <span className="bg-[#00D2BE] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 필터 패널 */}
      {filterOpen && (
        <div className="bg-[#13131f] border border-white/5 rounded px-5 py-4 mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider w-10 shrink-0">서버</span>
            <div className="flex gap-1.5">
              {['KR', 'AS'].map((s) => (
                <button key={s} onClick={() => navigate({ game, server: server === s ? '' : s, format })} className={smChipCls(server === s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider w-10 shrink-0">경기 수</span>
            <div className="flex gap-1.5">
              {['BO1', 'BO3', 'BO5'].map((f) => (
                <button key={f} onClick={() => navigate({ game, server, format: format === f ? '' : f })} className={smChipCls(format === f)}>{f}</button>
              ))}
            </div>
          </div>
          {allTiers.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider w-10 shrink-0">티어</span>
              <div className="flex flex-wrap gap-1.5">
                {allTiers.map((tier) => (
                  <button key={tier} onClick={() => setFilterTier(filterTier === tier ? '' : tier)} className={smChipCls(filterTier === tier)}>{tier}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 목록 */}
      {displayed.length === 0 ? (
        <div className="text-center text-slate-500 py-24 bg-[#13131f] border border-white/5 rounded">
          <p className="text-3xl mb-4">🎮</p>
          <p className="font-semibold">조건에 맞는 스크림이 없어요</p>
          <p className="text-sm mt-1">필터를 바꾸거나 첫 번째로 올려보세요!</p>
          <a href="/scrims/post" className="mt-6 inline-block bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">
            + 스크림 올리기
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((post: any) => {
            const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
            const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
            return (
              <a key={post.id} href={`/scrims/${post.id}`}
                className="bg-[#13131f] border border-white/5 hover:border-[#00D2BE]/30 rounded px-6 py-4 flex items-center gap-4 transition group">
                <div className="w-2 h-12 rounded-full shrink-0" style={{ background: gc }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-sm group-hover:text-[#00D2BE] transition">
                      {team?.name ?? '—'}
                    </span>
                    {team?.tier_avg && <span className="text-slate-500 text-xs">· {team.tier_avg}</span>}
                    <span className="text-slate-600 text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded">{post.format ?? 'BO3'}</span>
                    <span className="text-slate-600 text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded">{post.server ?? 'KR'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold" style={{ color: gc }}>
                      {post.game_type === 'valorant' ? 'VALORANT' : 'League of Legends'}
                    </span>
                    {post.preferred_date && <span>📅 {formatDate(post.preferred_date)}</span>}
                  </div>
                </div>
                <span className="text-[#00D2BE] text-xs font-bold shrink-0">스크림 신청 →</span>
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}
