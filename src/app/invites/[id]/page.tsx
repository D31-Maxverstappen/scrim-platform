import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import InviteActions from '@/components/team/InviteActions'
import { GAME_LABEL, GAME_COLOR } from '@/lib/games'

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invite } = await supabase
    .from('team_invites')
    .select('id, status, created_at, team_id, invited_user_id, teams(id, name, game_type, tier_avg, wins, losses), invited_by_user:users!team_invites_invited_by_fkey(riot_gamename)')
    .eq('id', id)
    .single()

  if (!invite) notFound()
  if (invite.invited_user_id !== user.id) redirect('/dashboard')

  const team = Array.isArray(invite.teams) ? invite.teams[0] : invite.teams
  const inviter = Array.isArray(invite.invited_by_user) ? invite.invited_by_user[0] : invite.invited_by_user
  const gc = GAME_COLOR[team?.game_type ?? ''] ?? '#00D2BE'
  const total = (team?.wins ?? 0) + (team?.losses ?? 0)

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a] flex items-center justify-center px-6">
      <Sidebar />
      <div className="w-full max-w-sm mt-20">
        <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">

          {/* 헤더 */}
          <div className="h-2 w-full" style={{ background: gc }} />
          <div className="p-6">
            <p className="text-slate-500 text-xs mb-4">
              {inviter?.riot_gamename ?? '캡틴'}이 팀 초대를 보냈어요
            </p>

            {/* 팀 정보 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded border border-white/10 bg-[#0d0d18] flex items-center justify-center text-3xl font-black shrink-0"
                style={{ color: gc }}>
                {team?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <h2 className="text-white font-black text-xl">{team?.name ?? '알 수 없는 팀'}</h2>
                <p className="text-sm font-bold mt-0.5" style={{ color: gc }}>{GAME_LABEL[team?.game_type ?? ''] ?? ''}</p>
                {team?.tier_avg && <p className="text-slate-500 text-xs mt-0.5">{team.tier_avg}</p>}
              </div>
            </div>

            {/* 전적 */}
            {total > 0 && (
              <div className="flex gap-4 mb-6 text-center">
                <div>
                  <p className="text-white font-black text-lg">{team?.wins ?? 0}</p>
                  <p className="text-slate-600 text-xs">승</p>
                </div>
                <div>
                  <p className="text-slate-500 font-black text-lg">{team?.losses ?? 0}</p>
                  <p className="text-slate-600 text-xs">패</p>
                </div>
                <div>
                  <p className="text-white font-black text-lg">{Math.round(((team?.wins ?? 0) / total) * 100)}%</p>
                  <p className="text-slate-600 text-xs">승률</p>
                </div>
              </div>
            )}

            <InviteActions inviteId={id} status={invite.status ?? 'pending'} teamId={team?.id ?? ''} />
          </div>
        </div>
      </div>
    </div>
  )
}
