import Link from 'next/link'
import { formatKST } from '@/lib/datetime'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RealtimeRefresher from '@/components/common/RealtimeRefresher'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655' }

function formatDate(dt: string | null) {
  if (!dt) return '미정'
  return formatKST(dt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:  { label: '대기 중', cls: 'bg-yellow-500/15 text-yellow-400' },
  accepted: { label: '수락됨',  cls: 'bg-green-500/15 text-green-400'  },
  rejected: { label: '거절됨',  cls: 'bg-red-500/15 text-red-400'      },
}

const POST_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  open:   { label: '모집 중', cls: 'bg-green-500/15 text-green-400'  },
  closed: { label: '마감',    cls: 'bg-slate-500/15 text-slate-400'  },
}

export default async function MyScrimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myTeams } = await supabase
    .from('team_members')
    .select('teams(id, name, game_type, captain_id)')
    .eq('user_id', user.id)

  const teams = (myTeams ?? []).map((m) => Array.isArray(m.teams) ? m.teams[0] : m.teams).filter(Boolean)
  const teamIds = teams.map((t) => t.id)
  const captainTeamIds = teams.filter((t) => t.captain_id === user.id).map((t) => t.id)

  if (teamIds.length === 0) {
    return <EmptyState type="no-team" />
  }

  const [{ data: myPosts }, { data: applications }] = await Promise.all([
    // 내가 올린 스크림 (받은 스크림)
    captainTeamIds.length > 0
      ? supabase
          .from('scrim_posts')
          .select('id, game_type, preferred_date, format, server, status, team_id, teams(id, name, tier_avg), scrim_applications(id, status, teams:teams!applying_team_id(id, name, tier_avg))')
          .in('team_id', captainTeamIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    // 내가 신청한 스크림
    supabase
      .from('scrim_applications')
      .select('id, status, match_id, created_at, applying_team_id, scrim_post:scrim_posts!scrim_post_id(id, game_type, preferred_date, format, server, status, teams(id, name, tier_avg))')
      .in('applying_team_id', teamIds)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_applications", "scrim_posts"]} />
      <div className="pt-6 max-w-3xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">내 스크림</h1>
            <p className="text-slate-500 text-sm mt-1">내가 올린 스크림과 신청한 스크림을 한눈에</p>
          </div>
          <Link href="/scrims" className="text-[#00D2BE] text-xs hover:underline">스크림 게시판 →</Link>
        </div>

        <div className="flex flex-col gap-10">

          {/* ── 받은 스크림 ── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-1 h-5 rounded-full bg-[#00D2BE]" />
              <h2 className="text-white font-black text-sm uppercase tracking-widest">받은 스크림</h2>
              <span className="text-slate-600 text-xs">내 팀이 올린 스크림</span>
              {myPosts && myPosts.length > 0 && (
                <span className="ml-auto bg-[#00D2BE]/20 text-[#00D2BE] text-xs font-black px-2 py-0.5 rounded">
                  {myPosts.length}건
                </span>
              )}
            </div>

            {!myPosts || myPosts.length === 0 ? (
              <div className="bg-[#13131f] border border-white/5 rounded p-10 text-center text-slate-500">
                <p className="text-sm">올린 스크림이 없어요</p>
                <Link href="/scrims/post" className="mt-3 inline-block text-[#00D2BE] text-xs hover:underline">
                  스크림 올리기 →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myPosts.map((post) => {
                  const postTeam = Array.isArray(post.teams) ? post.teams[0] : post.teams
                  const apps = (post.scrim_applications ?? []) as any[]
                  const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
                  const ps = POST_STATUS_LABEL[post.status] ?? { label: post.status, cls: 'bg-white/5 text-slate-400' }
                  const pendingCount = apps.filter((a) => a.status === 'pending').length
                  const acceptedCount = apps.filter((a) => a.status === 'accepted').length

                  return (
                    <div key={post.id} className="bg-[#13131f] border border-[#00D2BE]/15 rounded overflow-hidden">
                      {/* 포스트 헤더 */}
                      <a href={`/scrims/${post.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition group">
                        <div className="w-1.5 h-10 rounded-none shrink-0" style={{ background: gc }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-white font-bold text-sm group-hover:text-[#00D2BE] transition truncate">
                              {postTeam?.name ?? '내 팀'}
                            </span>
                            {postTeam?.tier_avg && (
                              <span className="text-slate-500 text-xs shrink-0">· {postTeam.tier_avg}</span>
                            )}
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${ps.cls}`}>
                              {ps.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {post.format && <span className="font-bold">{post.format}</span>}
                            {post.server && (
                              <span className="bg-white/5 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-400">
                                {post.server}
                              </span>
                            )}
                            {post.preferred_date && <span>📅 {formatDate(post.preferred_date)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs">
                          {pendingCount > 0 && (
                            <span className="bg-yellow-500/20 text-yellow-400 font-bold px-2 py-0.5 rounded">
                              신청 {pendingCount}
                            </span>
                          )}
                          {acceptedCount > 0 && (
                            <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded">
                              수락 {acceptedCount}
                            </span>
                          )}
                          <span className="text-slate-700 group-hover:text-[#00D2BE] transition">→</span>
                        </div>
                      </a>

                      {/* 신청 팀 목록 */}
                      {apps.length > 0 && (
                        <div className="border-t border-white/5 divide-y divide-white/5">
                          {apps.map((a) => {
                            const at = Array.isArray(a.teams) ? a.teams[0] : a.teams
                            const as_ = STATUS_LABEL[a.status] ?? { label: a.status, cls: 'bg-white/5 text-slate-400' }
                            return (
                              <div key={a.id} className="flex items-center gap-3 px-5 py-2.5 bg-black/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                                <span className="text-slate-300 text-xs flex-1 font-semibold">
                                  {at?.name ?? '알 수 없는 팀'}
                                </span>
                                {at?.tier_avg && (
                                  <span className="text-slate-600 text-xs">{at.tier_avg}</span>
                                )}
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${as_.cls}`}>
                                  {as_.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── 신청한 스크림 ── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-1 h-5 rounded-full bg-yellow-400" />
              <h2 className="text-white font-black text-sm uppercase tracking-widest">신청한 스크림</h2>
              <span className="text-slate-600 text-xs">내가 신청 보낸 스크림</span>
              {applications && applications.length > 0 && (
                <span className="ml-auto bg-yellow-500/20 text-yellow-400 text-xs font-black px-2 py-0.5 rounded">
                  {applications.length}건
                </span>
              )}
            </div>

            {!applications || applications.length === 0 ? (
              <div className="bg-[#13131f] border border-white/5 rounded p-10 text-center text-slate-500">
                <p className="text-sm">신청한 스크림이 없어요</p>
                <Link href="/scrims" className="mt-3 inline-block text-[#00D2BE] text-xs hover:underline">
                  스크림 찾기 →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {applications.map((a) => {
                  const post = Array.isArray(a.scrim_post) ? a.scrim_post[0] : a.scrim_post
                  const postTeam = Array.isArray(post?.teams) ? post?.teams[0] : post?.teams
                  const gc = GAME_COLOR[post?.game_type ?? ''] ?? '#00D2BE'
                  const s = STATUS_LABEL[a.status ?? ''] ?? { label: a.status, cls: 'bg-white/5 text-slate-400' }

                  return (
                    <a
                      key={a.id}
                      href={a.status === 'accepted' && a.match_id ? `/matches/${a.match_id}` : `/scrims/${post?.id}`}
                      className="bg-[#13131f] border border-yellow-500/10 hover:border-yellow-500/20 rounded px-5 py-4 flex items-center gap-4 transition group"
                    >
                      <div className="w-1.5 h-10 rounded-none shrink-0" style={{ background: gc }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white font-bold text-sm group-hover:text-[#00D2BE] transition truncate">
                            {postTeam?.name ?? '알 수 없는 팀'}
                          </span>
                          {postTeam?.tier_avg && (
                            <span className="text-slate-500 text-xs shrink-0">· {postTeam.tier_avg}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {post?.format && <span className="font-bold">{post.format}</span>}
                          {post?.server && (
                            <span className="bg-white/5 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-400">
                              {post.server}
                            </span>
                          )}
                          {post?.preferred_date && <span>📅 {formatDate(post.preferred_date)}</span>}
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded shrink-0 ${s.cls}`}>
                        {s.label}
                      </span>
                      <span className="text-slate-700 text-xs group-hover:text-slate-500 transition">→</span>
                    </a>
                  )
                })}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-3xl mx-auto px-6 py-8 text-center text-slate-500">
        <p className="text-sm">팀에 소속되어 있지 않아요</p>
        <Link href="/teams/create" className="mt-4 inline-block text-[#00D2BE] text-xs hover:underline">
          팀 만들기 →
        </Link>
      </div>
    </div>
  )
}
