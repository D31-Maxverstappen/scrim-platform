import Link from 'next/link'
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import RealtimeRefresher from '@/components/common/RealtimeRefresher'
import BookmarkButton from '@/components/common/BookmarkButton'

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

  const myValorantTeams = (myTeams ?? []).filter((m) => m.teams?.game_type === 'valorant')
  const myTeamIds = new Set(myValorantTeams.map((m) => m.teams?.id).filter(Boolean))

  const { data: teamBms } = await supabase
    .from('bookmarks')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'team')
  const bmTeamSet = new Set((teamBms ?? []).map((b) => b.target_id))

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["teams", "team_members"]} />
      <Sidebar />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-black text-[#ff4655] uppercase tracking-widest">VALORANT</span>
            </div>
            <h1 className="text-white font-bold text-xl">팀 찾기</h1>
          </div>
          {(myTeams ?? []).length > 0 ? (
            <span className="text-xs font-bold px-4 py-2 rounded border border-[#00D2BE]/30 bg-[#00D2BE]/10 text-[#00D2BE]">
              팀 소속 중
            </span>
          ) : (
            <Link href="/teams/create" className="bg-[#00D2BE] hover:bg-[#e03040] text-white px-4 py-2 rounded text-sm font-bold transition">
              + 팀 만들기
            </Link>
          )}
        </div>

        {/* 내 발로란트 팀 */}
        {myValorantTeams.length > 0 && (
          <>
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3">My Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {myValorantTeams.map((m) => {
                const team = m.teams
                if (!team) return null
                return (
                  <div key={team.id} className="bg-[#13131f] border border-[#00D2BE]/20 rounded p-5 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold mb-1">{team.name}</p>
                      <div className="flex items-center gap-2">
                        {team.tier_avg && <span className="text-slate-400 text-xs">{team.tier_avg}</span>}
                        <span className="text-xs bg-[#00D2BE]/20 text-[#00D2BE] px-2 py-0.5 rounded">
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
            <span className="col-span-5">팀</span>
            <span className="col-span-4">평균 티어</span>
            <span className="col-span-3 text-right">가입</span>
          </div>
          {allTeams && allTeams.length > 0 ? (
            <div className="divide-y divide-white/5">
              {allTeams.map((team) => (
                <div key={team.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-white/3 transition">
                  <a href={`/teams/${team.id}`} className="col-span-5 text-white font-semibold text-sm hover:text-[#00D2BE] transition">{team.name}</a>
                  <span className="col-span-4 text-slate-400 text-xs">{team.tier_avg ?? '—'}</span>
                  <div className="col-span-3 flex justify-end items-center gap-2">
                    <BookmarkButton type="team" id={team.id} initial={bmTeamSet.has(team.id)} />
                    {myTeamIds.has(team.id) ? (
                      <span className="text-xs text-[#00D2BE]">소속 중</span>
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
            <div className="text-center py-12 text-slate-600 text-sm">아직 팀이 없어요</div>
          )}
        </div>
      </div>
    </div>
  )
}
