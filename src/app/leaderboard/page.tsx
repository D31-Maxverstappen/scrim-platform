import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

const TIER_ORDER = [
  'Challenger', 'Grandmaster', 'Master', 'Diamond', 'Emerald',
  'Platinum', 'Gold', 'Silver', 'Bronze', 'Iron',
  'Radiant', 'Immortal', 'Ascendant', 'Unranked',
]

function tierRank(tier: string | null) {
  if (!tier) return 999
  const base = tier.split(' ')[0]
  const idx = TIER_ORDER.indexOf(base)
  return idx === -1 ? 998 : idx
}

function tierColor(tier: string | null) {
  if (!tier) return '#64748b'
  const t = tier.split(' ')[0]
  const map: Record<string, string> = {
    Challenger: '#f0e68c', Grandmaster: '#ff6b6b', Master: '#c084fc',
    Diamond: '#60a5fa', Emerald: '#34d399', Platinum: '#a3e635',
    Gold: '#fbbf24', Silver: '#94a3b8', Bronze: '#cd7c54', Iron: '#9ca3af',
    Radiant: '#f0e68c', Immortal: '#ff6b6b', Ascendant: '#34d399',
  }
  return map[t] ?? '#64748b'
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game = 'valorant' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: users } = await supabase
    .from('users')
    .select('id, riot_gamename, riot_tagline, tier, avatar_url, manner_score, game_type')
    .eq('game_type', game)
    .not('tier', 'is', null)
    .not('riot_gamename', 'is', null)
    .limit(100)

  const sorted = (users ?? []).sort((a, b) => tierRank(a.tier) - tierRank(b.tier))

  const myRank = sorted.findIndex(u => u.id === user.id)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-16 max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-1">D31 상위 플레이어</p>
        </div>

        {/* 게임 탭 */}
        <div className="flex gap-2 mb-6">
          {[['valorant', 'VALORANT'], ['lol', 'League of Legends']].map(([v, l]) => (
            <a key={v} href={`/leaderboard?game=${v}`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${game === v ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {l}
            </a>
          ))}
        </div>

        {/* 내 순위 */}
        {myRank !== -1 && (
          <div className="bg-[#00D2BE]/10 border border-[#00D2BE]/20 rounded-xl px-5 py-3 mb-4 flex items-center gap-3">
            <span className="text-[#00D2BE] font-black text-lg">#{myRank + 1}</span>
            <span className="text-white font-semibold text-sm">내 순위</span>
            <span className="text-slate-400 text-sm">{sorted[myRank]?.tier ?? '—'}</span>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="bg-[#13131f] border border-white/5 rounded-2xl p-12 text-center text-slate-600 text-sm">
            아직 등록된 플레이어가 없어요
          </div>
        ) : (
          <div className="bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-widest">
                  <th className="text-left px-5 py-3 w-12">#</th>
                  <th className="text-left px-3 py-3">플레이어</th>
                  <th className="text-left px-3 py-3">티어</th>
                  <th className="text-right px-5 py-3">매너</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, i) => {
                  const isMe = u.id === user.id
                  const tc = tierColor(u.tier)
                  return (
                    <tr key={u.id}
                      className={`border-b border-white/5 last:border-0 transition ${isMe ? 'bg-[#00D2BE]/5' : 'hover:bg-white/2'}`}>
                      <td className="px-5 py-3 text-sm font-black" style={{ color: i < 3 ? '#00D2BE' : '#475569' }}>
                        {i + 1}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} className="w-8 h-8 rounded-lg object-cover" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] text-xs font-black">
                              {u.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          )}
                          <div>
                            <span className={`font-semibold text-sm ${isMe ? 'text-[#00D2BE]' : 'text-white'}`}>
                              {u.riot_gamename}
                            </span>
                            {u.riot_tagline && (
                              <span className="text-slate-600 text-xs"> #{u.riot_tagline}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold" style={{ color: tc }}>
                        {u.tier ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-slate-400">
                        {u.manner_score ?? 100}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
