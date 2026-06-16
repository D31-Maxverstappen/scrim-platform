import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myTeams } = await supabase
    .from('team_members')
    .select('*, teams(*)')
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-[#0f0f13] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">🛡️ 내 팀</h1>
          <a
            href="/teams/create"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + 팀 만들기
          </a>
        </div>

        {myTeams && myTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTeams.map((member: any) => (
              <div key={member.id} className="bg-[#1e1e2e] rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold text-lg">{member.teams?.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    member.role === 'captain'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {member.role === 'captain' ? '👑 캡틴' : '멤버'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  {member.teams?.game_type === 'valorant' ? '🎯 발로란트' : '⚔️ 리그 오브 레전드'}
                </p>
                <div className="flex gap-3 mt-2 text-sm">
                  <span className="text-green-400">승 {member.teams?.win_count}</span>
                  <span className="text-red-400">패 {member.teams?.loss_count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-20">
            <p className="text-4xl mb-4">🛡️</p>
            <p>아직 소속된 팀이 없어요</p>
            <p className="text-sm mt-1">팀을 만들거나 초대를 기다려보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}
