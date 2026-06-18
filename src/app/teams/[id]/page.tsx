import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import JoinTeamButton from '@/components/JoinTeamButton'

const GAME_LABEL: Record<string, string> = {
  valorant: 'VALORANT', lol: 'League of Legends',
}
const GAME_COLOR: Record<string, string> = {
  valorant: '#ff4655', lol: '#c89b3c',
}
const ROLE_LABEL: Record<string, string> = {
  captain: 'Captain', igl: 'IGL', player: 'Player',
  head_coach: 'Head Coach', coach: 'Coach',
}
const ROLE_COLOR: Record<string, string> = {
  captain: '#00D2BE', igl: '#f59e0b', player: '#94a3b8',
  head_coach: '#a78bfa', coach: '#60a5fa',
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
    .select('user_id, role, users(riot_gamename, riot_tagline, tier, avatar_url, game_type)')
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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-16 max-w-5xl mx-auto px-6 py-8">

        {/* 팀 헤더 */}
        <div className="relative bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden mb-6">
          <div className="h-24 w-full" style={{ background: `linear-gradient(135deg, ${gameColor}22, transparent)` }} />
          <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-10">
            {/* 팀 로고 */}
            <div className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0a] flex items-center justify-center text-4xl font-black shrink-0"
              style={{ background: `linear-gradient(135deg, ${gameColor}44, ${gameColor}22)`, color: gameColor }}>
              {team.name[0].toUpperCase()}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-white font-black text-3xl">{team.name}</h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: gameColor, background: gameColor + '22' }}>
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
              {isCaptain && (
                <a href={`/teams/${id}/manage`} className="bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                  팀 관리
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 선수 로스터 */}
          <div className="md:col-span-2">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">선수</h2>

            {/* 3-2 포메이션 */}
            {players.length > 0 ? (
              <div className="flex flex-col gap-3 mb-6">
                {/* 첫 줄 최대 3명 */}
                <div className="grid grid-cols-3 gap-3">
                  {players.slice(0, 3).map((m: any) => (
                    <PlayerCard key={m.user_id} member={m} isCaptain={isCaptain} teamId={id} currentUserId={user.id} />
                  ))}
                </div>
                {/* 둘째 줄 나머지 */}
                {players.length > 3 && (
                  <div className={`grid gap-3 ${players.slice(3).length === 1 ? 'grid-cols-1 max-w-[33%] mx-auto w-full' : players.slice(3).length === 2 ? 'grid-cols-2 max-w-[66%] mx-auto w-full' : 'grid-cols-3'}`}>
                    {players.slice(3, 6).map((m: any) => (
                      <PlayerCard key={m.user_id} member={m} isCaptain={isCaptain} teamId={id} currentUserId={user.id} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#13131f] border border-white/5 rounded-xl p-8 text-center text-slate-600 text-sm mb-6">
                아직 선수가 없어요
              </div>
            )}

            {/* 코칭스태프 */}
            {staff.length > 0 && (
              <>
                <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">코칭 스태프</h2>
                <div className="grid grid-cols-2 gap-3">
                  {staff.map((m: any) => (
                    <PlayerCard key={m.user_id} member={m} isCaptain={isCaptain} teamId={id} currentUserId={user.id} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 팀 정보 사이드 */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#13131f] border border-white/5 rounded-xl p-5">
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

            <div className="bg-[#13131f] border border-white/5 rounded-xl p-5">
              <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-4">전적</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-black text-white">0</span>
                <span className="text-slate-500 text-sm mb-1">W</span>
                <span className="text-3xl font-black text-slate-600 ml-1">0</span>
                <span className="text-slate-600 text-sm mb-1">L</span>
              </div>
              <p className="text-slate-600 text-xs">승률 —</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerCard({ member, isCaptain, teamId, currentUserId }: {
  member: any, isCaptain: boolean, teamId: string, currentUserId: string
}) {
  const u = member.users
  const roleColor = ROLE_COLOR[member.role] ?? '#94a3b8'
  const isMe = member.user_id === currentUserId

  return (
    <div className={`bg-[#13131f] border rounded-xl p-4 flex flex-col items-center gap-2 text-center ${isMe ? 'border-[#00D2BE]/30' : 'border-white/5'}`}>
      {/* 아바타 */}
      <div className="relative">
        {u?.avatar_url ? (
          <img src={u.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00D2BE] to-[#00a896] flex items-center justify-center text-white text-xl font-black">
            {u?.riot_gamename?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        {isMe && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00D2BE] border-2 border-[#0a0a0a]" />}
      </div>

      {/* 이름 */}
      <div>
        <p className="text-white font-bold text-xs leading-tight">
          {u?.riot_gamename ?? '알 수 없음'}
        </p>
        {u?.riot_tagline && <p className="text-slate-600 text-xs">#{u.riot_tagline}</p>}
      </div>

      {/* 티어 */}
      {u?.tier && <p className="text-slate-400 text-xs">{u.tier}</p>}

      {/* 역할 뱃지 */}
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: roleColor, background: roleColor + '22' }}>
        {ROLE_LABEL[member.role] ?? member.role}
      </span>
    </div>
  )
}
