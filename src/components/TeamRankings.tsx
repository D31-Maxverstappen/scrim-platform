'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n'

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

export default function TeamRankings({ teams, game }: { teams: Team[]; game?: string }) {
  const { lang } = useLang()
  const [tab, setTab] = useState('tier')

  const TABS = [
    { key: 'tier', label: t('ranking_avg_tier', lang) },
    { key: 'winrate', label: t('ranking_winrate', lang) },
    { key: 'activity', label: t('ranking_activity', lang) },
  ]

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
    <div className="bg-[#13131f] border border-white/5 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 pt-3 pb-0 border-b border-white/5">
        <p className="text-white font-bold text-xs uppercase tracking-widest mb-2">{t('ranking_title', lang)}</p>
        <div className="flex gap-0">
          {TABS.map((tab_item) => (
            <button key={tab_item.key} onClick={() => setTab(tab_item.key)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${tab === tab_item.key ? 'border-[#00D2BE] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {tab_item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-600 uppercase tracking-wider">
        <span className="col-span-1">{t('ranking_col_rank', lang)}</span>
        <span className="col-span-2">Game</span>
        <span className="col-span-6">{t('ranking_col_team', lang)}</span>
        <span className="col-span-3 text-right">{t('ranking_col_value', lang)}</span>
      </div>

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-slate-600 text-xs">
          {t('ranking_no_teams', lang)}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/5">
          {sorted.map((team, i) => {
            const gc = GAME_COLOR[team.game_type] ?? '#00D2BE'
            const total = team.wins + team.losses
            const winrate = total === 0 ? null : Math.round((team.wins / total) * 100)

            return (
              <a key={team.id} href={`/teams/${team.id}`} className="grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-white/5 transition items-center group">
                <span className={`col-span-1 text-xs font-black text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                  {i + 1}
                </span>
                <span className="col-span-2 text-xs font-bold" style={{ color: gc }}>{GAME_LABEL[team.game_type]}</span>
                <span className="col-span-5 text-white text-xs font-semibold truncate group-hover:text-[#00D2BE] transition">{team.name}</span>
                <span className="col-span-3 text-right text-slate-500 text-xs shrink-0">
                  {tab === 'tier' && (team.tier_avg ?? '—')}
                  {tab === 'winrate' && (winrate !== null ? `${winrate}%` : '—')}
                  {tab === 'activity' && team.scrim_count}
                </span>
                <span className="col-span-1 text-right text-slate-700 group-hover:text-[#00D2BE] text-xs transition">→</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
