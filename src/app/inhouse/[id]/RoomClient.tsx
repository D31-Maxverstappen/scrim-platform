'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InviteButton from '@/components/InviteButton'

const STATUS_LABEL: Record<string, string> = {
  recruiting: '모집중', full: '인원마감', ongoing: '진행중', done: '종료',
}
const STATUS_COLOR: Record<string, string> = {
  recruiting: 'bg-green-500/10 text-green-400',
  full: 'bg-yellow-500/10 text-yellow-400',
  ongoing: 'bg-[#00D2BE]/10 text-[#00D2BE]',
  done: 'bg-white/5 text-slate-500',
}
const MODE_LABEL: Record<string, string> = {
  random: '랜덤', balanced: '밸런스', captain: '캡틴픽',
}
const TEAM_COLOR: Record<string, string> = { A: '#ff4655', B: '#00D2BE' }

function PlayerCard({ p, showTeam }: { p: any; showTeam: boolean }) {
  const u = p.users
  const name = u?.val_gamename ?? u?.riot_gamename ?? '—'
  const tier = u?.val_tier ?? u?.tier ?? '—'
  const team = p.team

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
      showTeam && team
        ? `border-[${TEAM_COLOR[team]}]/20 bg-[${TEAM_COLOR[team]}]/5`
        : 'border-white/5 bg-[#13131f]'
    }`}
    style={showTeam && team ? { borderColor: TEAM_COLOR[team] + '33', backgroundColor: TEAM_COLOR[team] + '0d' } : {}}>
      <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white/30">
        {u?.avatar_url
          ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
          : name[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{name}</p>
        <p className="text-slate-500 text-xs">{tier}</p>
      </div>
      {showTeam && team && (
        <span className="text-xs font-black px-2 py-0.5 rounded shrink-0"
          style={{ color: TEAM_COLOR[team], backgroundColor: TEAM_COLOR[team] + '22' }}>
          Team {team}
        </span>
      )}
    </div>
  )
}

export default function RoomClient({
  room, participants, currentUserId, isHost, isParticipant,
}: {
  room: any
  participants: any[]
  currentUserId: string
  isHost: boolean
  isParticipant: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const teamsAssigned = participants.some((p) => p.team)
  const teamA = participants.filter((p) => p.team === 'A')
  const teamB = participants.filter((p) => p.team === 'B')
  const unassigned = participants.filter((p) => !p.team)
  const isFull = participants.length >= room.max_players
  const canJoin = !isParticipant && room.status === 'recruiting' && !isFull

  const handle = async (action: string, body?: object) => {
    setLoading(action)
    let url = `/api/inhouse/${room.id}`
    let method = 'POST'
    if (action === 'join') { url += '/join'; method = 'POST' }
    if (action === 'leave') { url += '/join'; method = 'DELETE' }
    if (action === 'assign') { url += '/assign' }
    if (action === 'resultA' || action === 'resultB') { url += '/result' }

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    setLoading(null)
    router.refresh()
  }

  const formatDate = (dt: string | null) => {
    if (!dt) return null
    return new Date(dt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 헤더 */}
      <div className="bg-[#13131f] border border-white/5 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <Link href="/inhouse" className="text-xs text-slate-600 hover:text-slate-400 transition mb-2 block">← 내전 목록</Link>
            <h1 className="text-white font-bold text-xl">{room.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isHost && room.status === 'recruiting' && (
              <InviteButton type="inhouse" targetId={room.id} />
            )}
            <span className={`text-xs font-black px-3 py-1 rounded-full ${STATUS_COLOR[room.status]}`}>
              {STATUS_LABEL[room.status]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span>방장: <span className="text-white">{room.host?.val_gamename ?? room.host?.riot_gamename ?? '—'}</span></span>
          <span>팀 구성: <span className="text-white">{MODE_LABEL[room.team_mode]}</span></span>
          <span>인원: <span className="text-white">{participants.length} / {room.max_players}</span></span>
          {room.scheduled_at && <span>일시: <span className="text-white">{formatDate(room.scheduled_at)}</span></span>}
          {(room.tier_min || room.tier_max) && (
            <span>티어: <span className="text-white">
              {room.tier_min && room.tier_max ? `${room.tier_min} ~ ${room.tier_max}`
                : room.tier_min ? `${room.tier_min} 이상` : `${room.tier_max} 이하`}
            </span></span>
          )}
        </div>

        {/* 참가 / 나가기 버튼 */}
        {canJoin && (
          <button
            onClick={() => handle('join')}
            disabled={!!loading}
            className="mt-5 w-full py-3 rounded-xl text-sm font-bold bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white transition"
          >
            {loading === 'join' ? '참가 중...' : '⚡ 참가하기'}
          </button>
        )}
        {isParticipant && !isHost && room.status === 'recruiting' && (
          <button
            onClick={() => handle('leave')}
            disabled={!!loading}
            className="mt-5 w-full py-3 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-400 transition"
          >
            {loading === 'leave' ? '나가는 중...' : '나가기'}
          </button>
        )}
      </div>

      {/* 참가자 목록 */}
      {!teamsAssigned ? (
        <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-4">참가자 {participants.length}명</p>
          <div className="flex flex-col gap-2">
            {participants.map((p) => <PlayerCard key={p.id} p={p} showTeam={false} />)}
          </div>

          {/* 방장 팀 배정 버튼 */}
          {isHost && participants.length >= 2 && room.status !== 'done' && room.team_mode !== 'captain' && (
            <button
              onClick={() => handle('assign')}
              disabled={!!loading}
              className="mt-4 w-full py-3 rounded-xl text-sm font-bold bg-[#00D2BE]/10 hover:bg-[#00D2BE]/20 text-[#00D2BE] disabled:opacity-50 transition"
            >
              {loading === 'assign' ? '배정 중...' : '⚡ 팀 배정하기'}
            </button>
          )}
        </div>
      ) : (
        /* 팀 배정 후 */
        <div className="grid grid-cols-2 gap-4">
          {[{ team: 'A', list: teamA }, { team: 'B', list: teamB }].map(({ team, list }) => (
            <div key={team} className="bg-[#13131f] border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-black mb-3" style={{ color: TEAM_COLOR[team] }}>Team {team}</p>
              <div className="flex flex-col gap-2">
                {list.map((p) => <PlayerCard key={p.id} p={p} showTeam={false} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 결과 입력 (방장, 진행중) */}
      {isHost && teamsAssigned && ['ongoing', 'full'].includes(room.status) && (
        <div className="bg-[#13131f] border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-4">결과 입력</p>
          <div className="flex gap-3">
            <button
              onClick={() => handle('resultA', { winnerTeam: 'A' })}
              disabled={!!loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#ff4655]/10 hover:bg-[#ff4655]/20 text-[#ff4655] disabled:opacity-50 transition"
            >
              {loading === 'resultA' ? '저장 중...' : 'Team A 승리'}
            </button>
            <button
              onClick={() => handle('resultB', { winnerTeam: 'B' })}
              disabled={!!loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#00D2BE]/10 hover:bg-[#00D2BE]/20 text-[#00D2BE] disabled:opacity-50 transition"
            >
              {loading === 'resultB' ? '저장 중...' : 'Team B 승리'}
            </button>
          </div>
        </div>
      )}

      {/* 결과 표시 */}
      {room.status === 'done' && room.winner_team && (
        <div className="bg-[#13131f] border rounded-2xl p-6 text-center"
          style={{ borderColor: TEAM_COLOR[room.winner_team] + '33' }}>
          <p className="text-slate-500 text-xs mb-2">최종 결과</p>
          <p className="text-2xl font-black" style={{ color: TEAM_COLOR[room.winner_team] }}>
            Team {room.winner_team} 승리 🏆
          </p>
        </div>
      )}
    </div>
  )
}
