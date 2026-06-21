'use client'

import { useState } from 'react'

const VAL_TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']

export default function ScrimList({ scrims, game }: { scrims: any[]; game?: string }) {
  const [filterServer, setFilterServer] = useState('')
  const [filterFormat, setFilterFormat] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const activeGame = game ?? 'valorant'
  const gameColor = '#ff4655'
  const allLink = `/${activeGame}/scrims`

  const filtered = scrims
    .filter((s) => s.game_type === activeGame)
    .filter((s) => !filterServer || (s.server ?? 'KR') === filterServer)
    .filter((s) => !filterFormat || s.format === filterFormat)
    .filter((s) => {
      if (!filterTier) return true
      const t = Array.isArray(s.teams) ? s.teams[0] : s.teams
      return (t?.tier_avg ?? '').startsWith(filterTier)
    })

  const activeCount = (filterServer ? 1 : 0) + (filterFormat ? 1 : 0) + (filterTier ? 1 : 0)

  const chip = (active: boolean) =>
    `px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer select-none ${
      active ? 'bg-[#00D2BE]/20 text-[#00D2BE] border border-[#00D2BE]/40' : 'bg-white/[0.04] text-slate-500 border border-transparent hover:bg-white/[0.08] hover:text-slate-300'
    }`

  return (
    <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">

      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">스크림 게시판</p>
          <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition border ${
              filterOpen || activeCount > 0
                ? 'bg-[#00D2BE]/10 border-[#00D2BE]/30 text-[#00D2BE]'
                : 'bg-white/[0.04] border-white/[0.06] text-slate-500 hover:text-slate-300'
            }`}
          >
            필터
            {activeCount > 0 && (
              <span className="bg-[#00D2BE] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
          <a href={allLink} className="text-[10px] font-bold hover:underline" style={{ color: gameColor }}>
            전체 보기 →
          </a>
        </div>
      </div>

      {/* 필터 패널 */}
      {filterOpen && (
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">서버</span>
            {['KR', 'AS'].map((s) => (
              <button key={s} onClick={() => setFilterServer(filterServer === s ? '' : s)} className={chip(filterServer === s)}>{s}</button>
            ))}
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">포맷</span>
            {['BO1', 'BO3', 'BO5'].map((f) => (
              <button key={f} onClick={() => setFilterFormat(filterFormat === f ? '' : f)} className={chip(filterFormat === f)}>{f}</button>
            ))}
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">티어</span>
            {VAL_TIERS.map((tier) => (
              <button key={tier} onClick={() => setFilterTier(filterTier === tier ? '' : tier)} className={chip(filterTier === tier)}>{tier}</button>
            ))}
          </div>
        </div>
      )}

      {/* 컬럼 헤더 */}
      <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-white/[0.04]">
        <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-slate-700">팀 이름</span>
        <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">평균 티어</span>
        <span className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-slate-700">희망 시간</span>
        <span className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-700">서버</span>
        <span className="col-span-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">포맷</span>
        <span className="col-span-1 text-right text-[10px] font-bold uppercase tracking-wider text-slate-700">신청</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-slate-700">
          <p className="text-sm font-semibold mb-1">조건에 맞는 스크림이 없어요</p>
          <a href="/scrims/post" className="mt-3 text-[#00D2BE] text-xs font-bold hover:underline">
            + 스크림 올리기
          </a>
        </div>
      ) : (
        <div>
          {filtered.map((s: any, i: number) => {
            const t = Array.isArray(s.teams) ? s.teams[0] : s.teams
            const date = s.preferred_date
              ? new Date(s.preferred_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '미정'
            return (
              <a
                key={s.id}
                href={`/scrims/${s.id}`}
                className={`grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-white/[0.03] transition items-center group border-l-2 border-transparent hover:border-[#00D2BE]/60 ${i !== 0 ? 'border-t border-t-white/[0.04]' : ''}`}
              >
                <span className="col-span-3 text-white text-xs font-semibold truncate group-hover:text-[#00D2BE] transition">{t?.name ?? '—'}</span>
                <span className="col-span-2 text-slate-500 text-xs truncate">{t?.tier_avg ?? '—'}</span>
                <span className="col-span-3 text-slate-500 text-xs">{date}</span>
                <span className="col-span-2">
                  <span className="px-2 py-0.5 bg-white/[0.04] text-slate-500 text-[10px] font-bold rounded-md">
                    {s.server ?? 'KR'}
                  </span>
                </span>
                <span className="col-span-1 text-xs text-slate-500 font-bold">{s.format ?? 'BO3'}</span>
                <span className="col-span-1 text-right text-slate-700 group-hover:text-[#00D2BE] text-xs transition">→</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
