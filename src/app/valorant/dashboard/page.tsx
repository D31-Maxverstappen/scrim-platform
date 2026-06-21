export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProfileCard from '@/components/ProfileCard'
import TeamRankings from '@/components/TeamRankings'
import ScrimList from '@/components/ScrimList'
import ReceivedApplications from '@/components/ReceivedApplications'
import DiscordBanner from '@/components/DiscordBanner'
import OnboardingChecklist from '@/components/OnboardingChecklist'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import AutoMatchButton from '@/components/AutoMatchButton'
import { getLang } from '@/lib/lang'
import { t } from '@/lib/i18n'

const GAME = 'valorant'
const GAME_COLOR = '#ff4655'

export default async function ValorantDashboardPage() {
  const lang = await getLang()
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
  ] = await Promise.all([
    supabase.from('users').select('id, avatar_url, val_gamename, val_tagline, val_tier, lol_gamename, lol_tagline, lol_tier, riot_gamename, riot_tagline, tier, game_type, country').eq('id', user.id).single(),
    supabase.from('team_members').select('role, teams(id, name, abbreviation, game_type, tier_avg, captain_id)').eq('user_id', user.id),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('teams').select('id', { count: 'exact', head: true }).eq('game_type', GAME),
    supabase.from('teams').select('id, name, game_type, tier_avg, wins, losses').eq('game_type', GAME).limit(50),
    supabase.from('scrim_posts').select('team_id').eq('game_type', GAME),
    supabase.from('scrim_posts').select('id, game_type, preferred_date, note, server, format, status, teams(name, tier_avg)').eq('status', 'open').eq('game_type', GAME).order('created_at', { ascending: false }).limit(8),
    supabase.from('scrim_applications').select('id, status, match_id, applying_team:teams!applying_team_id(id, name, tier_avg, game_type), scrim_post:scrim_posts!scrim_post_id(id, preferred_date, note, team_id)').order('created_at', { ascending: false }).limit(30),
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

  return (
    <div className="min-h-screen bg-[#0d0d14]">
      <RealtimeRefresher tables={["scrim_applications", "scrim_posts", "teams", "team_members", "matches"]} />
      <Navbar />
      <div className="pt-28 max-w-7xl mx-auto px-6 py-8">

        {/* 게임 타이틀 바 */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: GAME_COLOR }}>VALORANT</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500 text-xs">발로란트 대시보드</span>
        </div>

        <div className="flex gap-6">
          {/* 왼쪽 사이드바 */}
          <aside className="w-64 shrink-0 flex flex-col gap-3">
            <ProfileCard
              userId={user.id}
              avatarUrl={profile?.avatar_url ?? null}
              valGamename={profile?.val_gamename ?? profile?.riot_gamename ?? null}
              valTagline={profile?.val_tagline ?? profile?.riot_tagline ?? null}
              valTier={profile?.val_tier ?? (profile?.game_type === 'valorant' ? profile?.tier : null) ?? null}
              lolGamename={profile?.lol_gamename ?? null}
              lolTagline={profile?.lol_tagline ?? null}
              lolTier={profile?.lol_tier ?? null}
              primaryGame={GAME}
            />

            <div className="bg-[#13131f] border border-white/5 rounded p-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Manner Score</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black text-white">100</span>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">{t('manner_default', lang)}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1 mb-1">
                <div className="h-1 rounded-full" style={{ width: '50%', background: GAME_COLOR }} />
              </div>
              <p className="text-slate-600 text-xs">100 / 200</p>
            </div>

            <div className="bg-[#13131f] border border-white/5 rounded p-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">My Team</p>
              {team ? (
                <a href={`/teams/${team.id}`} className="flex items-center gap-3 group hover:bg-white/3 -mx-4 -mb-4 px-4 pb-4 pt-1 transition">
                  <div className="w-14 h-14 shrink-0 rounded-lg flex items-center justify-center font-black text-2xl border border-white/10"
                    style={{ background: GAME_COLOR + '18', color: GAME_COLOR }}>
                    {(team.abbreviation || team.name)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-xl truncate">{team.abbreviation || team.name}</p>
                    {team.tier_avg && <p className="text-xs mt-0.5" style={{ color: GAME_COLOR }}>{team.tier_avg}</p>}
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded" style={{ background: GAME_COLOR + '33', color: GAME_COLOR }}>
                      {myValTeam?.role === 'captain' ? t('my_team_captain', lang) : t('my_team_member', lang)}
                    </span>
                  </div>
                  <span className="text-slate-600 group-hover:text-[#ff4655] text-lg transition shrink-0">→</span>
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-slate-600 text-xs">{t('my_team_no_team', lang)}</p>
                  <a href="/teams/create" className="text-center text-white text-xs font-bold py-2 transition rounded" style={{ background: GAME_COLOR }}>
                    {t('my_team_create', lang)}
                  </a>
                </div>
              )}
            </div>

            <a href="/scrims/applied"
              className="bg-[#13131f] border border-white/5 rounded px-4 py-3 flex items-center justify-between hover:border-white/10 transition group">
              <div>
                <p className="text-white text-xs font-bold">{t('dash_applied_scrims', lang)}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{t('dash_check_status', lang)}</p>
              </div>
              <span className="text-slate-600 group-hover:text-[#00D2BE] transition text-sm">→</span>
            </a>

            <DiscordBanner compact />
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden flex divide-x divide-white/5">
              {[
                { label: t('dash_users', lang), value: userCount ?? '—' },
                { label: t('dash_teams', lang), value: teamCount ?? '—' },
                { label: t('dash_avg_manner', lang), value: '100' },
              ].map((s) => (
                <div key={s.label} className="flex-1 p-4">
                  <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                  <p className="text-white text-xl font-black">{s.value}</p>
                </div>
              ))}
            </div>

            {team && myValTeam?.role === 'captain' && <AutoMatchButton teamId={team.id} gameType={GAME} />}

            <OnboardingChecklist steps={[
              {
                id: 'riot',
                label: t('onboard_step_riot_label', lang),
                desc: t('onboard_step_riot_desc_val', lang),
                done: !!(profile?.val_gamename || profile?.riot_gamename),
                href: '/onboarding',
                cta: t('onboard_step_riot_cta', lang),
              },
              {
                id: 'team',
                label: t('onboard_step_team_label', lang),
                desc: t('onboard_step_team_desc', lang),
                done: !!team,
                href: team ? `/teams/${team.id}` : '/teams/create',
                cta: team ? t('onboard_step_team_view', lang) : t('my_team_create', lang),
              },
              {
                id: 'scrim',
                label: t('onboard_step_scrim_label', lang),
                desc: t('onboard_step_scrim_desc', lang),
                done: (allApplications ?? []).length > 0,
                href: '/valorant/scrims',
                cta: t('onboard_step_scrim_cta', lang),
              },
            ]} />
            <ScrimList scrims={recentScrims ?? []} game={GAME} />

            <ReceivedApplications initialApps={receivedApps} />

            <div className="grid grid-cols-2 gap-4">
              {/* 최근 매치 */}
              <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white font-bold text-xs uppercase tracking-widest">{t('dash_recent_matches', lang)}</p>
                </div>
                {recentMatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                    <p className="text-xs">{t('dash_no_matches', lang)}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentMatches.map((m: any) => {
                      const t1 = Array.isArray(m.team1) ? m.team1[0] : m.team1
                      const t2 = Array.isArray(m.team2) ? m.team2[0] : m.team2
                      const w = Array.isArray(m.winner) ? m.winner[0] : m.winner
                      const isWin = w?.id === team?.id
                      const statusLabel = m.status === 'completed' ? (isWin ? t('win', lang) : t('loss', lang)) : m.status === 'ongoing' ? t('match_ongoing', lang) : t('match_scheduled', lang)
                      const statusColor = m.status === 'completed' ? (isWin ? 'text-[#ff4655]' : 'text-slate-500') : 'text-slate-500'
                      const date = m.match_date ? new Date(m.match_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : t('tbd', lang)
                      return (
                        <a key={m.id} href={`/matches/${m.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition group">
                          <span className={`text-xs font-black w-6 text-center ${statusColor}`}>{statusLabel}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{t1?.name ?? '—'} <span className="text-slate-600">vs</span> {t2?.name ?? '—'}</p>
                            <p className="text-slate-600 text-[10px]">{m.format} · {date}</p>
                          </div>
                          <span className="text-slate-700 group-hover:text-[#ff4655] text-xs transition">→</span>
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
