'use client'

import { useState } from 'react'

const TIER_ORDER: Record<string, number> = {
  Challenger: 0, Grandmaster: 1, Master: 2, Radiant: 2,
  Diamond: 3, Emerald: 4, Immortal: 4,
  Platinum: 5, Ascendant: 5, Gold: 6, Silver: 7, Bronze: 8, Iron: 9, Unranked: 99,
}

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }
const GAME_LABEL: Record<string, string> = { valorant: 'VAL', lol: 'LoL' }

function tierScore(tier_avg: string | null) {
  if (!tier_avg) return 999
  const base = tier_avg.split(' ')[0]
  const rank = parseInt(tier_avg.split(' ')[1] ?? '2')
  return (TIER_ORDER[base] ?? 99) * 10 + (rank || 2)
}

type Team = {
  id: string
  name: string
  game_type: string
  tier_avg: string | null
  wins: number
  losses: number
  scrim_count: number
}

const TABS = [
  { key: 'tier', label: '평균 티어' },
  { key: 'winrate', label: '승률' },
  { key: 'activity', label: '스크림 활동' },
]

export default function TeamRankings({ teams }: { teams: Team[] }) {
  const [tab, setTab] = useState('tier')

  const sorted = [...teams].sort((a, b) => {
    if (tab === 'tier') return tierScore(a.tier_avg) - tierScore(b.tier_avg)
    if (tab === 'winrate') {
      const aTotal = a.wins + a.losses
      const bTotal = b.wins + b.losses
      const aRate = aTotal === 0 ? -1 : a.wins / aTotal
      const bRate = bTotal === 0 ? -1 : b.wins / bTotal
      return bRate - aRate
    }
    return b.scrim_count - a.scrim_count
  }).slice(0, 5)

  return (
    <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
      <div className="px-4 pt-3 pb-0 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-bold text-xs uppercase tracking-widest">팀 랭킹</p>
          <a href="/leaderboard" className="text-[#00D2BE] text-xs hover:underline">전체 →</a>
        </div>
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${tab === t.key ? 'border-[#00D2BE] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-slate-600 text-xs">
          아직 팀이 없어요
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/5">
          {sorted.map((team, i) => {
            const gc = GAME_COLOR[team.game_type] ?? '#00D2BE'
            const total = team.wins + team.losses
            const winrate = total === 0 ? null : Math.round((team.wins / total) * 100)

            return (
              <a key={team.id} href={`/teams/${team.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/2 transition">
                <span className={`text-xs font-black w-4 text-center shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                  {i + 1}
                </span>
                <span className="text-xs font-bold shrink-0" style={{ color: gc }}>{GAME_LABEL[team.game_type]}</span>
                <span className="text-white text-xs font-semibold flex-1 truncate">{team.name}</span>
                <span className="text-slate-500 text-xs shrink-0">
                  {tab === 'tier' && (team.tier_avg ?? '—')}
                  {tab === 'winrate' && (winrate !== null ? `${winrate}%` : '—')}
                  {tab === 'activity' && `${team.scrim_count}회`}
                </span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
