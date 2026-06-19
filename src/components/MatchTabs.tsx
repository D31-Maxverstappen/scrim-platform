'use client'

import { useState } from 'react'
import { FlagImg } from './CountrySelect'

const ROUND_COLORS: Record<string, string> = {
  W: '#00D2BE', L: '#ff4655', D: '#6b7280',
}

function RoundBox({ result }: { result: string }) {
  return (
    <div className="w-5 h-5 flex items-center justify-center text-[9px] font-black"
      style={{ background: (ROUND_COLORS[result] ?? '#374151') + '33', color: ROUND_COLORS[result] ?? '#6b7280' }}>
      {result}
    </div>
  )
}

function StatRow({ stat, gameName }: { stat: any; name?: string; gameName: string }) {
  const u = stat.users
  const name = u?.val_gamename ?? u?.lol_gamename ?? u?.riot_gamename ?? '—'
  const rating = stat.deaths > 0 ? (stat.kills / stat.deaths).toFixed(2) : stat.kills.toFixed(2)
  const kd = `${stat.kills} / ${stat.deaths} / ${stat.assists}`
  const plusMinus = stat.kills - stat.deaths

  return (
    <div className="grid items-center px-4 py-2.5 border-b border-white/5 hover:bg-white/2 transition"
      style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
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
      <span className="text-slate-400 text-xs text-center">{kd}</span>
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

function StatHeader() {
  return (
    <div className="grid px-4 py-2 border-b border-white/10 text-[10px] text-slate-600 uppercase tracking-wider"
      style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
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

export default function MatchTabs({ match, team1, team2, maps, stats }: {
  match: any
  team1: any
  team2: any
  maps: any[]
  stats: any[]
}) {
  const [tab, setTab] = useState('overview')
  const [mapTab, setMapTab] = useState('all')

  const selectedMap = mapTab === 'all' ? null : maps.find((m) => m.id === mapTab)

  const filterStats = (teamId: string) =>
    stats.filter((s) => s.team_id === teamId && (mapTab === 'all' || s.map_id === mapTab))

  const team1Stats = filterStats(team1?.id)
  const team2Stats = filterStats(team2?.id)

  const team1MapScore = selectedMap ? selectedMap.team1_score : null
  const team2MapScore = selectedMap ? selectedMap.team2_score : null

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

      {/* 스코어 바 */}
      {selectedMap && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-2xl">{team1MapScore}</span>
            <span className="text-slate-600 text-sm">{team1?.name}</span>
          </div>
          <span className="text-slate-700">—</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 text-sm">{team2?.name}</span>
            <span className="text-white font-black text-2xl">{team2MapScore}</span>
          </div>
        </div>
      )}

      {/* 라운드 타임라인 (맵 선택 시) */}
      {selectedMap?.round_results && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex gap-1 flex-wrap">
            {selectedMap.round_results.split('').map((r: string, i: number) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] text-slate-700">{i + 1}</span>
                <RoundBox result={r} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 스탯 테이블 */}
      <div className="overflow-x-auto">
        {team1Stats.length === 0 && team2Stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <p className="text-sm">아직 스탯이 없어요</p>
            <p className="text-xs mt-1 text-slate-700">매치 종료 후 스탯을 입력해주세요</p>
          </div>
        ) : (
          <>
            {/* 팀 1 */}
            {team1Stats.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-white/2 border-b border-white/5">
                  <span className="text-white text-xs font-bold">{team1?.name}</span>
                </div>
                <StatHeader />
                {team1Stats.map((s: any) => (
                  <StatRow key={s.id} stat={s} gameName={team1?.name} />
                ))}
              </div>
            )}
            {/* 팀 2 */}
            {team2Stats.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-white/2 border-b border-white/5 mt-2">
                  <span className="text-white text-xs font-bold">{team2?.name}</span>
                </div>
                <StatHeader />
                {team2Stats.map((s: any) => (
                  <StatRow key={s.id} stat={s} gameName={team2?.name} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
