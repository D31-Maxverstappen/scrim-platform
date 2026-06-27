import { createClient } from '@/lib/supabase/server'
import { formatKST } from '@/lib/datetime'
import { redirect, notFound } from 'next/navigation'
import MatchTabs from '@/components/match/MatchTabs'
import RosterComparison from '@/components/match/RosterComparison'
import MatchCancelButton from '@/components/match/MatchCancelButton'
import MatchEndButton from '@/components/match/MatchEndButton'
import MatchScoreInput from '@/components/match/MatchScoreInput'
import RealtimeRefresher from '@/components/common/RealtimeRefresher'
import MannerRating from '@/components/match/MannerRating'
import { expireStaleMatches, CANCEL_REASON_LABEL } from '@/lib/matchExpiry'
import type { MatchStat } from '@/lib/types'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655' }

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 조회 시 만료: 시간 지난 예정 매치 정리 후 조회
  await expireStaleMatches()

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!team1_id(id, name, abbreviation, game_type, tier_avg),
      team2:teams!team2_id(id, name, abbreviation, game_type, tier_avg),
      winner:teams!winner_id(id, name)
    `)
    .eq('id', id)
    .single()

  if (!match) notFound()

  const [{ data: maps }, { data: stats }, { data: team1Members }, { data: team2Members }] = await Promise.all([
    supabase.from('match_maps').select('id, match_id, map_number, map_name, team1_score, team2_score, round_results').eq('match_id', id).order('map_number'),
    supabase.from('match_player_stats')
      .select('*, users(riot_gamename, val_gamename, avatar_url, country)')
      .eq('match_id', id),
    supabase.from('team_members')
      .select('user_id, role, is_igl, users(val_gamename, riot_gamename, val_tier, tier, country, avatar_url)')
      .eq('team_id', match.team1_id as string)
      .neq('role', 'coach'),
    supabase.from('team_members')
      .select('user_id, role, is_igl, users(val_gamename, riot_gamename, val_tier, tier, country, avatar_url)')
      .eq('team_id', match.team2_id as string)
      .neq('role', 'coach'),
  ])

  const team1 = Array.isArray(match.team1) ? match.team1[0] : match.team1
  const team2 = Array.isArray(match.team2) ? match.team2[0] : match.team2
  const winner = Array.isArray(match.winner) ? match.winner[0] : match.winner

  const isCancelled = match.status === 'cancelled'
  const cancelReason = (match as { cancel_reason?: string | null }).cancel_reason ?? null
  // 자동매칭 즉시 매치: scrim_post_id 없음 → 약속시간이 아니라 '지금 바로'
  const isInstant = !(match as { scrim_post_id?: string | null }).scrim_post_id

  // DB nullable 컬럼 → MatchStat(엄격) 경계 정규화
  const safeStats: MatchStat[] = (stats ?? []).map((s) => ({
    ...s,
    user_id: s.user_id ?? '',
    team_id: s.team_id ?? '',
    map_id: s.map_id ?? '',
    kills: s.kills ?? 0, deaths: s.deaths ?? 0, assists: s.assists ?? 0,
    acs: s.acs ?? 0, kast: s.kast ?? 0, adr: s.adr ?? 0,
    hs_pct: s.hs_pct ?? 0, fk: s.fk ?? 0, fd: s.fd ?? 0,
  }))

  // 양 팀 중 하나의 캡틴인지 확인
  const { data: captainTeam } = await supabase
    .from('teams')
    .select('id')
    .in('id', [match.team1_id, match.team2_id].filter((v): v is string => !!v))
    .eq('captain_id', user.id)
    .single()
  const isCaptain = !!captainTeam

  // 매너 평가: 종료된 매치에서 캡틴이 상대 팀을 평가 (이미 평가했는지 조회)
  const opponentTeam = captainTeam?.id === match.team1_id ? team2 : team1
  let mannerRated = false
  if (match.status === 'completed' && isCaptain) {
    const { data: existing } = await supabase
      .from('manner_logs')
      .select('id')
      .eq('match_id', id)
      .eq('from_user_id', user.id)
      .limit(1)
    mannerRated = !!(existing && existing.length > 0)
  }

  const team1Score = (maps ?? []).filter((m) => (m.team1_score ?? 0) > (m.team2_score ?? 0)).length
  const team2Score = (maps ?? []).filter((m) => (m.team2_score ?? 0) > (m.team1_score ?? 0)).length

  const gameColor = GAME_COLOR[team1?.game_type] ?? '#00D2BE'
  const matchDate = match.match_date
    ? formatKST(match.match_date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '날짜 미정'
  const matchTime = match.match_date
    ? formatKST(match.match_date, { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["matches", "match_maps", "match_player_stats"]} />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">

        {/* ── 매치 헤더 ── */}
        <div className="border border-white/10 bg-[#13131f] mb-6 overflow-hidden">
          {/* 상단 띠 */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${gameColor}, transparent)` }} />

          <div className="px-8 py-6">
            {/* 날짜/포맷 */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[#00D2BE] text-xs font-bold uppercase tracking-widest mb-0.5">{isInstant ? '⚡ 즉시 매치' : '스크림 매치'}</p>
                <p className="text-slate-500 text-xs">{match.format}</p>
              </div>
              <div className="flex items-center gap-4">
                {isCaptain && match.status !== 'completed' && !isCancelled && (
                  <div className="flex items-center gap-2">
                    <MatchScoreInput
                      matchId={id}
                      format={match.format ?? 'BO3'}
                      gameType={team1?.game_type ?? 'valorant'}
                      team1Id={team1?.id}
                      team1Name={team1?.name ?? '팀 1'}
                      team2Id={team2?.id}
                      team2Name={team2?.name ?? '팀 2'}
                      initialMaps={maps ?? []}
                    />
                    <MatchCancelButton matchId={id} />
                  </div>
                )}
                <div className="text-right">
                  {isInstant && match.status === 'scheduled' ? (
                    <>
                      <p className="text-white text-sm font-semibold">지금 바로 시작</p>
                      <p className="text-[#00D2BE] text-xs mt-0.5 font-medium">방금 매칭됐어요</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-sm font-semibold">{matchDate}</p>
                      {matchTime && <p className="text-slate-500 text-xs mt-0.5">{matchTime} KST</p>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 팀 vs 팀 */}
            <div className="flex items-center justify-between gap-4">
              {/* 팀 1 */}
              <div className="flex-1 flex items-center gap-4">
                <div className={`w-16 h-16 shrink-0 rounded-xl flex items-center justify-center font-black text-2xl border border-white/10 ${winner?.id === team1?.id || match.status !== 'completed' ? 'bg-[#1a1a2e] text-white' : 'bg-[#13131f] text-slate-600'}`}>
                  {(team1?.abbreviation || team1?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className={`text-xl font-black ${winner?.id === team1?.id ? 'text-white' : match.status === 'completed' ? 'text-slate-500' : 'text-white'}`}>
                    {team1?.name ?? '—'}
                  </p>
                  <p className="text-slate-600 text-xs mt-0.5">{team1?.tier_avg ?? '—'}</p>
                </div>
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
                <p className="text-slate-700 text-[11px] mt-2 uppercase tracking-widest">
                  {match.status === 'completed' ? '종료' : isCancelled ? '취소됨' : match.status === 'ongoing' ? '진행 중' : '예정'}
                </p>
              </div>

              {/* 팀 2 */}
              <div className="flex-1 flex items-center justify-end gap-4">
                <div className="text-right">
                  <p className={`text-xl font-black ${winner?.id === team2?.id ? 'text-white' : match.status === 'completed' ? 'text-slate-500' : 'text-white'}`}>
                    {team2?.name ?? '—'}
                  </p>
                  <p className="text-slate-600 text-xs mt-0.5">{team2?.tier_avg ?? '—'}</p>
                </div>
                <div className={`w-16 h-16 shrink-0 rounded-xl flex items-center justify-center font-black text-2xl border border-white/10 ${winner?.id === team2?.id || match.status !== 'completed' ? 'bg-[#1a1a2e] text-white' : 'bg-[#13131f] text-slate-600'}`}>
                  {(team2?.abbreviation || team2?.name || '?')[0].toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 취소 사유 배너 ── */}
        {isCancelled && (
          <div className="mb-6 rounded-lg border border-red-500/25 bg-red-500/[0.06] px-5 py-4 flex items-center gap-3">
            <span className="text-[11px] font-black text-red-400 border border-red-500/40 rounded px-1.5 py-0.5 shrink-0">취소됨</span>
            <p className="text-slate-300 text-sm">{CANCEL_REASON_LABEL[cancelReason ?? ''] ?? '매치가 취소됐어요.'}</p>
          </div>
        )}

        {/* ── 매너 평가 (종료된 매치, 캡틴만) ── */}
        {match.status === 'completed' && isCaptain && (
          <MannerRating matchId={id} alreadyRated={mannerRated} opponentName={opponentTeam?.name ?? '상대 팀'} />
        )}

        {/* ── Discord 음성채널 ── */}
        {match.discord_channel_id && match.status !== 'completed' && !isCancelled && (() => {
          const channelIds = match.discord_channel_id.split(',').filter(Boolean)
          const labels = [team1?.name ?? '팀 1', team2?.name ?? '팀 2']
          return (
            <div className="flex gap-3 mb-4">
              {channelIds.map((cid: string, i: number) => (
                <a key={cid}
                  href={`https://discord.com/channels/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-3 bg-[#1e1e2e] border border-[#5865F2]/30 rounded px-4 py-3 hover:border-[#5865F2]/60 transition group"
                >
                  <div className="w-8 h-8 bg-[#5865F2]/20 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs">{labels[i] ?? `팀${i + 1}`} 대기실</p>
                    <p className="text-slate-500 text-[11px]">팀원만 입장 가능</p>
                  </div>
                  <span className="text-[#5865F2] text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </a>
              ))}
            </div>
          )
        })()}

        {/* ── 로스터 비교 ── */}
        <RosterComparison
          team1Members={(team1Members ?? []).map((m) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
          team2Members={(team2Members ?? []).map((m) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
          team1Name={team1?.abbreviation || team1?.name || '팀 1'}
          team2Name={team2?.abbreviation || team2?.name || '팀 2'}
        />

        {/* ── 탭 + 콘텐츠 ── */}
        <MatchTabs
          match={match}
          team1={team1}
          team2={team2}
          maps={maps ?? []}
          stats={safeStats}
          team1Members={(team1Members ?? []).map((m) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
          team2Members={(team2Members ?? []).map((m) => ({ ...m, users: Array.isArray(m.users) ? m.users[0] : m.users }))}
        />

      </div>
    </div>
  )
}
