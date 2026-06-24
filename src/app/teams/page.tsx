import Link from 'next/link'
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import Pagination from '@/components/Pagination'
import { GAME_LABEL, GAME_COLOR } from '@/lib/games'

const PAGE_SIZE = 20

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 내 팀
  const { data: myTeams } = await supabase
    .from('team_members')
    .select('role, teams(id, name, game_type, tier_avg, captain_id)')
    .eq('user_id', user.id)

  // 전체 팀 목록
  const { data: allTeams, count: teamCount } = await supabase
    .from('teams')
    .select('id, name, game_type, tier_avg, captain_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const myTeamIds = new Set((myTeams ?? []).map((m: any) => m.teams?.id).filter(Boolean))

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["teams", "team_members"]} />
      <Sidebar />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">

        {/* 내 팀 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-xl">My Team</h1>
          {myTeams && myTeams.length > 0 ? (
            <span className="text-xs font-bold px-4 py-2 rounded border border-[#00D2BE]/30 bg-[#00D2BE]/10 text-[#00D2BE]">
              팀 소속 중
            </span>
          ) : (
            <Link href="/teams/create" className="bg-[#00D2BE] hover:bg-[#00a896] text-white px-4 py-2 rounded text-sm font-bold transition">
              + 팀 만들기
            </Link>
          )}
        </div>

        {myTeams && myTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {myTeams.map((m: any) => {
              const team = m.teams
              if (!team) return null
              return (
                <div key={team.id} className="bg-[#13131f] border border-white/5 rounded p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{team.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: GAME_COLOR[team.game_type] ?? '#fff', background: (GAME_COLOR[team.game_type] ?? '#fff') + '22' }}>
                        {GAME_LABEL[team.game_type] ?? team.game_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {team.tier_avg && <span className="text-slate-400 text-xs">{team.tier_avg}</span>}
                      <span className="text-xs bg-[#00D2BE]/20 text-[#00D2BE] px-2 py-0.5 rounded">
                        {m.role === 'captain' ? '캡틴' : '멤버'}
                      </span>
                    </div>
                  </div>
                  <a href={`/teams/${team.id}`} className="text-xs text-slate-400 hover:text-white transition">
                    보기 →
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#13131f] border border-white/5 rounded p-10 text-center mb-10">
            <p className="text-slate-500 text-sm mb-3">팀 없음</p>
            <Link href="/teams/create" className="inline-block bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">
              + 팀 만들기
            </Link>
          </div>
        )}

        {/* 전체 팀 목록 */}
        <h2 className="text-white font-bold text-xl mb-4">전체 팀</h2>
        <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 text-xs text-slate-600 uppercase tracking-wider">
            <span className="col-span-4">팀</span>
            <span className="col-span-3">게임</span>
            <span className="col-span-3">평균 티어</span>
            <span className="col-span-2 text-right">가입</span>
          </div>

          {allTeams && allTeams.length > 0 ? (
            <div className="divide-y divide-white/5">
              {allTeams.map((team: any) => (
                <div key={team.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-white/3 transition">
                  <a href={`/teams/${team.id}`} className="col-span-4 text-white font-semibold text-sm hover:text-[#00D2BE] transition">{team.name}</a>
                  <span className="col-span-3 text-xs font-bold" style={{ color: GAME_COLOR[team.game_type] ?? '#fff' }}>
                    {GAME_LABEL[team.game_type] ?? team.game_type}
                  </span>
                  <span className="col-span-3 text-slate-400 text-xs">{team.tier_avg ?? '—'}</span>
                  <div className="col-span-2 flex justify-end">
                    {myTeamIds.has(team.id) ? (
                      <span className="text-xs text-[#00D2BE]">소속 중</span>
                    ) : team.captain_id === user.id ? (
                      <span className="text-xs text-slate-600">내 팀</span>
                    ) : (
                      <a href={`/teams/${team.id}`} className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1  transition">
                        보기
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600 text-sm">
              아직 팀이 없어요
            </div>
          )}
        </div>
        <Pagination page={page} total={teamCount ?? 0} pageSize={PAGE_SIZE} basePath="/teams" />

      </div>
    </div>
  )
}
