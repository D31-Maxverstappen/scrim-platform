'use client'

import { useState } from 'react'

const GAME_COLOR: Record<string, string> = {
  lol: '#c89b3c', valorant: '#ff4655',
}

const TABS = [
  { key: 'valorant', label: 'VALORANT' },
  { key: 'lol', label: 'League of Legends' },
]

export default function ScrimList({ scrims, game }: { scrims: any[]; game?: string }) {
  const [tab, setTab] = useState(game ?? 'valorant')

  const filtered = scrims.filter((s) => s.game_type === (game ?? tab))
  const gameColor = game === 'lol' ? '#c89b3c' : game === 'valorant' ? '#ff4655' : '#00D2BE'
  const allLink = game ? `/${game}/scrims` : '/scrims'

  return (
    <div className="bg-[#13131f] border border-white/5 overflow-hidden">

      {/* 탭 헤더 */}
      <div className="flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex">
          {!game && TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3.5 text-xs font-bold border-b-2 transition ${
                tab === t.key ? 'border-[#00D2BE] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
          {game && (
            <span className="px-4 py-3.5 text-xs font-bold text-white">
              스크림 게시판
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
          <a href={allLink} className="text-xs hover:underline" style={{ color: gameColor }}>전체 보기 →</a>
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/10 text-xs text-slate-600 uppercase tracking-wider">
        <span className="col-span-4">팀 이름</span>
        <span className="col-span-2">평균 티어</span>
        <span className="col-span-3">희망 시간</span>
        <span className="col-span-2">서버</span>
        <span className="col-span-1 text-right">신청</span>
      </div>

      {/* 스크림 목록 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <p className="text-sm mb-1">모집 중인 스크림이 없어요</p>
          <a href="/scrims/post" className="mt-3 bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-xs font-semibold px-5 py-2 transition">
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
                className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-white/3 transition items-center group border-l-2 border-transparent hover:border-[#00D2BE] ${i !== 0 ? 'border-t border-t-white/10' : ''}`}
              >
                <span className="col-span-4 text-white text-xs font-semibold truncate group-hover:text-[#00D2BE] transition">{t?.name ?? '—'}</span>
                <span className="col-span-2 text-slate-500 text-xs truncate">{t?.tier_avg ?? '—'}</span>
                <span className="col-span-3 text-slate-500 text-xs">{date}</span>
                <span className="col-span-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-white/5 text-slate-400 text-[10px] font-bold">
                    {s.server ?? 'KR'}
                  </span>
                </span>
                <span className="col-span-1 text-right text-[#00D2BE] text-xs">→</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
