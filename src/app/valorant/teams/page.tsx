export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RealtimeRefresher from '@/components/RealtimeRefresher'

export default async function ValorantTeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: myTeams }, { data: allTeams }] = await Promise.all([
    supabase
      .from('team_members')
      .select('role, teams(id, name, game_type, tier_avg, captain_id)')
      .eq('user_id', user.id),
    supabase
      .from('teams')
      .select('id, name, game_type, tier_avg, captain_id')
      .eq('game_type', 'valorant')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const myValorantTeams = (myTeams ?? []).filter((m: any) => m.teams?.game_type === 'valorant')
  const myTeamIds = new Set(myValorantTeams.map((m: any) => m.teams?.id).filter(Boolean))

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <RealtimeRefresher tables={["teams", "team_members"]} />
      <Navbar />
      <div className="pt-28 max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-black text-[#ff4655] uppercase tracking-widest">VALORANT</span>
            </div>
            <h1 className="text-white font-bold text-xl">팀 찾기</h1>
          </div>
          <a href="/teams/create" className="bg-[#ff4655] hover:bg-[#e03040] text-white px-4 py-2 rounded text-sm font-bold transition">
            + 팀 만들기
          </a>
        </div>

        {/* 내 발로란트 팀 */}
        {myValorantTeams.length > 0 && (
          <>
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3">내 팀</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {myValorantTeams.map((m: any) => {
                const team = m.teams
                if (!team) return null
                return (
                  <div key={team.id} className="bg-[#13131f] border border-[#ff4655]/20 rounded p-5 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold mb-1">{team.name}</p>
                      <div className="flex items-center gap-2">
                        {team.tier_avg && <span className="text-slate-400 text-xs">{team.tier_avg}</span>}
                        <span className="text-xs bg-[#ff4655]/20 text-[#ff4655] px-2 py-0.5 rounded">
                          {m.role === 'captain' ? '캡틴' : '멤버'}
                        </span>
                      </div>
                    </div>
                    <a href={`/teams/${team.id}`} className="text-xs text-slate-400 hover:text-white transition">보기 →</a>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* 전체 발로란트 팀 */}
        <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3">전체 팀</h2>
        <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 text-xs text-slate-600 uppercase tracking-wider">
            <span className="col-span-5">팀 이름</span>
            <span className="col-span-4">평균 티어</span>
            <span className="col-span-3 text-right">가입</span>
          </div>
          {allTeams && allTeams.length > 0 ? (
            <div className="divide-y divide-white/5">
              {allTeams.map((team: any) => (
                <div key={team.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-white/3 transition">
                  <a href={`/teams/${team.id}`} className="col-span-5 text-white font-semibold text-sm hover:text-[#ff4655] transition">{team.name}</a>
                  <span className="col-span-4 text-slate-400 text-xs">{team.tier_avg ?? '—'}</span>
                  <div className="col-span-3 flex justify-end">
                    {myTeamIds.has(team.id) ? (
                      <span className="text-xs text-[#ff4655]">소속 중</span>
                    ) : team.captain_id === user.id ? (
                      <span className="text-xs text-slate-600">내 팀</span>
                    ) : (
                      <a href={`/teams/${team.id}`} className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1 transition">보기</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600 text-sm">등록된 발로란트 팀이 없어요</div>
          )}
        </div>
      </div>
    </div>
  )
}
