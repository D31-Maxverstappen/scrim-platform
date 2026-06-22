import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import Pagination from '@/components/Pagination'
import { inTierRange } from '@/lib/tiers'

const PAGE_SIZE = 15

function formatDate(dt: string | null) {
  if (!dt) return null
  const d = new Date(dt)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ValorantScrimsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; my_tier?: string; page?: string }>
}) {
  const { q = '', my_tier = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 내 팀 티어 조회
  const { data: myTeam } = await supabase
    .from('teams')
    .select('tier_avg')
    .eq('captain_id', user.id)
    .eq('game_type', 'valorant')
    .single()

  const myTier = myTeam?.tier_avg ?? null
  const filterByTier = my_tier === '1'

  let posts: any[] = []
  let total = 0

  if (q) {
    const { data: matched } = await supabase.from('teams').select('id').ilike('name', `%${q}%`)
    const teamIds = matched?.map((t: any) => t.id) ?? []
    if (teamIds.length > 0) {
      const { data, count } = await supabase
        .from('scrim_posts')
        .select('id, game_type, preferred_date, note, status, format, tier_min, tier_max, created_at, teams(id, name, tier_avg)', { count: 'exact' })
        .eq('status', 'open').eq('game_type', 'valorant').in('team_id', teamIds)
        .order('created_at', { ascending: false })
        .range(from, to)
      posts = data ?? []
      total = count ?? 0
    }
  } else {
    const { data, count } = await supabase
      .from('scrim_posts')
      .select('id, game_type, preferred_date, note, status, format, tier_min, tier_max, created_at, teams(id, name, tier_avg)', { count: 'exact' })
      .eq('status', 'open').eq('game_type', 'valorant')
      .order('created_at', { ascending: false })
      .range(from, to)
    posts = data ?? []
    total = count ?? 0
  }

  // 내 티어 맞춤 필터 (페이지 내에서만 적용)
  if (filterByTier && myTier) {
    posts = posts.filter((p) => inTierRange(myTier, p.tier_min, p.tier_max))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_posts"]} />
      <Navbar />
      <div className="pt-28 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
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

        {/* 필터 바 */}
        <div className="flex items-center gap-3 mb-5">
          <form method="GET" className="flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="팀 이름 검색..."
              className="w-full bg-[#13131f] border border-white/10 rounded px-4 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#ff4655]/50 transition"
            />
            {my_tier && <input type="hidden" name="my_tier" value={my_tier} />}
          </form>
          {myTier && (
            <Link
              href={filterByTier ? `/valorant/scrims${q ? `?q=${q}` : ''}` : `/valorant/scrims?my_tier=1${q ? `&q=${q}` : ''}`}
              className={`shrink-0 px-4 py-2 rounded text-xs font-bold transition ${
                filterByTier
                  ? 'bg-[#ff4655] text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}>
              내 티어 맞춤 ({myTier})
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center text-slate-500 py-24 bg-[#13131f] border border-white/5 rounded">
            <p className="text-3xl mb-4">🎮</p>
            {q ? (
              <>
                <p className="font-semibold">"{q}" 조건에 맞는 스크림이 없어요</p>
                <p className="text-sm mt-1">다른 팀 이름으로 검색해보세요</p>
              </>
            ) : filterByTier ? (
              <>
                <p className="font-semibold">내 티어에 맞는 스크림이 없어요</p>
                <p className="text-sm mt-1">
                  <Link href="/valorant/scrims" className="text-[#ff4655] hover:underline">전체 공고 보기</Link>
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">현재 모집 중인 발로란트 스크림이 없어요</p>
                <p className="text-sm mt-1">첫 번째로 스크림을 올려보세요!</p>
                <a href="/scrims/post" className="mt-6 inline-block bg-[#ff4655]/20 hover:bg-[#ff4655]/30 text-[#ff4655] text-sm px-5 py-2.5 rounded transition">
                  + 스크림 올리기
                </a>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post: any) => {
              const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
              const tierOk = inTierRange(myTier, post.tier_min, post.tier_max)
              const hasTierCondition = post.tier_min || post.tier_max
              return (
                <a key={post.id} href={`/scrims/${post.id}`}
                  className={`bg-[#13131f] border rounded px-6 py-4 flex items-center gap-4 transition group ${
                    tierOk
                      ? 'border-white/5 hover:border-[#ff4655]/40'
                      : 'border-white/5 opacity-50 hover:opacity-70'
                  }`}>
                  <div className="w-2 h-12 rounded-full shrink-0 bg-[#ff4655]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-bold text-sm group-hover:text-[#ff4655] transition">
                        {team?.name ?? '—'}
                      </span>
                      {team?.tier_avg && <span className="text-slate-500 text-xs">· {team.tier_avg}</span>}
                      {post.format && (
                        <span className="text-[10px] font-black bg-[#ff4655]/10 text-[#ff4655] px-1.5 py-0.5 rounded">{post.format}</span>
                      )}
                      {hasTierCondition && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          tierOk ? 'bg-white/5 text-slate-500' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {post.tier_min && post.tier_max
                            ? `${post.tier_min} ~ ${post.tier_max}`
                            : post.tier_min
                            ? `${post.tier_min} 이상`
                            : `${post.tier_max} 이하`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {post.preferred_date && <span>📅 {formatDate(post.preferred_date)}</span>}
                      {post.note && <span className="truncate max-w-[240px]">{post.note}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[#ff4655] text-xs font-bold">신청 →</span>
                    {!tierOk && myTier && (
                      <span className="text-red-400 text-[10px]">티어 미달</span>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        )}
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          basePath="/valorant/scrims"
          params={{ ...(q && { q }), ...(my_tier && { my_tier }) }}
        />
      </div>
    </div>
  )
}
