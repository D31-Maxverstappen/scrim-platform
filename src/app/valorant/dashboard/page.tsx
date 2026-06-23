export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ProfileCard from '@/components/ProfileCard'
import TeamRankings from '@/components/TeamRankings'
import ScrimList from '@/components/ScrimList'
import ReceivedApplications from '@/components/ReceivedApplications'
import DiscordBanner from '@/components/DiscordBanner'
import OnboardingBar from '@/components/OnboardingBar'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import AutoMatchButton from '@/components/AutoMatchButton'
import StatCounter from '@/components/StatCounter'
import Link from 'next/link'

const GAME = 'valorant'

export default async function ValorantDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: teamMember },
    { count: userCount },
    { count: teamCount },
    { data: allTeams },
    { data: scrimCounts },
    { data: recentScrims },
    { data: allApplications },
    { data: rawInhouseRooms },
  ] = await Promise.all([
    supabase.from('users').select('id, avatar_url, val_gamename, val_tagline, val_tier, riot_gamename, riot_tagline, tier, game_type, country').eq('id', user.id).single(),
    supabase.from('team_members').select('role, teams(id, name, abbreviation, game_type, tier_avg, captain_id)').eq('user_id', user.id),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('teams').select('id', { count: 'exact', head: true }).eq('game_type', GAME),
    supabase.from('teams').select('id, name, game_type, tier_avg, wins, losses').eq('game_type', GAME).limit(50),
    supabase.from('scrim_posts').select('team_id').eq('game_type', GAME),
    supabase.from('scrim_posts').select('id, game_type, preferred_date, note, server, format, status, teams(name, tier_avg)').eq('status', 'open').eq('game_type', GAME).order('created_at', { ascending: false }).limit(8),
    supabase.from('scrim_applications').select('id, status, match_id, applying_team:teams!applying_team_id(id, name, tier_avg, game_type), scrim_post:scrim_posts!scrim_post_id(id, preferred_date, note, team_id)').order('created_at', { ascending: false }).limit(30),
    supabase.from('inhouse_rooms').select('id, title, team_mode, status, tier_min, tier_max, max_players, scheduled_at, host:users!host_id(val_gamename, riot_gamename)').in('status', ['recruiting', 'full', 'ongoing']).order('created_at', { ascending: false }).limit(5),
  ])

  const myValTeam = (teamMember ?? []).map((m: any) => ({
    ...m,
    teams: Array.isArray(m.teams) ? m.teams[0] : m.teams,
  })).find((m: any) => m.teams?.game_type === GAME)
  const team = myValTeam?.teams ?? null

  const recentMatches = team ? (await supabase
    .from('matches')
    .select('id, format, status, match_date, team1:teams!team1_id(id, name), team2:teams!team2_id(id, name), winner:teams!winner_id(id, name)')
    .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`)
    .order('created_at', { ascending: false })
    .limit(5)
  ).data ?? [] : []

  const scrimCountMap: Record<string, number> = {}
  scrimCounts?.forEach((s: any) => { scrimCountMap[s.team_id] = (scrimCountMap[s.team_id] ?? 0) + 1 })

  const receivedApps = (allApplications ?? []).filter((a: any) => {
    const post = Array.isArray(a.scrim_post) ? a.scrim_post[0] : a.scrim_post
    return post?.team_id === team?.id
  }).map((a: any) => ({
    ...a,
    applying_team: Array.isArray(a.applying_team) ? a.applying_team[0] : a.applying_team,
    scrim_post: Array.isArray(a.scrim_post) ? a.scrim_post[0] : a.scrim_post,
  }))

  const teamsWithActivity = (allTeams ?? []).map((t: any) => ({
    ...t,
    scrim_count: scrimCountMap[t.id] ?? 0,
  }))

  const inhouseRoomIds = (rawInhouseRooms ?? []).map((r: any) => r.id)
  const { data: inhouseCounts } = inhouseRoomIds.length
    ? await supabase.from('inhouse_participants').select('room_id').in('room_id', inhouseRoomIds)
    : { data: [] }
  const inhouseCountMap: Record<string, number> = {}
  ;(inhouseCounts ?? []).forEach((p: any) => { inhouseCountMap[p.room_id] = (inhouseCountMap[p.room_id] ?? 0) + 1 })
  const inhouseRooms = (rawInhouseRooms ?? []).map((r: any) => ({
    ...r,
    host: Array.isArray(r.host) ? r.host[0] : r.host,
    participant_count: inhouseCountMap[r.id] ?? 0,
  }))

  const displayName = profile?.val_gamename ?? profile?.riot_gamename ?? '유저'

  const STATS = [
    { label: '가입 유저', value: userCount?.toLocaleString() ?? '—', sub: '명' },
    { label: '활동 팀', value: teamCount?.toLocaleString() ?? '—', sub: '팀' },
    { label: '매너 점수', value: '100', sub: '/ 200' },
  ]

  const onboardingSteps = [
    {
      id: 'riot',
      label: 'Riot 계정 연동',
      done: !!(profile?.val_gamename || profile?.riot_gamename),
      href: '/onboarding',
      cta: '연동하기',
    },
    {
      id: 'team',
      label: '팀 가입 / 생성',
      done: !!team,
      href: team ? `/teams/${team.id}` : '/teams/create',
      cta: team ? '내 팀 보기' : '팀 만들기',
    },
    {
      id: 'scrim',
      label: '첫 스크림 신청',
      done: (allApplications ?? []).length > 0,
      href: '/valorant/scrims',
      cta: '스크림 찾기',
    },
  ]

  return (
    <div className="min-h-screen ml-56 bg-[#070711]">
      <RealtimeRefresher tables={["scrim_applications", "scrim_posts", "teams", "team_members", "matches"]} />
      <Sidebar />

      {/* 온보딩 체크포인트 바 */}
      <div className="pt-16">
        <OnboardingBar steps={onboardingSteps} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 pt-8">

        {/* ── 인사 헤더 ── */}
        <div className="mb-10 flex items-end justify-between animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">VALORANT DASHBOARD</p>
            <h1 className="text-white font-black text-3xl tracking-tight">
              안녕하세요, <span className="text-[#ff4655]" style={{ textShadow: '0 0 24px rgba(255,70,85,0.4)' }}>{displayName}</span>님
            </h1>
          </div>
          <span className="text-xs text-slate-600 hidden sm:block">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* ── 상단 통계 ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '가입 유저', value: userCount ?? 0, sub: '명', delay: 80 },
            { label: '활동 팀',   value: teamCount ?? 0, sub: '팀', delay: 160 },
            { label: '매너 점수', value: 100,            sub: '/ 200', delay: 240 },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#0d0d1a] border border-white/[0.08] rounded px-6 py-5 stat-card-glow animate-fade-in-up cursor-default"
              style={{ animationDelay: `${s.delay}ms` }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-3">{s.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-white leading-none">
                  <StatCounter value={s.value} />
                </span>
                <span className="text-sm text-slate-500">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 메인 레이아웃 ── */}
        <div className="flex gap-6 items-start">

          {/* 사이드바 */}
          <aside className="w-68 shrink-0 flex flex-col gap-3 animate-fade-in-up" style={{ width: '272px', animationDelay: '300ms' }}>

            <div className="card-glow rounded transition-all duration-300"><ProfileCard
              userId={user.id}
              avatarUrl={profile?.avatar_url ?? null}
              valGamename={profile?.val_gamename ?? profile?.riot_gamename ?? null}
              valTagline={profile?.val_tagline ?? profile?.riot_tagline ?? null}
              valTier={profile?.val_tier ?? (profile?.game_type === 'valorant' ? profile?.tier : null) ?? null}
            /></div>

            {/* 매너 점수 */}
            <div className="bg-[#0d0d1a] border border-white/[0.10] rounded p-5 card-glow transition-all duration-300">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-4">Manner Score</p>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-black text-white">100</span>
                <span className="text-xs text-slate-500">/ 200</span>
              </div>
              <div className="w-full bg-white/[0.05] rounded-full h-1">
                <div className="h-1 rounded-full bg-gradient-to-r from-[#00D2BE] to-[#00edd6]" style={{ width: '50%' }} />
              </div>
              <p className="text-[10px] text-slate-700 mt-2">기본 점수</p>
            </div>

            {/* 내 팀 */}
            <div className="bg-[#0d0d1a] border border-white/[0.10] rounded p-5 card-glow transition-all duration-300">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-4">My Team</p>
              {team ? (
                <div className="flex items-center gap-3">
                  {/* 로고: 캡틴→관리페이지, 멤버→팀페이지 */}
                  <a href={myValTeam?.role === 'captain' ? `/teams/${team.id}/manage` : `/teams/${team.id}`}
                    className="group/logo relative w-12 h-12 shrink-0 rounded overflow-hidden border border-dashed border-white/20 bg-white/[0.06] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {myValTeam?.role === 'captain' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                  </a>
                  {/* 팀 이름 → 팀 페이지 */}
                  <a href={`/teams/${team.id}`} className="flex-1 min-w-0 group/name">
                    <p className="text-white font-black text-base truncate group-hover/name:text-[#ff4655] transition leading-tight">
                      {team.abbreviation || team.name}
                    </p>
                    {team.tier_avg && (
                      <p className="text-xs text-slate-500 mt-0.5">{team.tier_avg}</p>
                    )}
                    <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#ff465520', color: '#ff4655' }}>
                      {myValTeam?.role === 'captain' ? '캡틴' : '멤버'}
                    </span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-slate-600 text-xs">소속 팀 없음</p>
                  <a href="/teams/create"
                    className="text-center text-white text-xs font-bold py-2 rounded transition"
                    style={{ background: '#ff4655' }}>
                    팀 만들기
                  </a>
                </div>
              )}
            </div>

            {/* 빠른 링크 */}
            <div className="bg-[#0d0d1a] border border-white/[0.10] rounded overflow-hidden">
              {[
                { href: '/scrims/applied', label: '내 스크림', sub: '받은 · 신청한 스크림' },
                { href: '/recruit', label: '팀 · 선수 찾기', sub: '모집 게시판' },
              ].map((item, i) => (
                <a key={item.href} href={item.href}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition group ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                  <div>
                    <p className="text-white text-xs font-bold group-hover:text-[#00D2BE] transition">{item.label}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5">{item.sub}</p>
                  </div>
                  <span className="text-slate-700 group-hover:text-[#00D2BE] transition text-sm">→</span>
                </a>
              ))}
            </div>

            <DiscordBanner compact />
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 flex flex-col gap-5 min-w-0 animate-fade-in-up" style={{ animationDelay: '380ms' }}>

            {team && myValTeam?.role === 'captain' && (
              <AutoMatchButton teamId={team.id} gameType={GAME} tierAvg={team.tier_avg ?? undefined} />
            )}

            {/* 스크림 리스트 */}
            <div className="rounded overflow-hidden border border-white/[0.08]">
              <ScrimList scrims={recentScrims ?? []} game={GAME} />
            </div>

            {/* 내전 섹션 */}
            <div className="bg-[#0d0d1a] border border-white/[0.10] rounded overflow-hidden card-glow transition-all duration-300">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">내전</p>
                <Link href="/inhouse" className="text-[10px] font-bold text-slate-400 hover:text-white transition">
                  전체 보기 →
                </Link>
              </div>
              {inhouseRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-700">
                  <p className="text-xs font-semibold mb-1">모집 중인 내전이 없어요</p>
                  <Link href="/inhouse/create" className="mt-2 text-slate-400 hover:text-white text-xs font-bold transition">
                    + 방 만들기
                  </Link>
                </div>
              ) : (
                <div>
                  {inhouseRooms.map((room: any, i: number) => {
                    const STATUS_COLOR: Record<string, string> = {
                      recruiting: 'bg-green-500/10 text-green-400',
                      full: 'bg-yellow-500/10 text-yellow-400',
                      ongoing: 'bg-[#00D2BE]/10 text-[#00D2BE]',
                    }
                    const STATUS_LABEL: Record<string, string> = {
                      recruiting: '모집중', full: '인원마감', ongoing: '진행중',
                    }
                    const MODE_LABEL: Record<string, string> = {
                      random: '랜덤', balanced: '밸런스', captain: '캡틴픽',
                    }
                    const scheduledStr = room.scheduled_at
                      ? new Date(room.scheduled_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : null
                    return (
                      <Link key={room.id} href={`/inhouse/${room.id}`}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition group border-l-2 border-transparent hover:border-[#00D2BE]/60 ${i !== 0 ? 'border-t border-t-white/[0.04]' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-white text-xs font-semibold truncate group-hover:text-[#00D2BE] transition">{room.title}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLOR[room.status]}`}>
                              {STATUS_LABEL[room.status]}
                            </span>
                            <span className="text-[10px] font-bold bg-white/5 text-slate-500 px-1.5 py-0.5 rounded">
                              {MODE_LABEL[room.team_mode]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-600">
                            <span>방장: {room.host?.val_gamename ?? room.host?.riot_gamename ?? '—'}</span>
                            {scheduledStr && <span>📅 {scheduledStr}</span>}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-white font-bold text-xs">
                            {room.participant_count}<span className="text-slate-600 font-normal"> / {room.max_players}</span>
                          </p>
                          <p className="text-slate-700 text-[10px]">명</p>
                        </div>
                        <span className="text-slate-700 group-hover:text-[#00D2BE] text-xs transition shrink-0">→</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <ReceivedApplications initialApps={receivedApps} />

            {/* 하단 2열 */}
            <div className="grid grid-cols-2 gap-5">

              {/* 최근 매치 */}
              <div className="bg-[#0d0d1a] border border-white/[0.10] rounded overflow-hidden card-glow transition-all duration-300">
                <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">최근 매치</p>
                </div>
                {recentMatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-700">
                    <p className="text-xs">매치 기록이 없어요</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {recentMatches.map((m: any) => {
                      const t1 = Array.isArray(m.team1) ? m.team1[0] : m.team1
                      const t2 = Array.isArray(m.team2) ? m.team2[0] : m.team2
                      const w = Array.isArray(m.winner) ? m.winner[0] : m.winner
                      const isWin = w?.id === team?.id
                      const statusLabel = m.status === 'completed' ? (isWin ? '승' : '패') : m.status === 'ongoing' ? 'LIVE' : '예정'
                      const statusColor = m.status === 'completed'
                        ? (isWin ? '#00D2BE' : '#64748b')
                        : m.status === 'ongoing' ? '#ff4655' : '#64748b'
                      const date = m.match_date
                        ? new Date(m.match_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                        : '미정'
                      return (
                        <a key={m.id} href={`/matches/${m.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition group">
                          <span className="text-xs font-black w-6 shrink-0 text-center" style={{ color: statusColor }}>
                            {statusLabel}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">
                              {t1?.name ?? '—'} <span className="text-slate-700">vs</span> {t2?.name ?? '—'}
                            </p>
                            <p className="text-slate-600 text-[10px]">{m.format} · {date}</p>
                          </div>
                          <span className="text-slate-700 group-hover:text-[#00D2BE] text-xs transition">→</span>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>

              <TeamRankings teams={teamsWithActivity} game={GAME} />
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
