'use client'

import { useState } from 'react'

const TIER_ORDER: Record<string, number> = {
  Challenger: 0, Grandmaster: 1, Master: 2, Radiant: 2,
  Diamond: 3, Emerald: 4, Immortal: 4,
  Platinum: 5, Ascendant: 5, Gold: 6, Silver: 7, Bronze: 8, Iron: 9, Unranked: 99,
}

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
  { key: 'tier', label: '티어' },
  { key: 'winrate', label: '승률' },
  { key: 'activity', label: '활동' },
]

const MEDALS = ['🥇', '🥈', '🥉']

export default function TeamRankings({ teams, game }: { teams: Team[]; game?: string }) {
  const [tab, setTab] = useState('tier')

  const filtered = game ? teams.filter((t) => t.game_type === game) : teams
  const sorted = [...filtered].sort((a, b) => {
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
    <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">팀 랭킹</p>
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-0.5">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                tab === t.key ? 'bg-[#00D2BE]/20 text-[#00D2BE]' : 'text-slate-600 hover:text-slate-400'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-slate-700 text-xs">
          아직 팀이 없어요
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {sorted.map((team, i) => {
            const total = team.wins + team.losses
            const winrate = total === 0 ? null : Math.round((team.wins / total) * 100)

            return (
              <a key={team.id} href={`/teams/${team.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition group">
                <span className="w-6 text-center text-xs shrink-0">
                  {i < 3
                    ? <span className="text-sm">{MEDALS[i]}</span>
                    : <span className="text-slate-700 font-bold">{i + 1}</span>
                  }
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate group-hover:text-[#00D2BE] transition">
                    {team.name}
                  </p>
                  {tab === 'winrate' && total > 0 && (
                    <p className="text-slate-700 text-[10px]">{team.wins}승 {team.losses}패</p>
                  )}
                </div>
                <span className="text-xs font-bold shrink-0 text-slate-400">
                  {tab === 'tier' && (team.tier_avg ?? '—')}
                  {tab === 'winrate' && (winrate !== null ? `${winrate}%` : '—')}
                  {tab === 'activity' && `${team.scrim_count}회`}
                </span>
                <span className="text-slate-700 group-hover:text-[#00D2BE] text-xs transition">→</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
