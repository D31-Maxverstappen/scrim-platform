import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import AvatarUpload from '@/components/AvatarUpload'
import CountrySelect from '@/components/CountrySelect'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import { GAME_LABEL } from '@/lib/games'

const TIER_COLOR: Record<string, string> = {
  Iron: 'text-slate-400', Bronze: 'text-orange-700', Silver: 'text-slate-300',
  Gold: 'text-yellow-400', Platinum: 'text-teal-400', Emerald: 'text-emerald-400',
  Diamond: 'text-blue-400', Master: 'text-purple-400', Grandmaster: 'text-red-400',
  Challenger: 'text-yellow-300', Ascendant: 'text-green-400', Immortal: 'text-red-500',
  Radiant: 'text-yellow-200', Unranked: 'text-slate-500',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, avatar_url, val_gamename, val_tagline, val_tier, riot_gamename, riot_tagline, tier, game_type, country, manner_score')
    .eq('id', user.id)
    .single()

  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role, teams(id, name, game_type, tier_avg, wins, losses)')
    .eq('user_id', user.id)
    .single()

  const team = (Array.isArray(teamMember?.teams) ? teamMember?.teams[0] : teamMember?.teams) as { id: string; name: string; game_type: string; tier_avg: string; wins: number; losses: number } | null | undefined

  // 스크림 전적: 소속 팀 기준
  const wins = team?.wins ?? 0
  const losses = team?.losses ?? 0
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null

  // 최근 스크림: 소속 팀의 매치 (team1/team2 양쪽 조회 후 병합)
  let recentMatches: { id: string; status: string | null; format: string | null; match_date: string | null; winner_id: string | null; opponent: { id: string; name: string } | null }[] = []
  if (team?.id) {
    const [{ data: m1 }, { data: m2 }] = await Promise.all([
      supabase.from('matches')
        .select('id, status, format, match_date, winner_id, team1_id, team2_id, team2:teams!team2_id(id, name)')
        .eq('team1_id', team.id).order('match_date', { ascending: false }).limit(5),
      supabase.from('matches')
        .select('id, status, format, match_date, winner_id, team1_id, team2_id, team1:teams!team1_id(id, name)')
        .eq('team2_id', team.id).order('match_date', { ascending: false }).limit(5),
    ])
    recentMatches = [
      ...(m1 ?? []).map((m: any) => ({ ...m, opponent: Array.isArray(m.team2) ? m.team2[0] : m.team2 })),
      ...(m2 ?? []).map((m: any) => ({ ...m, opponent: Array.isArray(m.team1) ? m.team1[0] : m.team1 })),
    ].sort((a, b) => new Date(b.match_date ?? 0).getTime() - new Date(a.match_date ?? 0).getTime()).slice(0, 5)
  }

  const tierColor = TIER_COLOR[(profile?.tier ?? '').split(' ')[0]] ?? 'text-slate-400'

  return (
    <div className="min-h-screen ml-56 bg-[#07070b]">
      <Sidebar />
      <div className="pt-6 max-w-3xl mx-auto px-6 py-10">

        {/* 프로필 헤더 */}
        <div className="bg-[#111118] border border-white/5 rounded p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
          <AvatarUpload
            userId={user.id}
            initialUrl={profile?.avatar_url ?? null}
            initials={profile?.riot_gamename?.[0]?.toUpperCase() ?? '?'}
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-white font-black text-2xl">
                {profile?.riot_gamename ?? '유저'}
              </h1>
              {profile?.riot_tagline && (
                <span className="text-slate-500 text-sm">#{profile.riot_tagline}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {profile?.game_type && (
                <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded">
                  {GAME_LABEL[profile.game_type] ?? profile.game_type}
                </span>
              )}
              {profile?.tier && (
                <span className={`text-sm font-bold ${tierColor}`}>
                  {profile.tier}
                </span>
              )}
              {!profile?.riot_gamename && (
                <a href="/onboarding" className="text-xs text-[#00D2BE] hover:underline">
                  + 라이엇 계정 연동하기
                </a>
              )}
            </div>
            {/* 국가 선택 */}
            <div className="mt-3">
              <CountrySelect initialCountry={profile?.country ?? null} />
            </div>
          </div>
        </div>

        {/* 게임 계정 */}
        <div className="flex flex-col gap-3 mb-6">
          {/* VALORANT */}
          <div className="bg-[#111118] border border-white/5 rounded p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff4655]" />
                <p className="text-xs font-black text-[#ff4655] uppercase tracking-widest">VALORANT</p>
              </div>
              <a href="/onboarding?add=valorant" className="text-xs text-slate-500 hover:text-white transition">
                {profile?.val_gamename ? '수정' : '+ 등록'}
              </a>
            </div>
            {profile?.val_gamename ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-[#ff4655]/10 border border-[#ff4655]/20 flex items-center justify-center text-[#ff4655] font-black text-lg">
                  {profile.val_gamename[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold">
                    {profile.val_gamename}
                    {profile.val_tagline && <span className="text-slate-500 font-normal text-sm"> #{profile.val_tagline}</span>}
                  </p>
                  {profile.val_tier && (
                    <p className={`text-sm font-bold mt-0.5 ${TIER_COLOR[profile.val_tier.split(' ')[0]] ?? 'text-slate-400'}`}>
                      {profile.val_tier}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 py-2">
                <div className="w-12 h-12 rounded bg-white/5 border border-white/10 border-dashed flex items-center justify-center text-slate-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">계정을 등록하여 정보를 확인하세요!</p>
                  <a href="/onboarding?add=valorant" className="text-[#ff4655] text-xs hover:underline mt-0.5 inline-block">
                    VALORANT 계정 연동 →
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* 매너 점수 */}
          <div className="bg-[#111118] border border-white/5 rounded p-5">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">매너 점수</p>
            <p className="text-4xl font-black text-white mb-2">{profile?.manner_score ?? 100}</p>
            <div className="w-full bg-white/5 rounded h-1.5 mb-2">
              <div className="bg-gradient-to-r from-[#00D2BE] to-[#00a896] h-1.5 rounded" style={{ width: `${((profile?.manner_score ?? 100) / 200) * 100}%` }} />
            </div>
            <p className="text-slate-600 text-xs">0~200pt</p>
          </div>

          {/* 소속 팀 */}
          <div className="bg-[#111118] border border-white/5 rounded p-5">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">소속 팀</p>
            {team ? (
              <>
                <p className="text-white font-bold text-lg mb-1">{team.name}</p>
                <p className="text-slate-500 text-xs">{GAME_LABEL[team.game_type] ?? team.game_type}</p>
                {team.tier_avg && <p className="text-[#00D2BE] text-xs mt-1">{team.tier_avg}</p>}
                <span className="inline-block mt-2 text-xs bg-[#00D2BE]/20 text-[#00D2BE] px-2 py-0.5 rounded">
                  {teamMember?.role === 'captain' ? '캡틴' : '멤버'}
                </span>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-slate-600 text-sm">소속 팀 없음</p>
                <Link href="/teams/create" className="text-xs text-[#00D2BE] hover:underline">팀 만들기 →</Link>
              </div>
            )}
          </div>

          {/* 전적 */}
          <div className="bg-[#111118] border border-white/5 rounded p-5">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">스크림 전적</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-4xl font-black text-white">{wins}</span>
              <span className="text-slate-500 text-sm mb-1">승</span>
              <span className="text-4xl font-black text-slate-600">{losses}</span>
              <span className="text-slate-600 text-sm mb-1">패</span>
            </div>
            <p className="text-slate-600 text-xs">승률 {winRate !== null ? `${winRate}%` : '—'}</p>
          </div>

        </div>

        {/* 최근 스크림 */}
        <div className="bg-[#111118] border border-white/5 rounded overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">최근 스크림</h2>
            <Link href={team ? `/teams/${team.id}` : '/scrims'} className="text-[#00D2BE] text-xs hover:underline">전체 보기 →</Link>
          </div>
          {recentMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <svg className="w-10 h-10 mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6l3-3 3 3v6M3 21h18" />
              </svg>
              <p className="text-sm">아직 스크림 기록이 없어요</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentMatches.map((m) => {
                const isWin = m.status === 'completed' && m.winner_id === team?.id
                const isDraw = m.status === 'completed' && !m.winner_id
                const isLoss = m.status === 'completed' && !!m.winner_id && m.winner_id !== team?.id
                const isOngoing = m.status === 'ongoing'
                const date = m.match_date
                  ? new Date(m.match_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                  : '미정'
                return (
                  <Link key={m.id} href={`/matches/${m.id}`}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/5 transition group">
                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-xs font-black rounded
                      ${isWin ? 'bg-[#00D2BE]/20 text-[#00D2BE]' :
                        isLoss ? 'bg-red-500/20 text-red-400' :
                        isDraw ? 'bg-slate-500/20 text-slate-400' :
                        isOngoing ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-white/5 text-slate-600'}`}>
                      {isWin ? 'W' : isLoss ? 'L' : isDraw ? 'D' : isOngoing ? '●' : '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-[#00D2BE] transition">
                        vs {m.opponent?.name ?? '?'}
                      </p>
                      <p className="text-slate-600 text-xs">{date} · {m.format ?? 'BO3'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
                      ${isWin ? 'bg-[#00D2BE]/10 text-[#00D2BE]' :
                        isLoss ? 'bg-red-500/10 text-red-400' :
                        isDraw ? 'bg-slate-500/10 text-slate-400' :
                        isOngoing ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-white/5 text-slate-500'}`}>
                      {isWin ? '승' : isLoss ? '패' : isDraw ? '무' : isOngoing ? '진행 중' : '예정'}
                    </span>
                    <span className="text-slate-700 text-xs group-hover:text-slate-500 transition">→</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* 회원탈퇴 */}
        <div className="border border-red-500/20 bg-red-500/5 rounded p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">회원탈퇴</p>
            <p className="text-slate-500 text-xs mt-0.5">계정과 모든 데이터가 영구적으로 삭제돼요</p>
          </div>
          <DeleteAccountButton />
        </div>

      </div>
    </div>
  )
}
