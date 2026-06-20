'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }

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

  return (
    <>
      {/* 게임 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[['', '전체'], ['valorant', 'VALORANT'], ['lol', '리그 오브 레전드']].map(([val, label]) => (
          <button key={val} onClick={() => navigate({ game: val, server, format })} className={chipCls(game === val)}>
            {label}
          </button>
        ))}
      </div>

      {/* 서버 / 포맷 / 티어 필터 */}
      <div className="flex flex-wrap items-center gap-2 mb-6 bg-[#13131f] border border-white/5 rounded px-4 py-3">
        <span className="text-[10px] text-slate-600 uppercase tracking-wider">서버</span>
        {['KR', 'AS'].map((s) => (
          <button key={s} onClick={() => navigate({ game, server: server === s ? '' : s, format })} className={smChipCls(server === s)}>{s}</button>
        ))}

        <span className="w-px h-3 bg-white/10 mx-1" />

        <span className="text-[10px] text-slate-600 uppercase tracking-wider">포맷</span>
        {['BO1', 'BO3', 'BO5'].map((f) => (
          <button key={f} onClick={() => navigate({ game, server, format: format === f ? '' : f })} className={smChipCls(format === f)}>{f}</button>
        ))}

        {allTiers.length > 0 && (
          <>
            <span className="w-px h-3 bg-white/10 mx-1" />
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">티어</span>
            {allTiers.map((tier) => (
              <button key={tier} onClick={() => setFilterTier(filterTier === tier ? '' : tier)} className={smChipCls(filterTier === tier)}>{tier}</button>
            ))}
          </>
        )}
      </div>

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
                      {team?.name ?? '알 수 없는 팀'}
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
                <span className="text-[#00D2BE] text-xs font-bold shrink-0">신청하기 →</span>
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}
