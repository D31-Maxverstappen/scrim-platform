import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MatchTabs from '@/components/MatchTabs'
import RosterComparison from '@/components/RosterComparison'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!team1_id(id, name, game_type, tier_avg),
      team2:teams!team2_id(id, name, game_type, tier_avg),
      winner:teams!winner_id(id, name)
    `)
    .eq('id', id)
    .single()

  if (!match) notFound()

  const [{ data: maps }, { data: stats }, { data: team1Members }, { data: team2Members }] = await Promise.all([
    supabase.from('match_maps').select('id, match_id, map_number, map_name, team1_score, team2_score, round_results').eq('match_id', id).order('map_number'),
    supabase.from('match_player_stats')
      .select('*, users(riot_gamename, val_gamename, lol_gamename, avatar_url, country)')
      .eq('match_id', id),
    supabase.from('team_members')
      .select('user_id, role, is_igl, users(val_gamename, lol_gamename, riot_gamename, val_tier, lol_tier, tier, country, avatar_url)')
      .eq('team_id', match.team1_id)
      .neq('role', 'coach'),
    supabase.from('team_members')
      .select('user_id, role, is_igl, users(val_gamename, lol_gamename, riot_gamename, val_tier, lol_tier, tier, country, avatar_url)')
      .eq('team_id', match.team2_id)
      .neq('role', 'coach'),
  ])

  const team1 = Array.isArray(match.team1) ? match.team1[0] : match.team1
  const team2 = Array.isArray(match.team2) ? match.team2[0] : match.team2
  const winner = Array.isArray(match.winner) ? match.winner[0] : match.winner

  const team1Score = (maps ?? []).filter((m: any) => m.team1_score > m.team2_score).length
  const team2Score = (maps ?? []).filter((m: any) => m.team2_score > m.team1_score).length

  const gameColor = GAME_COLOR[team1?.game_type] ?? '#00D2BE'
  const matchDate = match.match_date
    ? new Date(match.match_date).toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '날짜 미정'
  const matchTime = match.match_date
    ? new Date(match.match_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 max-w-5xl mx-auto px-6 py-8">

        {/* ── 매치 헤더 ── */}
        <div className="border border-white/10 bg-[#13131f] mb-6 overflow-hidden">
          {/* 상단 띠 */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${gameColor}, transparent)` }} />

          <div className="px-8 py-6">
            {/* 날짜/포맷 */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[#00D2BE] text-xs font-bold uppercase tracking-widest mb-0.5">스크림 매치</p>
                <p className="text-slate-500 text-xs">{match.format}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-semibold">{matchDate}</p>
                {matchTime && <p className="text-slate-500 text-xs mt-0.5">{matchTime} KST</p>}
              </div>
            </div>

            {/* 팀 vs 팀 */}
            <div className="flex items-center justify-between gap-4">
              {/* 팀 1 */}
              <div className="flex-1 text-left">
                <p className={`text-2xl font-black ${winner?.id === team1?.id ? 'text-white' : match.status === 'completed' ? 'text-slate-500' : 'text-white'}`}>
                  {team1?.name ?? '—'}
                </p>
                <p className="text-slate-600 text-xs mt-1">{team1?.tier_avg ?? '—'}</p>
              </div>

              {/* 스코어 */}
              <div className="text-center shrink-0 px-8">
                {match.status === 'completed' ? (
                  <div className="flex items-center gap-4">
                    <span className={`text-4xl font-black ${winner?.id === team1?.id ? 'text-white' : 'text-slate-600'}`}>{team1Score}</span>
                    <span className="text-slate-700 text-xl">:</span>
                    <span className={`text-4xl font-black ${winner?.id === team2?.id ? 'text-white' : 'text-slate-600'}`}>{team2Score}</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#00D2BE] text-sm font-bold">VS</p>
                    <p className="text-slate-600 text-xs mt-1">{match.format}</p>
                  </div>
                )}
                <p className="text-slate-700 text-[10px] mt-2 uppercase tracking-widest">
                  {match.status === 'completed' ? '종료' : match.status === 'ongoing' ? '진행 중' : '예정'}
                </p>
              </div>

              {/* 팀 2 */}
              <div className="flex-1 text-right">
                <p className={`text-2xl font-black ${winner?.id === team2?.id ? 'text-white' : match.status === 'completed' ? 'text-slate-500' : 'text-white'}`}>
                  {team2?.name ?? '—'}
                </p>
                <p className="text-slate-600 text-xs mt-1">{team2?.tier_avg ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 로스터 비교 ── */}
        <RosterComparison
          team1Members={(team1Members ?? []).map((m: any) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
          team2Members={(team2Members ?? []).map((m: any) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
          team1Name={team1?.name ?? '팀 1'}
          team2Name={team2?.name ?? '팀 2'}
        />

        {/* ── 탭 + 콘텐츠 ── */}
        <MatchTabs
          match={match}
          team1={team1}
          team2={team2}
          maps={maps ?? []}
          stats={stats ?? []}
          team1Members={(team1Members ?? []).map((m: any) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
          team2Members={(team2Members ?? []).map((m: any) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
        />

      </div>
    </div>
  )
}
