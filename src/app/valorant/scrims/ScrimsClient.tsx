'use client'

import { useState } from 'react'
import Pagination from '@/components/Pagination'
import { inTierRange } from '@/lib/tiers'

function formatDate(dt: string | null) {
  if (!dt) return null
  const d = new Date(dt)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ScrimsClient({
  posts,
  myTier,
  q,
  page,
  total,
  pageSize,
}: {
  posts: any[]
  myTier: string | null
  q: string
  page: number
  total: number
  pageSize: number
}) {
  const [filterByTier, setFilterByTier] = useState(false)

  const displayed = filterByTier && myTier
    ? posts.filter((p) => inTierRange(myTier, p.tier_min, p.tier_max))
    : posts

  return (
    <>
      {/* 필터 바 */}
      <div className="flex items-center gap-3 mb-5">
        <form method="GET" className="flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="팀 이름 검색..."
            className="w-full bg-[#13131f] border border-white/10 rounded px-4 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/50 transition"
          />
        </form>
        {myTier && (
          <button
            onClick={() => setFilterByTier((prev) => !prev)}
            className={`shrink-0 px-4 py-2 rounded text-xs font-bold transition ${
              filterByTier
                ? 'bg-[#ff4655] text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            내 티어 맞춤 ({myTier})
          </button>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center text-slate-500 py-24 bg-[#13131f] border border-white/5 rounded">
          <p className="text-3xl mb-4">🎮</p>
          {q ? (
            <>
              <p className="font-semibold">"{q}" 조건에 맞는 스크림이 없어요</p>
              <p className="text-sm mt-1">다른 팀 이름으로 검색해보세요</p>
            </>
          ) : filterByTier ? (
            <>
              <p className="font-semibold">내 티어에 맞는 스크림이 없어요</p>
              <p className="text-sm mt-1">
                <button onClick={() => setFilterByTier(false)} className="text-[#ff4655] hover:underline">전체 공고 보기</button>
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">현재 모집 중인 발로란트 스크림이 없어요</p>
              <p className="text-sm mt-1">첫 번째로 스크림을 올려보세요!</p>
              <a href="/scrims/post" className="mt-6 inline-block bg-[#ff4655]/20 hover:bg-[#ff4655]/30 text-[#ff4655] text-sm px-5 py-2.5 rounded transition">
                + 스크림 올리기
              </a>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((post: any) => {
            const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
            const tierOk = inTierRange(myTier, post.tier_min, post.tier_max)
            const hasTierCondition = post.tier_min || post.tier_max
            return (
              <a key={post.id} href={`/scrims/${post.id}`}
                className={`bg-[#13131f] border rounded px-6 py-4 flex items-center gap-4 transition group ${
                  tierOk
                    ? 'border-white/5 hover:border-[#ff4655]/40'
                    : 'border-white/5 opacity-50 hover:opacity-70'
                }`}>
                <div className="w-2 h-12 rounded-full shrink-0 bg-[#ff4655]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-bold text-sm group-hover:text-[#ff4655] transition">
                      {team?.name ?? '—'}
                    </span>
                    {team?.tier_avg && <span className="text-slate-500 text-xs">· {team.tier_avg}</span>}
                    {post.format && (
                      <span className="text-[10px] font-black bg-[#ff4655]/10 text-[#ff4655] px-1.5 py-0.5 rounded">{post.format}</span>
                    )}
                    {hasTierCondition && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        tierOk ? 'bg-white/5 text-slate-500' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {post.tier_min && post.tier_max
                          ? `${post.tier_min} ~ ${post.tier_max}`
                          : post.tier_min
                          ? `${post.tier_min} 이상`
                          : `${post.tier_max} 이하`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {post.preferred_date && <span>📅 {formatDate(post.preferred_date)}</span>}
                    {post.note && <span className="truncate max-w-[240px]">{post.note}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[#ff4655] text-xs font-bold">신청 →</span>
                  {!tierOk && myTier && (
                    <span className="text-red-400 text-[10px]">티어 미달</span>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        basePath="/valorant/scrims"
        params={{ ...(q && { q }) }}
      />
    </>
  )
}
