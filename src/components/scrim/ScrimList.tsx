'use client'
import Link from 'next/link'
import { formatKST } from '@/lib/datetime'
import { CalendarIcon } from '@/components/common/icons'

import { useState } from 'react'
import type { ScrimPost } from '@/lib/types'

const VAL_TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']

export default function ScrimList({ scrims, game }: { scrims: ScrimPost[]; game?: string }) {
  const [filterServer, setFilterServer] = useState('')
  const [filterFormat, setFilterFormat] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const activeGame = game ?? 'valorant'
  const gameColor = '#00D2BE'
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
    `px-2.5 py-1 text-[11px] font-bold rounded-sm transition cursor-pointer select-none ${
      active ? 'bg-[#00D2BE]/20 text-[#00D2BE] border border-[#00D2BE]/40' : 'bg-white/[0.04] text-slate-500 border border-transparent hover:bg-white/[0.08] hover:text-slate-300'
    }`

  return (
    <div className="bg-[#0d0d1a] border border-white/[0.10] rounded overflow-hidden card-glow transition-all duration-300">

      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">스크림 게시판</p>
          <span className="flex items-center gap-1.5 text-[11px] text-green-400 font-bold"
            style={{ textShadow: '0 0 8px rgba(74,222,128,0.7)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
              style={{ boxShadow: '0 0 6px rgba(74,222,128,0.9)' }} />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] font-bold transition border ${
              filterOpen || activeCount > 0
                ? 'bg-[#00D2BE]/10 border-[#00D2BE]/30 text-[#00D2BE]'
                : 'bg-white/[0.04] border-white/[0.10] text-slate-500 hover:text-slate-300'
            }`}
          >
            필터
            {activeCount > 0 && (
              <span className="bg-[#00D2BE] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
          <a href={allLink} className="text-[11px] font-bold text-slate-400 hover:text-white transition">
            전체 보기 →
          </a>
        </div>
      </div>

      {/* 필터 패널 */}
      {filterOpen && (
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">서버</span>
            {['KR', 'AS'].map((s) => (
              <button key={s} onClick={() => setFilterServer(filterServer === s ? '' : s)} className={chip(filterServer === s)}>{s}</button>
            ))}
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">포맷</span>
            {['BO1', 'BO3', 'BO5'].map((f) => (
              <button key={f} onClick={() => setFilterFormat(filterFormat === f ? '' : f)} className={chip(filterFormat === f)}>{f}</button>
            ))}
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">티어</span>
            {VAL_TIERS.map((tier) => (
              <button key={tier} onClick={() => setFilterTier(filterTier === tier ? '' : tier)} className={chip(filterTier === tier)}>{tier}</button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-slate-700">
          <p className="text-sm font-semibold mb-1">조건에 맞는 스크림이 없어요</p>
          <Link href="/scrims/post" className="mt-3 text-slate-400 hover:text-white text-xs font-bold transition">
            + 스크림 올리기
          </Link>
        </div>
      ) : (
        <div>
          {filtered.map((s, i) => {
            const t = Array.isArray(s.teams) ? s.teams[0] : s.teams
            const date = s.preferred_date
              ? formatKST(s.preferred_date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '미정'
            return (
              <a
                key={s.id}
                href={`/scrims/${s.id}`}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition group ${i !== 0 ? 'border-t border-t-white/[0.04]' : ''}`}
              >
                {/* 각진 틸 액센트 바 (스크림 페이지와 통일) */}
                <div className="w-1.5 h-10 shrink-0 bg-[#00D2BE]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-white text-sm font-semibold truncate group-hover:text-[#00D2BE] transition">{t?.name ?? '—'}</span>
                    {t?.tier_avg && <span className="text-slate-500 text-xs shrink-0">· {t.tier_avg}</span>}
                    <span className="text-[11px] font-black bg-[#00D2BE]/10 text-[#00D2BE] px-1.5 py-0.5 rounded shrink-0">{s.format ?? 'BO3'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap"><CalendarIcon className="w-3.5 h-3.5 shrink-0" />{date}</span>
                    <span className="px-1.5 py-0.5 bg-white/[0.04] rounded text-[11px] font-bold shrink-0">{s.server ?? 'KR'}</span>
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-[#00D2BE] text-sm transition shrink-0">→</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
