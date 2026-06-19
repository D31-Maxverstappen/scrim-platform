import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RealtimeRefresher from '@/components/RealtimeRefresher'

function formatDate(dt: string | null) {
  if (!dt) return null
  const d = new Date(dt)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ValorantScrimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('scrim_posts')
    .select('id, game_type, preferred_date, note, status, format, created_at, teams(id, name, tier_avg)')
    .eq('status', 'open')
    .eq('game_type', 'valorant')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_posts"]} />
      <Navbar />
      <div className="pt-28 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-black text-[#ff4655] uppercase tracking-widest">VALORANT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">스크림 게시판</h1>
            <p className="text-slate-400 text-sm mt-1">발로란트 스크림 상대를 구해보세요</p>
          </div>
          <a href="/scrims/post" className="bg-[#ff4655] hover:bg-[#e03040] text-white px-4 py-2 rounded text-sm font-semibold transition">
            + 스크림 올리기
          </a>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center text-slate-500 py-24 bg-[#13131f] border border-white/5 rounded">
            <p className="text-3xl mb-4">🎮</p>
            <p className="font-semibold">현재 모집 중인 발로란트 스크림이 없어요</p>
            <p className="text-sm mt-1">첫 번째로 스크림을 올려보세요!</p>
            <a href="/scrims/post" className="mt-6 inline-block bg-[#ff4655]/20 hover:bg-[#ff4655]/30 text-[#ff4655] text-sm px-5 py-2.5 rounded transition">
              + 스크림 올리기
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post: any) => {
              const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
              return (
                <a key={post.id} href={`/scrims/${post.id}`}
                  className="bg-[#13131f] border border-white/5 hover:border-[#ff4655]/40 rounded px-6 py-4 flex items-center gap-4 transition group">
                  <div className="w-2 h-12 rounded-full shrink-0 bg-[#ff4655]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm group-hover:text-[#ff4655] transition">
                        {team?.name ?? '알 수 없는 팀'}
                      </span>
                      {team?.tier_avg && <span className="text-slate-500 text-xs">· {team.tier_avg}</span>}
                      {post.format && (
                        <span className="text-[10px] font-black bg-[#ff4655]/10 text-[#ff4655] px-1.5 py-0.5 rounded">{post.format}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {post.preferred_date && <span>📅 {formatDate(post.preferred_date)}</span>}
                      {post.note && <span className="truncate max-w-[240px]">{post.note}</span>}
                    </div>
                  </div>
                  <span className="text-[#ff4655] text-xs font-bold shrink-0">신청하기 →</span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
