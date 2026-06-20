import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RealtimeRefresher from '@/components/RealtimeRefresher'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }

function formatDate(dt: string | null) {
  if (!dt) return '미정'
  return new Date(dt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:  { label: '대기 중',  cls: 'bg-yellow-500/15 text-yellow-400' },
  accepted: { label: '수락됨',   cls: 'bg-green-500/15 text-green-400'  },
  rejected: { label: '거절됨',   cls: 'bg-red-500/15 text-red-400'      },
}

export default async function AppliedScrimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 내 팀 찾기
  const { data: myTeams } = await supabase
    .from('team_members')
    .select('teams(id, name, game_type, captain_id)')
    .eq('user_id', user.id)

  const teams = (myTeams ?? []).map((m: any) => Array.isArray(m.teams) ? m.teams[0] : m.teams).filter(Boolean)
  const teamIds = teams.map((t: any) => t.id)

  if (teamIds.length === 0) {
    return renderPage([], null)
  }

  const { data: applications } = await supabase
    .from('scrim_applications')
    .select('id, status, match_id, created_at, applying_team_id, scrim_post:scrim_posts!scrim_post_id(id, game_type, preferred_date, format, server, status, teams(id, name, tier_avg))')
    .in('applying_team_id', teamIds)
    .order('created_at', { ascending: false })

  return renderPage(applications ?? [], teams)
}

function renderPage(applications: any[], teams: any[] | null) {
  const pending  = applications.filter((a) => a.status === 'pending')
  const resolved = applications.filter((a) => a.status !== 'pending')

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_applications"]} />
      <Navbar />
      <div className="pt-28 max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">내가 신청한 스크림</h1>
            <p className="text-slate-400 text-sm mt-1">신청한 스크림의 수락/거절 현황을 확인하세요</p>
          </div>
          <a href="/scrims" className="text-[#00D2BE] text-xs hover:underline">스크림 게시판 →</a>
        </div>

        {!teams || teams.length === 0 ? (
          <div className="bg-[#13131f] border border-white/5 rounded p-12 text-center text-slate-500">
            <p className="text-sm">팀에 소속되어 있지 않아요</p>
            <a href="/teams/create" className="mt-4 inline-block text-[#00D2BE] text-xs hover:underline">팀 만들기 →</a>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-[#13131f] border border-white/5 rounded p-12 text-center text-slate-500">
            <p className="text-sm">신청한 스크림이 없어요</p>
            <a href="/scrims" className="mt-4 inline-block text-[#00D2BE] text-xs hover:underline">스크림 찾기 →</a>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 대기 중 */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  대기 중 <span className="ml-1.5 bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full text-[10px]">{pending.length}</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {pending.map((a: any) => <AppRow key={a.id} app={a} />)}
                </div>
              </section>
            )}

            {/* 완료 */}
            {resolved.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">처리 완료</h2>
                <div className="flex flex-col gap-2">
                  {resolved.map((a: any) => <AppRow key={a.id} app={a} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AppRow({ app }: { app: any }) {
  const post = Array.isArray(app.scrim_post) ? app.scrim_post[0] : app.scrim_post
  const team = Array.isArray(post?.teams) ? post?.teams[0] : post?.teams
  const gc = GAME_COLOR[post?.game_type ?? ''] ?? '#00D2BE'
  const s = STATUS_LABEL[app.status] ?? { label: app.status, cls: 'bg-white/5 text-slate-400' }

  return (
    <a
      href={app.status === 'accepted' && app.match_id ? `/matches/${app.match_id}` : `/scrims/${post?.id}`}
      className="bg-[#13131f] border border-white/5 hover:border-white/10 rounded px-5 py-4 flex items-center gap-4 transition group"
    >
      <div className="w-1.5 h-10 rounded-full shrink-0" style={{ background: gc }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white font-bold text-sm group-hover:text-[#00D2BE] transition truncate">
            {team?.name ?? '알 수 없는 팀'}
          </span>
          {team?.tier_avg && <span className="text-slate-500 text-xs shrink-0">· {team.tier_avg}</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {post?.format && <span className="font-bold">{post.format}</span>}
          {post?.server && <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">{post.server}</span>}
          {post?.preferred_date && <span>📅 {formatDate(post.preferred_date)}</span>}
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
      <span className="text-slate-700 text-xs group-hover:text-slate-500 transition">→</span>
    </a>
  )
}
