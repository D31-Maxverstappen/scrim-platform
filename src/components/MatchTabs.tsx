'use client'

import { useState } from 'react'
import { FlagImg } from './CountrySelect'

const ROUND_COLORS: Record<string, string> = {
  W: '#00D2BE', L: '#ff4655', D: '#6b7280',
}

const GRID = '2fr 1fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr'

// 멤버 배열을 항상 5개로 맞춤 (부족하면 null로 채움)
function padTo5(arr: any[]): (any | null)[] {
  return [...arr, ...Array(Math.max(0, 5 - arr.length)).fill(null)]
}

function RoundBox({ result }: { result: string | null }) {
  if (!result) return (
    <div className="w-5 h-5 bg-white/5" />
  )
  return (
    <div className="w-5 h-5 flex items-center justify-center text-[9px] font-black"
      style={{ background: (ROUND_COLORS[result] ?? '#374151') + '33', color: ROUND_COLORS[result] ?? '#6b7280' }}>
      {result}
    </div>
  )
}

function StatHeader() {
  return (
    <div className="grid px-4 py-2 border-b border-white/10 text-[10px] text-slate-600 uppercase tracking-wider"
      style={{ gridTemplateColumns: GRID }}>
      <span>플레이어</span>
      <span className="text-center">R</span>
      <span className="text-center">ACS</span>
      <span className="text-center">K / D / A</span>
      <span className="text-center">+/−</span>
      <span className="text-center">KAST</span>
      <span className="text-center">ADR</span>
      <span className="text-center">HS%</span>
      <span className="text-center">FK</span>
      <span className="text-center">FD</span>
    </div>
  )
}

function StatRow({ stat, gameName }: { stat: any; gameName: string }) {
  const u = stat.users
  const name = u?.val_gamename ?? u?.lol_gamename ?? u?.riot_gamename ?? '—'
  const rating = stat.deaths > 0 ? (stat.kills / stat.deaths).toFixed(2) : stat.kills.toFixed(2)
  const plusMinus = stat.kills - stat.deaths

  return (
    <div className="grid items-center px-4 py-2.5 border-b border-white/5 hover:bg-white/2 transition"
      style={{ gridTemplateColumns: GRID }}>
      <div className="flex items-center gap-2">
        {u?.avatar_url
          ? <img src={u.avatar_url} alt="" className="w-7 h-7 object-cover" />
          : <div className="w-7 h-7 bg-[#1a1a2e] flex items-center justify-center text-xs font-black text-white/20">{name[0]}</div>
        }
        <div>
          <div className="flex items-center gap-1">
            <FlagImg code={u?.country} size={12} />
            <span className="text-white text-xs font-semibold">{name}</span>
          </div>
          <span className="text-slate-600 text-[10px]">{gameName}</span>
        </div>
      </div>
      <span className="text-white text-xs font-bold text-center">{rating}</span>
      <span className="text-slate-400 text-xs text-center">{stat.acs}</span>
      <span className="text-slate-400 text-xs text-center">{stat.kills} / {stat.deaths} / {stat.assists}</span>
      <span className={`text-xs text-center font-bold ${plusMinus > 0 ? 'text-green-400' : plusMinus < 0 ? 'text-red-400' : 'text-slate-500'}`}>
        {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
      </span>
      <span className="text-slate-400 text-xs text-center">{stat.kast}%</span>
      <span className="text-slate-400 text-xs text-center">{stat.adr}</span>
      <span className="text-slate-400 text-xs text-center">{stat.hs_pct}%</span>
      <span className="text-slate-400 text-xs text-center">{stat.fk}</span>
      <span className="text-slate-400 text-xs text-center">{stat.fd}</span>
    </div>
  )
}

function EmptyStatRow({ member }: { member: any | null }) {
  const u = member?.users ?? null
  const name = u?.val_gamename ?? u?.lol_gamename ?? u?.riot_gamename ?? null

  return (
    <div className="grid items-center px-4 py-2.5 border-b border-white/5"
      style={{ gridTemplateColumns: GRID }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-white/5 shrink-0" />
        {name ? (
          <div className="flex items-center gap-1">
            <FlagImg code={u?.country} size={12} />
            <span className="text-white text-xs font-semibold">{name}</span>
          </div>
        ) : (
          <div className="h-3 w-20 bg-white/5" />
        )}
      </div>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex justify-center">
          <span className="block h-4 bg-white/5 w-10" />
        </div>
      ))}
    </div>
  )
}

function RoundTimeline({ results, label }: { results: string | null; label: string }) {
  const totalRounds = 24
  const chars = results ? results.split('') : []

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-[10px] text-slate-500 w-6 shrink-0 font-bold">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <RoundBox key={i} result={chars[i] ?? null} />
        ))}
      </div>
    </div>
  )
}

export default function MatchTabs({ match, team1, team2, maps, stats, team1Members = [], team2Members = [] }: {
  match: any
  team1: any
  team2: any
  maps: any[]
  stats: any[]
  team1Members?: any[]
  team2Members?: any[]
}) {
  const [tab, setTab] = useState('overview')
  const [mapTab, setMapTab] = useState('all')

  const selectedMap = mapTab === 'all' ? null : maps.find((m) => m.id === mapTab)

  const filterStats = (teamId: string) =>
    stats.filter((s) => s.team_id === teamId && (mapTab === 'all' || s.map_id === mapTab))

  const team1Stats = filterStats(team1?.id)
  const team2Stats = filterStats(team2?.id)

  const t1Score = selectedMap?.team1_score ?? 0
  const t2Score = selectedMap?.team2_score ?? 0
  const mapName = selectedMap?.map_name ?? 'TBD'

  const padded1 = padTo5(team1Stats.length > 0 ? team1Stats : team1Members)
  const padded2 = padTo5(team2Stats.length > 0 ? team2Stats : team2Members)
  const hasStats1 = team1Stats.length > 0
  const hasStats2 = team2Stats.length > 0

  return (
    <div className="bg-[#13131f] border border-white/5">

      {/* 메인 탭 */}
      <div className="flex border-b border-white/10">
        {[
          { key: 'overview', label: '개요' },
          { key: 'stats', label: '통계' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-6 py-3.5 text-xs font-bold border-b-2 transition ${tab === t.key ? 'border-[#00D2BE] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 맵 탭 */}
      <div className="flex border-b border-white/10">
        <button onClick={() => setMapTab('all')}
          className={`px-5 py-2.5 text-xs font-semibold transition ${mapTab === 'all' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          전체 맵
        </button>
        {maps.map((m, i) => (
          <button key={m.id} onClick={() => setMapTab(m.id)}
            className={`px-5 py-2.5 text-xs font-semibold transition border-l border-white/5 ${mapTab === m.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            <span className="text-slate-600 mr-1">{i + 1}</span>
            {m.map_name || 'TBD'}
          </button>
        ))}
      </div>

      {/* VLR 스타일 팀명 + 스코어 */}
      {selectedMap && (
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-black text-lg">{team1?.name}</p>
              <p className="text-slate-600 text-xs">{t1Score} / {t1Score + t2Score > 0 ? t1Score + t2Score : 0}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm font-bold">{mapName}</p>
              <p className="text-white font-black text-2xl mt-1">{t1Score} — {t2Score}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-black text-lg">{team2?.name}</p>
              <p className="text-slate-600 text-xs">{t2Score} / {t1Score + t2Score > 0 ? t1Score + t2Score : 0}</p>
            </div>
          </div>

          {/* 라운드 박스 */}
          <div className="border border-white/5 px-4 py-2">
            <div className="flex items-center gap-3 pb-1 border-b border-white/5">
              <span className="text-[10px] text-slate-600 w-6" />
              <div className="flex gap-0.5">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="text-[8px] text-slate-700 w-5 text-center">{i + 1}</span>
                ))}
              </div>
            </div>
            <RoundTimeline results={selectedMap.round_results} label={team1?.name?.slice(0, 3).toUpperCase() ?? 'T1'} />
            <RoundTimeline results={null} label={team2?.name?.slice(0, 3).toUpperCase() ?? 'T2'} />
          </div>
        </div>
      )}

      {/* 스탯 테이블 */}
      <div className="overflow-x-auto">
        {/* 팀 1 */}
        <div>
          <div className="px-4 py-3 bg-white/2 border-b border-white/5">
            <span className="text-white text-xl font-black">{team1?.abbreviation || team1?.name}</span>
          </div>
          <StatHeader />
          {padded1.map((item, i) =>
            hasStats1 && item
              ? <StatRow key={item.id ?? i} stat={item} gameName={team1?.name} />
              : <EmptyStatRow key={i} member={item} />
          )}
        </div>
        {/* 팀 2 */}
        <div className="mt-2">
          <div className="px-4 py-3 bg-white/2 border-b border-white/5">
            <span className="text-white text-xl font-black">{team2?.abbreviation || team2?.name}</span>
          </div>
          <StatHeader />
          {padded2.map((item, i) =>
            hasStats2 && item
              ? <StatRow key={item.id ?? i} stat={item} gameName={team2?.name} />
              : <EmptyStatRow key={i} member={item} />
          )}
        </div>
      </div>
    </div>
  )
}
