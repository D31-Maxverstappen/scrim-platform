import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import JoinTeamButton from '@/components/JoinTeamButton'
import LeaveTeamButton from '@/components/LeaveTeamButton'
import TeamPageTabs from '@/components/TeamPageTabs'
import { FlagImg } from '@/components/CountrySelect'

const GAME_LABEL: Record<string, string> = { valorant: 'VALORANT', lol: 'League of Legends' }
const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }
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

  const { data: team } = await supabase.from('teams').select('*').eq('id', id).single()
  if (!team) notFound()

  const { data: members } = await supabase
    .from('team_members')
    .select('user_id, role, users(riot_gamename, riot_tagline, tier, avatar_url, game_type, val_gamename, val_tier, lol_gamename, lol_tier, country)')
    .eq('team_id', id)

  const isCaptain = team.captain_id === user.id
  const isMember = members?.some((m: any) => m.user_id === user.id)

  const { data: pendingRequest } = await supabase
    .from('team_join_requests').select('id')
    .eq('team_id', id).eq('user_id', user.id).eq('status', 'pending').single()

  const players = members?.filter((m: any) => ['captain', 'igl', 'player'].includes(m.role)) ?? []
  const staff = members?.filter((m: any) => ['head_coach', 'coach'].includes(m.role)) ?? []
  const gameColor = GAME_COLOR[team.game_type] ?? '#00D2BE'
  const isVal = team.game_type === 'valorant'
  const total = (team.wins ?? 0) + (team.losses ?? 0)

  // ── Overview 탭 ──
  const overviewContent = (
    <div className="flex gap-6">
      {/* 왼쪽 */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* CURRENT ROSTER */}
        <div className="bg-[#13131f] border border-white/5">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Current Roster</h3>
          </div>
          <div className="p-4 flex flex-col gap-6">

            {/* PLAYERS */}
            {players.length > 0 ? (
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Players</p>
                <div className="grid grid-cols-5 gap-2">
                  {players.map((m: any) => (
                    <RosterCard key={m.user_id} member={m} currentUserId={user.id} isVal={isVal} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-600 text-sm py-4 text-center">아직 선수가 없어요</p>
            )}

            {/* STAFF */}
            {staff.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Staff</p>
                <div className="grid grid-cols-5 gap-2">
                  {staff.map((m: any) => (
                    <RosterCard key={m.user_id} member={m} currentUserId={user.id} isVal={isVal} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
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
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">팀 통계</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {[
              { label: '총 스크림', value: '—' },
              { label: '승률', value: total > 0 ? `${Math.round((team.wins / total) * 100)}%` : '—' },
              { label: '평균 티어', value: team.tier_avg ?? '—' },
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
      <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-2">
        <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6l3-3 3 3v6M3 21h18" />
        </svg>
        <p className="text-sm">아직 매치 기록이 없어요</p>
        <p className="text-xs text-slate-700">매치 결과 입력 시스템 준비 중</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-6 py-8">

        {/* ── 팀 헤더 (Liquipedia 스타일) ── */}
        <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
          {/* 팀 로고 */}
          <div className="w-28 h-28 shrink-0 border border-white/10 bg-[#13131f] flex items-center justify-center text-5xl font-black rounded"
            style={{ color: gameColor }}>
            {team.name[0].toUpperCase()}
          </div>

          {/* 팀 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-white font-black text-3xl">{team.name}</h1>
              <span className="text-slate-400 font-bold text-lg">{team.name.slice(0, 3).toUpperCase()}</span>
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
          <div className="flex gap-2 shrink-0">
            {!isMember && !isCaptain && (
              <JoinTeamButton teamId={id} hasPendingRequest={!!pendingRequest} />
            )}
            {isMember && !isCaptain && (
              <LeaveTeamButton teamId={id} />
            )}
            {isCaptain && (
              <a href={`/teams/${id}/manage`}
                className="bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-2 rounded transition">
                팀 관리
              </a>
            )}
          </div>
        </div>

        {/* ── 탭 ── */}
        <TeamPageTabs
          overviewContent={overviewContent}
          statsContent={statsContent}
          matchesContent={matchesContent}
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
  const gameName = isVal
    ? (u?.val_gamename ?? u?.riot_gamename ?? null)
    : (u?.lol_gamename ?? u?.riot_gamename ?? null)
  const tier = isVal ? (u?.val_tier ?? u?.tier ?? null) : (u?.lol_tier ?? u?.tier ?? null)
  return (
    <div className={`border overflow-hidden flex flex-col ${isMe ? 'border-[#00D2BE]/40 bg-[#0d1a19]' : 'border-white/5 bg-[#0d0d18]'}`}>
      {/* 아바타 — 세로 직사각형 */}
      <div className="relative" style={{ paddingBottom: '130%' }}>
        {u?.avatar_url ? (
          <img src={u.avatar_url} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <div className="absolute inset-0 bg-[#111120] flex items-center justify-center text-2xl font-black text-white/10">
            {gameName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        {isMe && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00D2BE] border border-[#0d0d18]" />}
      </div>
      {/* 정보 */}
      <div className="px-2 py-2 flex flex-col gap-1 border-t border-white/5">
        <div className="flex items-center gap-1">
          <FlagImg code={u?.country} size={14} />
          <p className="text-white font-bold text-[11px] truncate leading-tight">{gameName ?? '—'}</p>
        </div>
        <span className="text-[9px] font-bold px-1 py-0.5 self-start" style={{ color: roleColor, background: roleColor + '22' }}>
          {ROLE_LABEL[member.role] ?? member.role}
        </span>
        <p className="text-slate-600 text-[9px]">{tier ?? 'Unranked'}</p>
      </div>
    </div>
  )
}
