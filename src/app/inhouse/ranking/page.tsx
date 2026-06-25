import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmptyState, EmptyIcons } from '@/components/common/EmptyState'
import { getTierColor } from '@/lib/tiers'

export const dynamic = 'force-dynamic'

const MEDALS = ['🥇', '🥈', '🥉']

export default async function InhouseRankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 종료(done)되고 승리팀이 정해진 방의 참가자 전체 → 개인별 집계
  const { data: rows } = await supabase
    .from('inhouse_participants')
    .select('user_id, team, inhouse_rooms!inner(winner_team, status), users(riot_gamename, val_gamename, avatar_url, tier)')
    .eq('inhouse_rooms.status', 'done')
    .not('inhouse_rooms.winner_team', 'is', null)

  type Agg = { user_id: string; name: string; avatar: string | null; tier: string | null; wins: number; total: number }
  const map = new Map<string, Agg>()
  for (const r of rows ?? []) {
    if (!r.user_id) continue
    const room = Array.isArray(r.inhouse_rooms) ? r.inhouse_rooms[0] : r.inhouse_rooms
    if (!room?.winner_team) continue
    const u = Array.isArray(r.users) ? r.users[0] : r.users
    const cur = map.get(r.user_id) ?? {
      user_id: r.user_id,
      name: u?.val_gamename ?? u?.riot_gamename ?? '익명',
      avatar: u?.avatar_url ?? null,
      tier: u?.tier ?? null,
      wins: 0,
      total: 0,
    }
    cur.total += 1
    if (r.team === room.winner_team) cur.wins += 1
    map.set(r.user_id, cur)
  }
  const ranking = [...map.values()]
    .map((a) => ({ ...a, losses: a.total - a.wins, winRate: a.total > 0 ? Math.round((a.wins / a.total) * 100) : 0 }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate) // 승수 우선, 동률 시 승률
    .slice(0, 50)

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">내전 랭킹</h1>
          <p className="text-slate-400 text-sm mt-1">개인 누적 — 팀은 매번 바뀌어도 당신의 기록은 쌓입니다</p>
        </div>

        {ranking.length === 0 ? (
          <EmptyState
            accent="#00D2BE"
            icon={EmptyIcons.target}
            title="아직 내전 기록이 없어요"
            description="내전을 플레이하고 방장이 결과를 입력하면 랭킹이 생겨요"
          />
        ) : (
          <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 text-[10px] text-slate-600 uppercase tracking-widest">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-5">플레이어</span>
              <span className="col-span-2 text-center">판수</span>
              <span className="col-span-2 text-center">전적</span>
              <span className="col-span-2 text-center">승률</span>
            </div>
            {ranking.map((r, i) => {
              const isMe = r.user_id === user.id
              return (
                <div
                  key={r.user_id}
                  className={`grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-white/5 last:border-0 items-center transition ${isMe ? 'bg-[#00D2BE]/10' : 'hover:bg-white/3'}`}
                >
                  <span className="col-span-1 flex justify-center">
                    {i < 3 ? (
                      <span className="text-base">{MEDALS[i]}</span>
                    ) : (
                      <span className="text-slate-600 font-black text-sm">{i + 1}</span>
                    )}
                  </span>
                  <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                    {r.avatar ? (
                      <img src={r.avatar} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black text-xs shrink-0">
                        {r.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">
                        {r.name}
                        {isMe && <span className="text-[#00D2BE] text-xs ml-1">(나)</span>}
                      </p>
                      {r.tier && (
                        <p className="text-[10px]" style={{ color: getTierColor(r.tier) }}>
                          {r.tier}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="col-span-2 text-center text-slate-400 text-xs">{r.total}판</span>
                  <span className="col-span-2 text-center text-xs">
                    <span className="text-green-400 font-bold">{r.wins}</span>
                    <span className="text-slate-700 mx-0.5">/</span>
                    <span className="text-slate-500">{r.losses}</span>
                  </span>
                  <span className="col-span-2 text-center text-white font-bold text-sm">{r.winRate}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
