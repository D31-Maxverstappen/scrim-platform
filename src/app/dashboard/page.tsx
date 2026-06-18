import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AvatarUpload from '@/components/AvatarUpload'
import ProfileCard from '@/components/ProfileCard'
import TeamRankings from '@/components/TeamRankings'

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

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role, teams(id, name, game_type, tier_avg)')
    .eq('user_id', user.id)
    .single()
  const team = (Array.isArray(teamMember?.teams) ? teamMember?.teams[0] : teamMember?.teams) as { id: string; name: string; game_type: string; tier_avg: string } | null | undefined

  const tierColor = TIER_COLOR[profile?.tier ?? ''] ?? '#6b7280'

  // 팀 랭킹용 데이터
  const { data: allTeams } = await supabase
    .from('teams')
    .select('id, name, game_type, tier_avg, wins, losses')
    .limit(50)

  const { data: scrimCounts } = await supabase
    .from('scrim_posts')
    .select('team_id')

  const scrimCountMap: Record<string, number> = {}
  scrimCounts?.forEach((s: any) => {
    scrimCountMap[s.team_id] = (scrimCountMap[s.team_id] ?? 0) + 1
  })

  const teamsWithActivity = (allTeams ?? []).map((t: any) => ({
    ...t,
    scrim_count: scrimCountMap[t.id] ?? 0,
  }))

  const { data: recentScrims } = await supabase
    .from('scrim_posts')
    .select('id, game_type, preferred_date, note, status, teams(name, tier_avg)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(8)

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
                <a href={`/teams/${team.id}`} className="block hover:opacity-80 transition">
                  <p className="text-white font-bold text-sm">{team.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{GAME_LABEL[team.game_type] ?? team.game_type}</p>
                  {team.tier_avg && <p className="text-xs mt-1" style={{ color: '#c89b3c' }}>{team.tier_avg}</p>}
                  <span className="inline-block mt-2 text-xs bg-[#00D2BE]/20 text-[#00D2BE] px-2 py-0.5 rounded">
                    {teamMember?.role === 'captain' ? '캡틴' : '멤버'}
                  </span>
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-slate-600 text-xs">소속 팀 없음</p>
                  <a href="/teams/create" className="text-center bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold py-2 rounded-lg transition">
                    팀 만들기
                  </a>
                </div>
              )}
            </div>

          </aside>

          {/* ── 메인 콘텐츠 ── */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">

            {/* 통계 바 */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '등록 팀', value: '—' },
                { label: '오늘 스크림', value: '—' },
                { label: '활성 유저', value: '—' },
                { label: '평균 매너점수', value: '100' },
              ].map((s) => (
                <div key={s.label} className="bg-[#13131f] border border-white/5 rounded p-4">
                  <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                  <p className="text-white text-xl font-black">{s.value}</p>
                </div>
              ))}
            </div>

            {/* 게임 탭 + 스크림 목록 */}
            <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">

              {/* 탭 헤더 */}
              <div className="flex items-center justify-between px-4 border-b border-white/5">
                <div className="flex">
                  {['전체', 'VALORANT', 'LoL'].map((tab, i) => (
                    <button key={tab} className={`px-4 py-3.5 text-xs font-bold border-b-2 transition ${i === 0 ? 'border-[#00D2BE] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live
                  </span>
                  <a href="/scrims" className="text-[#00D2BE] text-xs hover:underline">전체 보기 →</a>
                </div>
              </div>

              {/* 테이블 헤더 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 text-xs text-slate-600 uppercase tracking-wider">
                <span className="col-span-1">게임</span>
                <span className="col-span-3">팀 이름</span>
                <span className="col-span-2">평균 티어</span>
                <span className="col-span-2">희망 시간</span>
                <span className="col-span-3">한마디</span>
                <span className="col-span-1 text-right">신청</span>
              </div>

              {/* 스크림 목록 */}
              {!recentScrims || recentScrims.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <p className="text-sm mb-1">모집 중인 스크림이 없어요</p>
                  <a href="/scrims/post" className="mt-3 bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-xs font-semibold px-5 py-2 rounded-lg transition">
                    + 스크림 올리기
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentScrims.map((s: any) => {
                    const t = Array.isArray(s.teams) ? s.teams[0] : s.teams
                    const gc = GAME_COLOR[s.game_type] ?? '#00D2BE'
                    const date = s.preferred_date ? new Date(s.preferred_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '미정'
                    return (
                      <a key={s.id} href={`/scrims/${s.id}`} className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-white/2 transition items-center group">
                        <span className="col-span-1 text-xs font-bold" style={{ color: gc }}>{s.game_type === 'valorant' ? 'VAL' : 'LoL'}</span>
                        <span className="col-span-3 text-white text-xs font-semibold truncate group-hover:text-[#00D2BE] transition">{t?.name ?? '—'}</span>
                        <span className="col-span-2 text-slate-500 text-xs truncate">{t?.tier_avg ?? '—'}</span>
                        <span className="col-span-2 text-slate-500 text-xs">{date}</span>
                        <span className="col-span-3 text-slate-600 text-xs truncate">{s.note ?? '—'}</span>
                        <span className="col-span-1 text-right text-[#00D2BE] text-xs">→</span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 하단 그리드 */}
            <div className="grid grid-cols-2 gap-4">

              {/* 최근 매치 */}
              <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <p className="text-white font-bold text-xs uppercase tracking-widest">최근 매치</p>
                  <a href="/profile" className="text-[#00D2BE] text-xs hover:underline">전체 →</a>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                  <p className="text-xs">매치 기록이 없어요</p>
                </div>
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
