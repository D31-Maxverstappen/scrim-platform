import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AvatarUpload from '@/components/AvatarUpload'
import ProfileCard from '@/components/ProfileCard'
import TeamRankings from '@/components/TeamRankings'
import ScrimList from '@/components/ScrimList'
import ReceivedApplications from '@/components/ReceivedApplications'

const TIER_COLOR: Record<string, string> = {
  Iron: '#6b7280', Bronze: '#92400e', Silver: '#94a3b8', Gold: '#f59e0b',
  Platinum: '#2dd4bf', Emerald: '#10b981', Diamond: '#60a5fa',
  Master: '#a78bfa', Grandmaster: '#f87171', Challenger: '#fde68a',
  Ascendant: '#34d399', Immortal: '#fb7185', Radiant: '#fef08a', Unranked: '#374151',
}

const GAME_LABEL: Record<string, string> = {
  lol: 'LoL', valorant: 'VALORANT',
}

const GAME_COLOR: Record<string, string> = {
  lol: '#c89b3c', valorant: '#ff4655',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 모든 쿼리 병렬 실행
  const [
    { data: profile },
    { data: teamMember },
    { count: userCount },
    { count: teamCount },
    { data: allTeams },
    { data: scrimCounts },
    { data: recentScrims },
    { data: allApplications },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('team_members').select('role, teams(id, name, game_type, tier_avg)').eq('user_id', user.id).single(),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('id, name, game_type, tier_avg, wins, losses').limit(50),
    supabase.from('scrim_posts').select('team_id'),
    supabase.from('scrim_posts').select('id, game_type, preferred_date, note, status, teams(name, tier_avg)').eq('status', 'open').order('created_at', { ascending: false }).limit(8),
    supabase.from('scrim_applications').select('id, status, match_id, applying_team:teams!applying_team_id(id, name, tier_avg, game_type), scrim_post:scrim_posts!scrim_post_id(id, preferred_date, note, team_id)').order('created_at', { ascending: false }),
  ])


  const team = (Array.isArray(teamMember?.teams) ? teamMember?.teams[0] : teamMember?.teams) as { id: string; name: string; game_type: string; tier_avg: string } | null | undefined

  // 내 팀 최근 매치
  const recentMatches = team ? (await supabase
    .from('matches')
    .select('id, format, status, match_date, team1:teams!team1_id(id, name), team2:teams!team2_id(id, name), winner:teams!winner_id(id, name)')
    .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`)
    .order('created_at', { ascending: false })
    .limit(5)
  ).data ?? [] : []
  const tierColor = TIER_COLOR[profile?.tier ?? ''] ?? '#6b7280'

  const scrimCountMap: Record<string, number> = {}
  scrimCounts?.forEach((s: any) => {
    scrimCountMap[s.team_id] = (scrimCountMap[s.team_id] ?? 0) + 1
  })

  // 내 팀 스크림에 들어온 신청만 필터
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

  return (
    <div className="min-h-screen bg-[#0d0d14]">
      <Navbar />
      <div className="pt-28 max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── 왼쪽 사이드바 ── */}
          <aside className="w-64 shrink-0 flex flex-col gap-3">

            {/* 내 프로필 카드 */}
            <ProfileCard
              userId={user.id}
              avatarUrl={profile?.avatar_url ?? null}
              valGamename={profile?.val_gamename ?? profile?.riot_gamename ?? null}
              valTagline={profile?.val_tagline ?? profile?.riot_tagline ?? null}
              valTier={profile?.val_tier ?? (profile?.game_type === 'valorant' ? profile?.tier : null) ?? null}
              lolGamename={profile?.lol_gamename ?? (profile?.game_type === 'lol' ? profile?.riot_gamename : null) ?? null}
              lolTagline={profile?.lol_tagline ?? (profile?.game_type === 'lol' ? profile?.riot_tagline : null) ?? null}
              lolTier={profile?.lol_tier ?? (profile?.game_type === 'lol' ? profile?.tier : null) ?? null}
              primaryGame={profile?.game_type ?? null}
            />

            {/* 매너 점수 */}
            <div className="bg-[#13131f] border border-white/5 rounded p-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Manner Score</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black text-white">100</span>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">기본</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1 mb-1">
                <div className="h-1 rounded-full bg-gradient-to-r from-[#00D2BE] to-[#00a896]" style={{ width: '50%' }} />
              </div>
              <p className="text-slate-600 text-xs">100 / 200</p>
            </div>

            {/* 내 팀 */}
            <div className="bg-[#13131f] border border-white/5 rounded p-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">My Team</p>
              {team ? (
                <a href={`/teams/${team.id}`} className="flex items-center justify-between gap-2 group hover:bg-white/3 -mx-4 -mb-4 px-4 pb-4 pt-1 transition">
                  <div>
                    <p className="text-white font-bold text-sm">{team.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{GAME_LABEL[team.game_type] ?? team.game_type}</p>
                    {team.tier_avg && <p className="text-xs mt-1" style={{ color: '#c89b3c' }}>{team.tier_avg}</p>}
                    <span className="inline-block mt-2 text-xs bg-[#00D2BE]/20 text-[#00D2BE] px-2 py-0.5">
                      {teamMember?.role === 'captain' ? '캡틴' : '멤버'}
                    </span>
                  </div>
                  <span className="text-slate-600 group-hover:text-[#00D2BE] text-lg transition shrink-0">→</span>
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-slate-600 text-xs">소속 팀 없음</p>
                  <a href="/teams/create" className="text-center bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold py-2  transition">
                    팀 만들기
                  </a>
                </div>
              )}
            </div>

          </aside>

          {/* ── 메인 콘텐츠 ── */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">

            {/* 통계 바 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '가입 유저 수', value: userCount ?? '—' },
                { label: '등록 팀 개수', value: teamCount ?? '—' },
                { label: '평균 매너점수', value: '100' },
              ].map((s) => (
                <div key={s.label} className="bg-[#13131f] border border-white/5 rounded p-4">
                  <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                  <p className="text-white text-xl font-black">{s.value}</p>
                </div>
              ))}
            </div>

            {/* 받은 스크림 신청 */}
            {team && (
              <ReceivedApplications initialApps={receivedApps} />
            )}

            {/* 게임 탭 + 스크림 목록 */}
            <ScrimList scrims={recentScrims ?? []} />

            {/* 하단 그리드 */}
            <div className="grid grid-cols-2 gap-4">

              {/* 최근 매치 */}
              <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white font-bold text-xs uppercase tracking-widest">최근 매치</p>
                </div>
                {recentMatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                    <p className="text-xs">매치 기록이 없어요</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentMatches.map((m: any) => {
                      const t1 = Array.isArray(m.team1) ? m.team1[0] : m.team1
                      const t2 = Array.isArray(m.team2) ? m.team2[0] : m.team2
                      const w = Array.isArray(m.winner) ? m.winner[0] : m.winner
                      const isWin = w?.id === team?.id
                      const isLoss = m.status === 'completed' && w && w.id !== team?.id
                      const statusLabel = m.status === 'completed' ? (isWin ? '승' : '패') : m.status === 'ongoing' ? '진행 중' : '예정'
                      const statusColor = m.status === 'completed' ? (isWin ? 'text-[#00D2BE]' : 'text-red-400') : 'text-slate-500'
                      const date = m.match_date
                        ? new Date(m.match_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                        : '날짜 미정'
                      return (
                        <a key={m.id} href={`/matches/${m.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition group">
                          <span className={`text-xs font-black w-6 text-center ${statusColor}`}>{statusLabel}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">
                              {t1?.name ?? '—'} <span className="text-slate-600">vs</span> {t2?.name ?? '—'}
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

              {/* 팀 랭킹 */}
              <TeamRankings teams={teamsWithActivity} />

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
