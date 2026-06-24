import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import JoinTeamButton from '@/components/JoinTeamButton'
import LeaveTeamButton from '@/components/LeaveTeamButton'
import InviteButton from '@/components/InviteButton'
import TeamPageTabs from '@/components/TeamPageTabs'
import { FlagImg } from '@/components/CountrySelect'
import TeamChat from '@/components/TeamChat'
import { GAME_LABEL, GAME_COLOR } from '@/lib/games'

const ROLE_LABEL: Record<string, string> = {
  captain: 'CAPTAIN', igl: 'IGL', player: 'PLAYER',
  head_coach: 'HEAD COACH', coach: 'COACH',
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

  const { data: team } = await supabase.from('teams').select('id, name, abbreviation, game_type, tier_avg, captain_id, wins, losses, is_open, logo_url').eq('id', id).single()
  if (!team) notFound()

  const [{ data: members }, { data: pendingRequest }, { data: matches1 }, { data: matches2 }, { data: anyMembership }] = await Promise.all([
    supabase.from('team_members')
      .select('user_id, role, users(riot_gamename, riot_tagline, tier, avatar_url, game_type, val_gamename, val_tier, country, manner_score)')
      .eq('team_id', id),
    supabase.from('team_join_requests').select('id')
      .eq('team_id', id).eq('user_id', user.id).eq('status', 'pending').single(),
    supabase.from('matches')
      .select('id, status, format, match_date, winner_id, team1_id, team2_id, team2:teams!team2_id(id, name)')
      .eq('team1_id', id).order('match_date', { ascending: false }).limit(20),
    supabase.from('matches')
      .select('id, status, format, match_date, winner_id, team1_id, team2_id, team1:teams!team1_id(id, name)')
      .eq('team2_id', id).order('match_date', { ascending: false }).limit(20),
    supabase.from('team_members').select('id').eq('user_id', user.id).maybeSingle(),
  ])

  const allMatches = [
    ...(matches1 ?? []).map((m: any) => ({ ...m, opponent: Array.isArray(m.team2) ? m.team2[0] : m.team2, isteam1: true })),
    ...(matches2 ?? []).map((m: any) => ({ ...m, opponent: Array.isArray(m.team1) ? m.team1[0] : m.team1, isteam1: false })),
  ].sort((a, b) => new Date(b.match_date ?? 0).getTime() - new Date(a.match_date ?? 0).getTime())

  const isCaptain = team.captain_id === user.id
  const isMember = members?.some((m: any) => m.user_id === user.id)
  const hasAnyTeam = !!anyMembership

  const players = members?.filter((m: any) => ['captain', 'igl', 'player'].includes(m.role)) ?? []
  const staff = members?.filter((m: any) => ['head_coach', 'coach'].includes(m.role)) ?? []
  const gameColor = GAME_COLOR[team.game_type] ?? '#00D2BE'
  const isVal = team.game_type === 'valorant'
  const total = (team.wins ?? 0) + (team.losses ?? 0)
  const teamManner = members && members.length
    ? Math.round(members.reduce((sum: number, m: any) => {
        const u = Array.isArray(m.users) ? m.users[0] : m.users
        return sum + (u?.manner_score ?? 100)
      }, 0) / members.length)
    : 100

  // ── Overview 탭 ──
  const overviewContent = (
    <div className="flex gap-6">
      {/* 왼쪽 */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* CURRENT ROSTER */}
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">Current Roster</h3>
          <div className="border border-white/10 p-4">
            {players.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {players.map((m: any) => (
                  <RosterCard key={m.user_id} member={m} currentUserId={user.id} isVal={isVal} />
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm py-4 text-center">아직 선수가 없어요</p>
            )}
          </div>
        </div>

        {/* COACHING STAFF */}
        {staff.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">Coaching Staff</h3>
            <div className="border border-white/10 p-4">
              <div className="grid grid-cols-3 gap-2">
                {staff.map((m: any) => (
                  <RosterCard key={m.user_id} member={m} currentUserId={user.id} isVal={isVal} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 오른쪽 사이드바 */}
      <aside className="w-56 shrink-0 flex flex-col gap-4">
        <div className="bg-[#13131f] border border-white/5 rounded">
          <div className="px-4 py-2.5 border-b border-white/5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">팀 정보</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2.5 text-xs">
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
            {staff.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">스태프</span>
                <span className="text-white">{staff.length}명</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#13131f] border border-white/5 rounded">
          <div className="px-4 py-2.5 border-b border-white/5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">전적</p>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{team.wins ?? 0}</p>
                <p className="text-[10px] text-slate-500 uppercase">승</p>
              </div>
              <span className="text-slate-700 text-lg">–</span>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-500">{team.losses ?? 0}</p>
                <p className="text-[10px] text-slate-500 uppercase">패</p>
              </div>
            </div>
            {total > 0 && (
              <>
                <div className="w-full bg-white/5 rounded h-1 mb-1.5">
                  <div className="h-1 rounded bg-[#00D2BE]" style={{ width: `${Math.round((team.wins / total) * 100)}%` }} />
                </div>
                <p className="text-xs text-slate-500">승률 {Math.round((team.wins / total) * 100)}%</p>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  )

  // ── Stats 탭 ──
  const statsContent = (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="bg-[#13131f] border border-white/5 rounded">
          <div className="px-4 py-2.5 border-b border-white/5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">통계</p>
          </div>
          <div className="grid grid-cols-4 divide-x divide-white/5">
            {[
              { label: '총 스크림', value: allMatches.length > 0 ? String(allMatches.length) : '—' },
              { label: '승률', value: total > 0 ? `${Math.round((team.wins / total) * 100)}%` : '—' },
              { label: '평균 티어', value: team.tier_avg ?? '—' },
              { label: '매너 점수', value: `${teamManner}` },
            ].map((s) => (
              <div key={s.label} className="px-6 py-5 text-center">
                <p className="text-2xl font-black text-white mb-1">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── Matches 탭 ──
  const matchesContent = (
    <div className="bg-[#13131f] border border-white/5 rounded">
      <div className="px-4 py-2.5 border-b border-white/5">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">최근 매치</p>
      </div>
      {allMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-2">
          <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6l3-3 3 3v6M3 21h18" />
          </svg>
          <p className="text-sm">아직 매치 기록이 없어요</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {allMatches.map((m: any) => {
            const isWin = m.winner_id === id
            const isDraw = m.status === 'completed' && !m.winner_id
            const isLoss = m.status === 'completed' && m.winner_id && m.winner_id !== id
            const isOngoing = m.status === 'ongoing'
            const isScheduled = m.status === 'scheduled'
            const date = m.match_date
              ? new Date(m.match_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              : '미정'
            return (
              <a key={m.id} href={`/matches/${m.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition group">
                {/* 결과 배지 */}
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-xs font-black rounded
                  ${isWin ? 'bg-[#00D2BE]/20 text-[#00D2BE]' :
                    isLoss ? 'bg-red-500/20 text-red-400' :
                    isDraw ? 'bg-slate-500/20 text-slate-400' :
                    isOngoing ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-white/5 text-slate-600'}`}>
                  {isWin ? 'W' : isLoss ? 'L' : isDraw ? 'D' : isOngoing ? '●' : '—'}
                </div>
                {/* 상대 팀 */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate group-hover:text-[#00D2BE] transition">
                    vs {m.opponent?.name ?? '?'}
                  </p>
                  <p className="text-slate-600 text-xs">{date} · {m.format ?? 'BO3'}</p>
                </div>
                {/* 상태 */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
                  ${isWin ? 'bg-[#00D2BE]/10 text-[#00D2BE]' :
                    isLoss ? 'bg-red-500/10 text-red-400' :
                    isDraw ? 'bg-slate-500/10 text-slate-400' :
                    isOngoing ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-white/5 text-slate-500'}`}>
                  {isWin ? '승' : isLoss ? '패' : isDraw ? '무' : isOngoing ? '진행 중' : '예정'}
                </span>
                <span className="text-slate-700 text-xs group-hover:text-slate-500 transition">→</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["teams", "team_members", "team_join_requests", "matches"]} />
      <Sidebar />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">

        {/* ── 팀 헤더 (Liquipedia 스타일) ── */}
        <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
          {/* 팀 로고 */}
          <div className="w-36 h-36 shrink-0 border border-white/10 bg-[#13131f] flex items-center justify-center text-7xl font-black rounded-xl overflow-hidden"
            style={{ color: gameColor }}>
            {team.logo_url
              ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
              : (team.abbreviation || team.name)[0].toUpperCase()
            }
          </div>

          {/* 팀 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-white font-black text-3xl">{team.name}</h1>
              {team.abbreviation && (
                <span className="text-slate-400 font-bold text-lg">{team.abbreviation}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold" style={{ color: gameColor }}>{GAME_LABEL[team.game_type] ?? team.game_type}</span>
              {team.tier_avg && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-slate-400 text-sm">{team.tier_avg}</span>
                </>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 shrink-0 items-center">
            {!isMember && !isCaptain && !hasAnyTeam && team.is_open !== false && (
              <JoinTeamButton teamId={id} hasPendingRequest={!!pendingRequest} />
            )}
            {!isMember && !isCaptain && !hasAnyTeam && team.is_open === false && (
              <span className="text-slate-400 text-xs font-semibold px-4 py-2 border border-white/10 rounded bg-white/3">
                🔒 초대 전용 팀
              </span>
            )}
            {isMember && !isCaptain && (
              <LeaveTeamButton teamId={id} />
            )}
            {isCaptain && (
              <>
                <InviteButton type="team" targetId={id} userId={user.id} />
                <a href={`/teams/${id}/manage`}
                  className="bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-2 rounded transition">
                  팀 관리
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── 탭 ── */}
        <TeamPageTabs
          overviewContent={overviewContent}
          statsContent={statsContent}
          matchesContent={matchesContent}
          chatContent={
            <TeamChat
              teamId={id}
              currentUserId={user.id}
              isMember={isMember || isCaptain}
            />
          }
        />
      </div>
    </div>
  )
}

function RosterCard({ member, currentUserId, isVal }: {
  member: any
  currentUserId: string
  isVal: boolean
}) {
  const u = member.users
  const roleColor = ROLE_COLOR[member.role] ?? '#94a3b8'
  const isMe = member.user_id === currentUserId
  const gameName = u?.val_gamename ?? u?.riot_gamename ?? null
  const tier = u?.val_tier ?? u?.tier ?? null
  return (
    <div className={`border flex items-center gap-3 px-3 py-2.5 ${isMe ? 'border-[#00D2BE]/40 bg-[#0d1a19]' : 'border-white/10 bg-[#13131f]'}`}>
      {/* 아바타 — 작은 정사각형 */}
      <div className="w-10 h-10 shrink-0 overflow-hidden bg-[#0d0d18]">
        {u?.avatar_url ? (
          <img src={u.avatar_url} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base font-black text-white/20">
            {gameName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>
      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <FlagImg code={u?.country} size={14} />
          <p className="text-white font-bold text-xs truncate">{gameName ?? '—'}</p>
          {isMe && <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] shrink-0" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold" style={{ color: roleColor }}>{ROLE_LABEL[member.role] ?? member.role}</span>
          {tier && <span className="text-[10px] text-slate-600">{tier}</span>}
        </div>
      </div>
    </div>
  )
}
