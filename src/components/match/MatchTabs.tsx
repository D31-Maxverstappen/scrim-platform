'use client'

import { useState } from 'react'
import { FlagImg } from '@/components/common/CountrySelect'
import MapIcon from '@/components/common/MapIcon'
import AgentIcon from '@/components/common/AgentIcon'
import { parseRounds, type RoundCell, type RoundReason } from '@/lib/roundResults'
import type { TeamBrief, MatchMap, MatchStat, TeamMemberBrief } from '@/lib/types'

const VAL_MAP_ABBR: Record<string, string> = {
  Ascent: 'ASC', Bind: 'BIND', Haven: 'HVN', Icebox: 'ICE',
  Breeze: 'BRZ', Fracture: 'FRC', Pearl: 'PRL', Lotus: 'LTS',
  Sunset: 'SNS', Abyss: 'ABY', Split: 'SPL', Corrode: 'CRD',
}
const mapAbbr = (name: string | null | undefined) =>
  name ? (VAL_MAP_ABBR[name] ?? name.slice(0, 4).toUpperCase()) : 'TBD'

const teamAbbr = (t: TeamBrief | null | undefined) =>
  t?.abbreviation || t?.name?.slice(0, 3).toUpperCase() || '?'

const GRID = '2fr 1fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr'

// 멤버 배열을 항상 5개로 맞춤 (부족하면 null로 채움)
function padTo5<T>(arr: T[]): (T | null)[] {
  return [...arr, ...Array(Math.max(0, 5 - arr.length)).fill(null)]
}

// 라운드 종료사유 아이콘 (직접 그린 SVG — 라이엇이 배포하지 않는 자산이라 자체 제작)
//  e 제거 · b 스파이크 폭발 · d 해체 · t 시간초과
function RoundIcon({ reason, color }: { reason: RoundReason; color: string }) {
  const shape = {
    e: <><rect x="4.5" y="4.5" width="15" height="15" rx="4" /><path d="M9 9l6 6M15 9l-6 6" /></>,
    b: <><circle cx="12" cy="12" r="2.6" fill={color} stroke="none" /><path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2M5.2 5.2l2.3 2.3M16.5 16.5l2.3 2.3M18.8 5.2l-2.3 2.3M7.5 16.5l-2.3 2.3" /></>,
    d: <><circle cx="6" cy="7" r="2.2" /><circle cx="6" cy="17" r="2.2" /><path d="M8 8.4l11.5 5.8M8 15.6l11.5-5.8" /></>,
    t: <><circle cx="12" cy="12.5" r="8" /><path d="M12 8v4.5l3 2" /></>,
  }[reason]
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke={color}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {shape}
    </svg>
  )
}

function StatHeader({ playerLabel }: { playerLabel: string }) {
  return (
    <div className="grid px-4 py-2 border-b border-white/10 text-[11px] text-slate-600 uppercase tracking-wider"
      style={{ gridTemplateColumns: GRID }}>
      <span>{playerLabel}</span>
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

function StatRow({ stat, gameName }: { stat: MatchStat; gameName: string }) {
  const u = stat.users
  const name = u?.val_gamename ?? u?.riot_gamename ?? '—'
  const rating = stat.deaths > 0 ? (stat.kills / stat.deaths).toFixed(2) : stat.kills.toFixed(2)
  const plusMinus = stat.kills - stat.deaths

  return (
    <div className="grid items-center px-4 py-2.5 border-b border-white/5 hover:bg-white/2 transition"
      style={{ gridTemplateColumns: GRID }}>
      <div className="flex items-center gap-2">
        {stat.agent
          ? <AgentIcon agent={stat.agent} className="w-7 h-7" char="text-[10px]" />
          : u?.avatar_url
            ? <img src={u.avatar_url} alt="" className="w-7 h-7 object-cover" />
            : <div className="w-7 h-7 bg-[#1a1a2e] flex items-center justify-center text-xs font-black text-white/20">{name[0]}</div>
        }
        <div>
          <div className="flex items-center gap-1">
            <FlagImg code={u?.country} size={12} />
            <a href={`/users/${stat.user_id}`} className="text-white text-xs font-semibold hover:text-[#00D2BE] transition">{name}</a>
          </div>
          <span className="text-slate-600 text-[11px]">{gameName}</span>
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

function EmptyStatRow({ member }: { member: TeamMemberBrief | null }) {
  const u = member?.users ?? null
  const name = u?.val_gamename ?? u?.riot_gamename ?? null

  return (
    <div className="grid items-center px-4 py-2.5 border-b border-white/5"
      style={{ gridTemplateColumns: GRID }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-white/5 shrink-0" />
        {name ? (
          <div className="flex items-center gap-1">
            <FlagImg code={u?.country} size={12} />
            <a href={`/users/${member?.user_id}`} className="text-white text-xs font-semibold hover:text-[#00D2BE] transition">{name}</a>
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

function RoundTimeline({ rounds, count, team, color, label }: { rounds: RoundCell[]; count: number; team: 1 | 2; color: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-[11px] text-slate-500 w-6 shrink-0 font-bold">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => {
          const cell = rounds[i]
          return (
            <div key={i} className="w-5 h-5 flex items-center justify-center">
              {cell && cell.winner === team
                ? <RoundIcon reason={cell.reason} color={color} />
                : <span className="w-1 h-1 rounded-full bg-white/10" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// team1=틸, team2=빨강 두 행 + 라운드 번호. 라운드 수는 데이터 길이(없으면 스코어 합)로 동적.
function RoundTimelines({ raw, t1, t2, total }: { raw: string | null; t1: string; t2: string; total: number }) {
  const rounds = parseRounds(raw)
  const count = rounds.length || total || 0
  if (count === 0) return null
  return (
    <>
      <div className="flex items-center gap-3 pb-1 border-b border-white/5">
        <span className="text-[11px] text-slate-600 w-6" />
        <div className="flex gap-0.5">
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="text-[8px] text-slate-700 w-5 text-center">{i + 1}</span>
          ))}
        </div>
      </div>
      <RoundTimeline rounds={rounds} count={count} team={1} color="#00D2BE" label={t1} />
      <RoundTimeline rounds={rounds} count={count} team={2} color="#ff4655" label={t2} />
    </>
  )
}

export default function MatchTabs({ match, team1, team2, maps, stats, team1Members = [], team2Members = [] }: {
  match: unknown
  team1: TeamBrief | null
  team2: TeamBrief | null
  maps: MatchMap[]
  stats: MatchStat[]
  team1Members?: TeamMemberBrief[]
  team2Members?: TeamMemberBrief[]
}) {
  const [tab, setTab] = useState('overview')
  const [mapTab, setMapTab] = useState('all')

  const selectedMap = mapTab === 'all' ? null : maps.find((m) => m.id === mapTab)

  // 전체 맵 탭: 선수별 종합 — K/D/A·FK·FD 합산, ACS·KAST·ADR·HS% 평균
  const aggregateByUser = (rows: MatchStat[]): MatchStat[] => {
    const byUser = new Map<string, MatchStat[]>()
    for (const r of rows) {
      const arr = byUser.get(r.user_id) ?? []
      arr.push(r)
      byUser.set(r.user_id, arr)
    }
    return [...byUser.values()].map((rs) => {
      const n = rs.length
      const sum = (k: keyof MatchStat) => rs.reduce((a, r) => a + (r[k] as number), 0)
      const avg = (k: keyof MatchStat) => Math.round(sum(k) / n)
      return {
        ...rs[0],
        kills: sum('kills'), deaths: sum('deaths'), assists: sum('assists'),
        acs: avg('acs'), kast: avg('kast'), adr: avg('adr'), hs_pct: avg('hs_pct'),
        fk: sum('fk'), fd: sum('fd'),
        map_id: '',
      }
    })
  }

  const filterStats = (teamId: string | undefined) => {
    const teamRows = stats.filter((s) => s.team_id === teamId)
    return mapTab === 'all' ? aggregateByUser(teamRows) : teamRows.filter((s) => s.map_id === mapTab)
  }

  const team1Stats = filterStats(team1?.id)
  const team2Stats = filterStats(team2?.id)

  const t1Score = selectedMap?.team1_score ?? 0
  const t2Score = selectedMap?.team2_score ?? 0
  const mapName = selectedMap?.map_name ?? 'TBD'

  const padded1 = padTo5<MatchStat | TeamMemberBrief>(team1Stats.length > 0 ? team1Stats : team1Members)
  const padded2 = padTo5<MatchStat | TeamMemberBrief>(team2Stats.length > 0 ? team2Stats : team2Members)
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
            className={`px-5 py-2.5 text-xs font-semibold transition border-l border-white/5 flex items-center gap-1.5 ${mapTab === m.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            <span className="text-slate-600">{i + 1}</span>
            <MapIcon map={m.map_name} className="w-4 h-4 rounded-sm" />
            {mapAbbr(m.map_name)}
          </button>
        ))}
      </div>

      {/* VLR 스타일 팀명 + 스코어 */}
      {selectedMap && (
        <div className="px-6 py-4 border-b border-white/10">
          <div className="grid grid-cols-3 items-center mb-4">
            <div>
              <a href={`/teams/${team1?.id}`} className="text-white font-black text-lg hover:text-[#00D2BE] transition">{teamAbbr(team1)}</a>
              <p className="text-slate-600 text-xs">{t1Score} / {t1Score + t2Score > 0 ? t1Score + t2Score : 0}</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <MapIcon map={mapName} className="w-12 h-12 rounded mb-1.5" />
              <p className="text-slate-400 text-sm font-bold">{mapName}</p>
              <p className="text-white font-black text-2xl mt-1">{t1Score} — {t2Score}</p>
            </div>
            <div className="text-right">
              <a href={`/teams/${team2?.id}`} className="text-white font-black text-lg hover:text-[#00D2BE] transition">{teamAbbr(team2)}</a>
              <p className="text-slate-600 text-xs">{t2Score} / {t1Score + t2Score > 0 ? t1Score + t2Score : 0}</p>
            </div>
          </div>

          {/* 라운드 박스 — 라운드 수는 데이터/스코어 합에 맞춰 동적 */}
          <div className="border border-white/5 px-4 py-2">
            <RoundTimelines raw={selectedMap.round_results} t1={teamAbbr(team1)} t2={teamAbbr(team2)} total={t1Score + t2Score} />
          </div>
        </div>
      )}

      {/* 스탯 테이블 */}
      <div className="overflow-x-auto">
        {/* 팀 1 */}
        <div>
          <div className="px-4 py-3 bg-white/2 border-b border-white/5">
            <a href={`/teams/${team1?.id}`} className="text-white text-xl font-black hover:text-[#00D2BE] transition">{team1?.abbreviation || team1?.name}</a>
          </div>
          <StatHeader playerLabel="플레이어" />
          {padded1.map((item, i) =>
            hasStats1 && item
              ? <StatRow key={(item as MatchStat).user_id || `s1-${i}`} stat={item as MatchStat} gameName={team1?.name ?? ''} />
              : <EmptyStatRow key={(item as TeamMemberBrief | null)?.user_id || `e1-${i}`} member={item as TeamMemberBrief | null} />
          )}
        </div>
        {/* 팀 2 */}
        <div className="mt-2">
          <div className="px-4 py-3 bg-white/2 border-b border-white/5">
            <a href={`/teams/${team2?.id}`} className="text-white text-xl font-black hover:text-[#00D2BE] transition">{team2?.abbreviation || team2?.name}</a>
          </div>
          <StatHeader playerLabel="플레이어" />
          {padded2.map((item, i) =>
            hasStats2 && item
              ? <StatRow key={(item as MatchStat).user_id || `s2-${i}`} stat={item as MatchStat} gameName={team2?.name ?? ''} />
              : <EmptyStatRow key={(item as TeamMemberBrief | null)?.user_id || `e2-${i}`} member={item as TeamMemberBrief | null} />
          )}
        </div>
      </div>
    </div>
  )
}
