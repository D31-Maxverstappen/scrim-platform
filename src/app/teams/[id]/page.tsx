import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import JoinTeamButton from '@/components/JoinTeamButton'
import LeaveTeamButton from '@/components/LeaveTeamButton'

const GAME_LABEL: Record<string, string> = {
  valorant: 'VALORANT', lol: 'League of Legends',
}
const GAME_COLOR: Record<string, string> = {
  valorant: '#ff4655', lol: '#c89b3c',
}
const ROLE_LABEL: Record<string, string> = {
  captain: 'CAPTAIN', igl: 'IGL', player: 'PLAYER',
  head_coach: 'HEAD COACH', coach: 'COACH',
}
const ROLE_COLOR: Record<string, string> = {
  captain: '#00D2BE', igl: '#f59e0b', player: '#94a3b8',
  head_coach: '#a78bfa', coach: '#60a5fa',
}

function getFlag(code: string | null | undefined) {
  if (!code) return null
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (!team) notFound()

  const { data: members } = await supabase
    .from('team_members')
    .select('user_id, role, users(riot_gamename, riot_tagline, tier, avatar_url, game_type, val_gamename, val_tier, lol_gamename, lol_tier, country)')
    .eq('team_id', id)

  const isCaptain = team.captain_id === user.id
  const isMember = members?.some((m: any) => m.user_id === user.id)

  const { data: pendingRequest } = await supabase
    .from('team_join_requests')
    .select('id')
    .eq('team_id', id)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single()

  const players = members?.filter((m: any) => ['captain', 'igl', 'player'].includes(m.role)) ?? []
  const staff = members?.filter((m: any) => ['head_coach', 'coach'].includes(m.role)) ?? []

  const gameColor = GAME_COLOR[team.game_type] ?? '#00D2BE'
  const isVal = team.game_type === 'valorant'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-6 py-8">

        {/* 팀 헤더 */}
        <div className="relative bg-[#13131f] border border-white/5 rounded overflow-hidden mb-6">
          <div className="h-20 w-full" style={{ background: `linear-gradient(135deg, ${gameColor}33, transparent)` }} />
          <div className="px-8 pb-7 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-10">
            <div className="w-20 h-20 rounded border-4 border-[#0a0a0a] flex items-center justify-center text-3xl font-black shrink-0"
              style={{ background: `linear-gradient(135deg, ${gameColor}44, ${gameColor}22)`, color: gameColor }}>
              {team.name[0].toUpperCase()}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-white font-black text-3xl">{team.name}</h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded" style={{ color: gameColor, background: gameColor + '22' }}>
                  {GAME_LABEL[team.game_type] ?? team.game_type}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                {team.tier_avg && <span>평균 {team.tier_avg}</span>}
                <span>{members?.length ?? 0}명</span>
              </div>
            </div>
            <div className="flex gap-2 pb-1">
              {!isMember && !isCaptain && (
                <JoinTeamButton teamId={id} hasPendingRequest={!!pendingRequest} />
              )}
              {isMember && !isCaptain && (
                <LeaveTeamButton teamId={id} />
              )}
              {isCaptain && (
                <a href={`/teams/${id}/manage`} className="bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded transition">
                  팀 관리
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 선수 로스터 */}
          <div className="md:col-span-2">

            {/* PLAYERS */}
            <h2 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-3">Players</h2>
            {players.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {players.map((m: any) => (
                  <PlayerCard key={m.user_id} member={m} currentUserId={user.id} isVal={isVal} getFlag={getFlag} />
                ))}
              </div>
            ) : (
              <div className="bg-[#13131f] border border-white/5 rounded p-8 text-center text-slate-600 text-sm mb-6">
                아직 선수가 없어요
              </div>
            )}

            {/* STAFF */}
            {staff.length > 0 && (
              <>
                <h2 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-3">Staff</h2>
                <div className="grid grid-cols-3 gap-3">
                  {staff.map((m: any) => (
                    <PlayerCard key={m.user_id} member={m} currentUserId={user.id} isVal={isVal} getFlag={getFlag} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 팀 정보 사이드 */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#13131f] border border-white/5 rounded p-5">
              <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-4">팀 정보</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">게임</span>
                  <span className="font-bold" style={{ color: gameColor }}>{GAME_LABEL[team.game_type] ?? team.game_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">평균 티어</span>
                  <span className="text-white">{team.tier_avg ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">멤버</span>
                  <span className="text-white">{members?.length ?? 0}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">선수</span>
                  <span className="text-white">{players.length}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">코칭스태프</span>
                  <span className="text-white">{staff.length}명</span>
                </div>
              </div>
            </div>

            <div className="bg-[#13131f] border border-white/5 rounded p-5">
              <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-4">전적</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-black text-white">{team.wins ?? 0}</span>
                <span className="text-slate-500 text-sm mb-1">W</span>
                <span className="text-3xl font-black text-slate-600 ml-1">{team.losses ?? 0}</span>
                <span className="text-slate-600 text-sm mb-1">L</span>
              </div>
              <p className="text-slate-600 text-xs">
                {(team.wins ?? 0) + (team.losses ?? 0) === 0
                  ? '승률 —'
                  : `승률 ${Math.round((team.wins / ((team.wins ?? 0) + (team.losses ?? 0))) * 100)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerCard({ member, currentUserId, isVal, getFlag }: {
  member: any
  currentUserId: string
  isVal: boolean
  getFlag: (code: string | null | undefined) => string | null
}) {
  const u = member.users
  const roleColor = ROLE_COLOR[member.role] ?? '#94a3b8'
  const isMe = member.user_id === currentUserId

  const gameName = isVal
    ? (u?.val_gamename ?? u?.riot_gamename ?? null)
    : (u?.lol_gamename ?? u?.riot_gamename ?? null)
  const tier = isVal
    ? (u?.val_tier ?? u?.tier ?? null)
    : (u?.lol_tier ?? u?.tier ?? null)

  const flag = getFlag(u?.country)

  return (
    <div className={`bg-[#13131f] border rounded overflow-hidden flex flex-col ${isMe ? 'border-[#00D2BE]/40' : 'border-white/5'}`}>
      {/* 아바타 영역 */}
      <div className="relative bg-[#0d0d18]">
        {u?.avatar_url ? (
          <img src={u.avatar_url} alt="" className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-[#1a1a2e] to-[#0d0d18] flex items-center justify-center text-4xl font-black text-white/20">
            {gameName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        {/* 역할 뱃지 - 좌상단 */}
        <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
          style={{ color: roleColor, background: roleColor + '33' }}>
          {ROLE_LABEL[member.role] ?? member.role}
        </span>
        {/* 나 표시 - 우상단 */}
        {isMe && <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#00D2BE] border-2 border-[#0d0d18]" />}
      </div>

      {/* 정보 영역 */}
      <div className="px-3 py-2.5 flex flex-col gap-0.5">
        {/* 국기 + 닉네임 */}
        <div className="flex items-center gap-1.5">
          {flag && <span className="text-sm leading-none">{flag}</span>}
          <p className="text-white font-bold text-xs truncate leading-tight">
            {gameName ?? '알 수 없음'}
          </p>
        </div>
        {/* 티어 */}
        <p className="text-slate-500 text-[10px]">{tier ?? 'Unranked'}</p>
      </div>
    </div>
  )
}
