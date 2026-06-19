import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ScrimApplyButton from '@/components/ScrimApplyButton'
import RealtimeRefresher from '@/components/RealtimeRefresher'

const GAME_LABEL: Record<string, string> = { valorant: 'VALORANT', lol: 'League of Legends' }
const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }

function formatDate(dt: string | null) {
  if (!dt) return '미정'
  const d = new Date(dt)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ScrimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('scrim_posts')
    .select('*, teams(id, name, tier_avg, captain_id, team_members(user_id, role, users(riot_gamename, riot_tagline, tier, avatar_url)))')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
  const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'

  // 내 팀이 이미 신청했는지 확인
  const { data: myTeam } = await supabase
    .from('teams')
    .select('id')
    .eq('captain_id', user.id)
    .eq('game_type', post.game_type)
    .single()

  const isMyTeam = team?.captain_id === user.id || myTeam?.id === team?.id

  const { data: existingApp } = myTeam ? await supabase
    .from('scrim_applications')
    .select('id, status')
    .eq('scrim_post_id', id)
    .eq('applying_team_id', myTeam.id)
    .single() : { data: null }

  // 신청 목록 (팀장만 볼 수 있음)
  const { data: applications } = isMyTeam ? await supabase
    .from('scrim_applications')
    .select('id, status, created_at, teams(id, name, tier_avg)')
    .eq('scrim_post_id', id)
    .order('created_at', { ascending: false }) : { data: null }

  const members = team?.team_members ?? []
  const players = members.filter((m: any) => ['captain', 'igl', 'player'].includes(m.role))
  const staff = members.filter((m: any) => ['head_coach', 'coach'].includes(m.role))

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_posts", "scrim_applications"]} />
      <Navbar />
      <div className="pt-28 max-w-4xl mx-auto px-6 py-8">
        <a href="/scrims" className="text-slate-500 text-sm hover:text-slate-300 transition inline-block mb-6">← 스크림 목록</a>

        {/* 포스트 헤더 */}
        <div className="bg-[#13131f] border border-white/5 rounded p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: gc, background: gc + '22' }}>
                  {GAME_LABEL[post.game_type] ?? post.game_type}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${post.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {post.status === 'open' ? '모집 중' : '마감'}
                </span>
              </div>
              <h1 className="text-white font-black text-2xl mb-1">{team?.name ?? '?'}</h1>
              {team?.tier_avg && <p className="text-slate-400 text-sm">Avg. {team.tier_avg}</p>}
            </div>
            {!isMyTeam && post.status === 'open' && (
              <ScrimApplyButton
                scrimPostId={id}
                myTeamId={myTeam?.id ?? null}
                existingStatus={existingApp?.status ?? null}
                gameType={post.game_type}
              />
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block text-xs mb-1">희망 일정</span>
              <span className="text-white font-semibold">{formatDate(post.preferred_date)}</span>
            </div>
            {post.note && (
              <div>
                <span className="text-slate-500 block text-xs mb-1">한마디</span>
                <span className="text-white">{post.note}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 로스터 */}
          <div className="md:col-span-2">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">로스터</h2>
            {players.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {players.map((m: any) => {
                  const u = m.users
                  return (
                    <div key={m.user_id} className="bg-[#13131f] border border-white/5 rounded p-3 flex flex-col items-center gap-2 text-center">
                      {u?.avatar_url ? (
                        <img src={u.avatar_url} className="w-12 h-12 rounded object-cover" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black">
                          {u?.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <p className="text-white text-xs font-bold">{u?.riot_gamename ?? '?'}</p>
                      {u?.tier && <p className="text-slate-500 text-xs">{u.tier}</p>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-[#13131f] border border-white/5 rounded p-6 text-center text-slate-600 text-sm mb-4">
                아직 선수가 없어요
              </div>
            )}
            {staff.length > 0 && (
              <>
                <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-3">Coaching Staff</h3>
                <div className="grid grid-cols-2 gap-3">
                  {staff.map((m: any) => {
                    const u = m.users
                    return (
                      <div key={m.user_id} className="bg-[#13131f] border border-white/5 rounded p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black shrink-0">
                          {u?.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-white text-xs font-bold">{u?.riot_gamename ?? '?'}</p>
                          <p className="text-slate-500 text-xs">{m.role === 'head_coach' ? 'Head Coach' : 'Coach'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* 신청 목록 (팀장만) */}
          {isMyTeam && (
            <div>
              <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
                Applications {applications && applications.length > 0 && (
                  <span className="ml-2 bg-[#00D2BE] text-black text-xs font-black px-2 py-0.5 rounded-full">{applications.length}</span>
                )}
              </h2>
              {!applications || applications.length === 0 ? (
                <div className="bg-[#13131f] border border-white/5 rounded p-6 text-center text-slate-600 text-sm">
                  아직 신청이 없어요
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {applications.map((app: any) => {
                    const t = Array.isArray(app.teams) ? app.teams[0] : app.teams
                    return (
                      <div key={app.id} className="bg-[#13131f] border border-white/5 rounded p-4">
                        <p className="text-white font-semibold text-sm">{t?.name ?? '?'}</p>
                        {t?.tier_avg && <p className="text-slate-500 text-xs">Avg. {t.tier_avg}</p>}
                        <span className={`mt-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {app.status === 'pending' ? '대기 중' : app.status === 'accepted' ? '수락됨' : '거절됨'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
