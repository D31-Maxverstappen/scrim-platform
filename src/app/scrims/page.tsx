import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

const GAMES = [
  { value: '', label: '전체' },
  { value: 'valorant', label: 'VALORANT' },
  { value: 'lol', label: '리그 오브 레전드' },
]

const GAME_COLOR: Record<string, string> = {
  valorant: '#ff4655', lol: '#c89b3c',
}

function formatDate(dt: string | null) {
  if (!dt) return null
  const d = new Date(dt)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ScrimsPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game = '' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('scrim_posts')
    .select('id, game_type, preferred_date, note, status, created_at, teams(id, name, tier_avg)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (game) query = query.eq('game_type', game)

  const { data: posts } = await query

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">스크림 게시판</h1>
            <p className="text-slate-400 text-sm mt-1">팀을 만들고 스크림 상대를 구해보세요</p>
          </div>
          <a href="/scrims/post" className="bg-[#00D2BE] hover:bg-[#00a896] text-white px-4 py-2 rounded text-sm font-semibold transition">
            + 스크림 올리기
          </a>
        </div>

        {/* 게임 필터 */}
        <div className="flex gap-2 mb-6">
          {GAMES.map((g) => (
            <a
              key={g.value}
              href={g.value ? `/scrims?game=${g.value}` : '/scrims'}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${
                game === g.value ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {g.label}
            </a>
          ))}
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center text-slate-500 py-24 bg-[#13131f] border border-white/5 rounded">
            <p className="text-3xl mb-4">🎮</p>
            <p className="font-semibold">현재 모집 중인 스크림이 없어요</p>
            <p className="text-sm mt-1">첫 번째로 스크림을 올려보세요!</p>
            <a href="/scrims/post" className="mt-6 inline-block bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 text-[#00D2BE] text-sm px-5 py-2.5 rounded transition">
              + 스크림 올리기
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post: any) => {
              const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
              const gc = GAME_COLOR[post.game_type] ?? '#00D2BE'
              return (
                <a key={post.id} href={`/scrims/${post.id}`}
                  className="bg-[#13131f] border border-white/5 hover:border-[#00D2BE]/30 rounded px-6 py-4 flex items-center gap-4 transition group">
                  {/* 게임 배지 */}
                  <div className="w-2 h-12 rounded-full shrink-0" style={{ background: gc }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm group-hover:text-[#00D2BE] transition">
                        {team?.name ?? '알 수 없는 팀'}
                      </span>
                      {team?.tier_avg && (
                        <span className="text-slate-500 text-xs">· {team.tier_avg}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold" style={{ color: gc }}>
                        {post.game_type === 'valorant' ? 'VALORANT' : 'League of Legends'}
                      </span>
                      {post.preferred_date && (
                        <span>📅 {formatDate(post.preferred_date)}</span>
                      )}
                      {post.note && (
                        <span className="truncate max-w-[200px]">{post.note}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[#00D2BE] text-xs font-bold shrink-0">신청하기 →</span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
