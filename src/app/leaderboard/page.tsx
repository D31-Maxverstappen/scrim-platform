import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RealtimeRefresher from '@/components/RealtimeRefresher'

/* ── 티어 유틸 ── */
const TIER_ORDER = [
  'Radiant', 'Immortal', 'Ascendant',
  'Challenger', 'Grandmaster', 'Master',
  'Diamond', 'Emerald', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Iron',
]
function tierRank(tier: string | null) {
  if (!tier) return 999
  const idx = TIER_ORDER.indexOf(tier.split(' ')[0])
  return idx === -1 ? 998 : idx
}
function tierColor(tier: string | null) {
  const map: Record<string, string> = {
    Radiant: '#f0e68c', Immortal: '#ff6b6b', Ascendant: '#34d399',
    Challenger: '#f0e68c', Grandmaster: '#ff6b6b', Master: '#c084fc',
    Diamond: '#60a5fa', Emerald: '#34d399', Platinum: '#a3e635',
    Gold: '#fbbf24', Silver: '#94a3b8', Bronze: '#cd7c54', Iron: '#9ca3af',
  }
  return map[tier?.split(' ')[0] ?? ''] ?? '#64748b'
}

/* ── 순위 배지 ── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>
  if (rank === 2) return <span className="text-base">🥈</span>
  if (rank === 3) return <span className="text-base">🥉</span>
  return <span className="text-slate-600 font-black text-sm">{rank}</span>
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; tab?: string }>
}) {
  const { game = 'valorant', tab = 'team' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── 팀 랭킹 데이터 ── */
  const { data: teamsRaw } = await supabase
    .from('teams')
    .select('id, name, tier_avg, wins, losses, game_type')
    .eq('game_type', game)
    .or('wins.gt.0,losses.gt.0')
    .order('wins', { ascending: false })
    .limit(100)

  const teams = (teamsRaw ?? [])
    .map((t) => {
      const total = (t.wins ?? 0) + (t.losses ?? 0)
      return { ...t, total, winRate: total > 0 ? Math.round(((t.wins ?? 0) / total) * 100) : 0 }
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return (b.wins ?? 0) - (a.wins ?? 0)
      return b.winRate - a.winRate
    })

  /* ── 플레이어 랭킹 데이터 ── */
  const { data: players } = await supabase
    .from('users')
    .select('id, riot_gamename, riot_tagline, val_gamename, val_tier, tier, avatar_url, game_type')
    .eq('game_type', 'valorant')
    .not('riot_gamename', 'is', null)
    .limit(200)

  const sortedPlayers = (players ?? [])
    .map((u) => ({
      ...u,
      displayTier: u.val_tier ?? u.tier,
      displayName: u.val_gamename ?? u.riot_gamename,
    }))
    .filter((u) => u.displayTier)
    .sort((a, b) => tierRank(a.displayTier) - tierRank(b.displayTier))

  const myTeamRank = teams.findIndex((t) => false) // 나중에 내 팀 강조
  const myPlayerRank = sortedPlayers.findIndex((u) => u.id === user.id)

  const gameLabel = 'VALORANT'
  const gameColor = '#ff4655'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <RealtimeRefresher tables={['teams', 'users']} />
      <Navbar />
      <div className="pt-28 max-w-3xl mx-auto px-6 py-8">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-1">D31 랭킹</p>
        </div>


        {/* 카테고리 탭 */}
        <div className="flex border-b border-white/5 mb-6">
          {[['team', '팀 랭킹'], ['player', '플레이어 랭킹']].map(([tabKey, label]) => (
            <a key={tabKey} href={`/leaderboard?game=${game}&tab=${tabKey}`}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition ${tab === tabKey ? 'border-[#00D2BE] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {label}
            </a>
          ))}
        </div>

        {/* ── 팀 랭킹 ── */}
        {tab === 'team' && (
          <>
            {teams.length === 0 ? (
              <div className="bg-[#13131f] border border-white/5 rounded p-12 text-center">
                <p className="text-slate-600 text-sm">아직 매치 기록이 있는 팀이 없어요</p>
                <p className="text-slate-700 text-xs mt-1">스크림을 진행하고 결과를 입력하면 랭킹이 생겨요</p>
              </div>
            ) : (
              <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
                {/* 헤더 */}
                <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 text-[10px] text-slate-600 uppercase tracking-widest">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-4">팀</span>
                  <span className="col-span-2 text-center">티어</span>
                  <span className="col-span-2 text-center">전적</span>
                  <span className="col-span-3 text-center">승률</span>
                </div>
                {teams.map((t, i) => (
                  <a key={t.id} href={`/teams/${t.id}`}
                    className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/3 transition items-center group">
                    <span className="col-span-1 flex justify-center">
                      <RankBadge rank={i + 1} />
                    </span>
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded border border-white/10 bg-[#0d0d18] flex items-center justify-center font-black text-sm shrink-0"
                        style={{ color: gameColor }}>
                        {t.name[0].toUpperCase()}
                      </div>
                      <span className="text-white font-bold text-sm truncate group-hover:text-[#00D2BE] transition">
                        {t.name}
                      </span>
                    </div>
                    <span className="col-span-2 text-center text-slate-500 text-xs">{t.tier_avg ?? '—'}</span>
                    <div className="col-span-2 text-center">
                      <span className="text-green-400 font-bold text-xs">{t.wins ?? 0}</span>
                      <span className="text-slate-700 text-xs mx-1">—</span>
                      <span className="text-slate-500 font-bold text-xs">{t.losses ?? 0}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="flex-1 bg-white/5 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-[#00D2BE] transition-all"
                          style={{ width: `${t.winRate}%` }} />
                      </div>
                      <span className="text-slate-400 text-xs font-bold w-8 text-right shrink-0">{t.winRate}%</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── 플레이어 랭킹 ── */}
        {tab === 'player' && (
          <>
            {myPlayerRank !== -1 && (
              <div className="bg-[#00D2BE]/10 border border-[#00D2BE]/20 rounded px-5 py-3 mb-4 flex items-center gap-3">
                <span className="text-[#00D2BE] font-black text-lg">#{myPlayerRank + 1}</span>
                <span className="text-white font-semibold text-sm">내 순위</span>
                <span className="text-slate-400 text-sm">{sortedPlayers[myPlayerRank]?.displayTier ?? '—'}</span>
              </div>
            )}

            {sortedPlayers.length === 0 ? (
              <div className="bg-[#13131f] border border-white/5 rounded p-12 text-center text-slate-600 text-sm">
                아직 등록된 플레이어가 없어요
              </div>
            ) : (
              <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 text-[10px] text-slate-600 uppercase tracking-widest">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-7">플레이어</span>
                  <span className="col-span-4">티어</span>
                </div>
                {sortedPlayers.map((u, i) => {
                  const isMe = u.id === user.id
                  const tc = tierColor(u.displayTier)
                  return (
                    <a key={u.id} href={`/users/${u.id}`}
                      className={`grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 last:border-0 transition items-center group ${isMe ? 'bg-[#00D2BE]/5' : 'hover:bg-white/2'}`}>
                      <span className="col-span-1 flex justify-center">
                        <RankBadge rank={i + 1} />
                      </span>
                      <div className="col-span-7 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 shrink-0 flex items-center justify-center text-xs font-black text-white/30">
                          {u.avatar_url
                            ? <img src={u.avatar_url} className="w-full h-full object-cover object-top" alt="" />
                            : u.displayName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <span className={`font-semibold text-sm ${isMe ? 'text-[#00D2BE]' : 'text-white group-hover:text-[#00D2BE] transition'}`}>
                            {u.displayName}
                          </span>
                          {u.riot_tagline && (
                            <span className="text-slate-600 text-xs"> #{u.riot_tagline}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-4">
                        <span className="text-sm font-semibold" style={{ color: tc }}>
                          {u.displayTier}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
