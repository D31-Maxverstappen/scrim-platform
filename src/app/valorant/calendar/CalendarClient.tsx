'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EmptyState, EmptyIcons } from '@/components/common/EmptyState'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function toDateKey(dt: string) {
  const d = new Date(dt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarClient({
  scrims,
  year,
  month,
}: {
  scrims: any[]
  year: number
  month: number
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // 날짜별 스크림 그룹핑
  const scrimMap: Record<string, any[]> = {}
  scrims.forEach((s) => {
    if (!s.preferred_date) return
    const key = toDateKey(s.preferred_date)
    if (!scrimMap[key]) scrimMap[key] = []
    scrimMap[key].push(s)
  })

  // 달력 셀 계산
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=일
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // 6주 그리드 채우기
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = month === 1
    ? `${year - 1}-12`
    : `${year}-${String(month - 1).padStart(2, '0')}`
  const nextMonth = month === 12
    ? `${year + 1}-01`
    : `${year}-${String(month + 1).padStart(2, '0')}`

  const todayKey = toDateKey(new Date().toISOString())

  const selectedScrims = selectedDay ? (scrimMap[selectedDay] ?? []) : []

  return (
    <div className="flex gap-6">
      {/* 캘린더 */}
      <div className="flex-1 min-w-0">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/valorant/calendar?month=${prevMonth}`}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            ← 이전
          </Link>
          <h2 className="text-white font-bold text-lg">
            {year}년 {month}월
          </h2>
          <Link
            href={`/valorant/calendar?month=${nextMonth}`}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            다음 →
          </Link>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-bold py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-600'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />

            const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const count = scrimMap[key]?.length ?? 0
            const isToday = key === todayKey
            const isSelected = key === selectedDay
            const isSun = idx % 7 === 0
            const isSat = idx % 7 === 6

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(isSelected ? null : key)}
                className={`relative flex items-start aspect-[1/0.8] rounded-md px-2.5 py-2 transition group overflow-hidden ${
                  isSelected
                    ? 'bg-[#00D2BE]/[0.12] border border-[#00D2BE]'
                    : count > 0
                    ? 'bg-[#00D2BE]/[0.06] border border-[#00D2BE]/30 hover:border-[#00D2BE]/55'
                    : 'bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                {/* 공고 있는 날: 좌상단 각진 노치 */}
                {count > 0 && (
                  <span className="absolute top-0 left-0 w-0 h-0 border-t-[11px] border-t-[#00D2BE] border-r-[11px] border-r-transparent rounded-tl-md" />
                )}
                <span className={`font-mono text-sm font-semibold leading-none ${
                  isToday || isSelected
                    ? 'text-[#00D2BE]'
                    : isSun
                    ? 'text-red-400/55'
                    : isSat
                    ? 'text-blue-400/55'
                    : 'text-slate-100'
                }`}>
                  {day}
                </span>
                {/* 오늘: 우상단 링 표시 */}
                {isToday && !isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-[#00D2BE]" />
                )}
                {/* 공고 수 배지 */}
                {count > 0 && (
                  <span className="absolute bottom-1.5 right-1.5 font-mono text-[10px] font-bold leading-none text-[#04342C] bg-[#00D2BE] px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-[#00D2BE]" /> 스크림 공고
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full border border-[#00D2BE]" /> 오늘
          </span>
        </div>
      </div>

      {/* 사이드 패널 */}
      <div className="w-72 shrink-0">
        {selectedDay ? (
          <div className="bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden sticky top-28">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-white font-bold text-sm">
                {Number(selectedDay.split('-')[2])}일 스크림
              </p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#00D2BE]/10 text-[#00D2BE]">
                {selectedScrims.length}개
              </span>
            </div>
            {selectedScrims.length === 0 ? (
              <div className="py-10 text-center text-slate-600 text-xs">
                이 날짜에 스크림 없음
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                {selectedScrims.map((s) => {
                  const team = Array.isArray(s.teams) ? s.teams[0] : s.teams
                  return (
                    <Link
                      key={s.id}
                      href={`/scrims/${s.id}`}
                      className="block px-5 py-3.5 hover:bg-white/[0.03] transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-sm">{team?.name ?? '—'}</span>
                        {s.format && (
                          <span className="text-[10px] font-black bg-[#00D2BE]/10 text-[#00D2BE] px-1.5 py-0.5 rounded">
                            {s.format}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        {s.preferred_date && <span>🕐 {formatTime(s.preferred_date)}</span>}
                        {team?.tier_avg && <span>· {team.tier_avg}</span>}
                      </div>
                      {(s.tier_min || s.tier_max) && (
                        <p className="text-[10px] text-slate-600 mt-1">
                          {s.tier_min && s.tier_max
                            ? `${s.tier_min} ~ ${s.tier_max}`
                            : s.tier_min ? `${s.tier_min} 이상` : `${s.tier_max} 이하`}
                        </p>
                      )}
                      {s.note && (
                        <p className="text-[11px] text-slate-600 mt-1 truncate">{s.note}</p>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="sticky top-28">
            <EmptyState
              icon={EmptyIcons.target}
              title="날짜를 선택하세요"
              description={<>달력에서 날짜를 클릭하면<br/>해당일 스크림 목록이 표시됩니다</>}
              accent="#00D2BE"
            />
          </div>
        )}
      </div>
    </div>
  )
}
