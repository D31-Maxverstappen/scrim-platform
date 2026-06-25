import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import ScrimsClient from './ScrimsClient'

const PAGE_SIZE = 15

export default async function ValorantScrimsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myTeam } = await supabase
    .from('teams')
    .select('tier_avg')
    .eq('captain_id', user.id)
    .eq('game_type', 'valorant')
    .single()

  const myTier = myTeam?.tier_avg ?? null

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

  const { data: bms } = await supabase
    .from('bookmarks')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'scrim_post')
  const bookmarkedIds = (bms ?? []).map((b: any) => b.target_id)

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_posts"]} />
      <Sidebar />
      <div className="pt-6 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-black text-[#ff4655] uppercase tracking-widest">VALORANT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">스크림 게시판</h1>
            <p className="text-slate-400 text-sm mt-1">발로란트 스크림 상대를 구해보세요</p>
          </div>
          <Link href="/scrims/post" className="bg-[#00D2BE] hover:bg-[#00a896] text-white px-4 py-2 rounded text-sm font-semibold transition">
            + 스크림 올리기
          </Link>
        </div>

        <ScrimsClient
          posts={posts}
          bookmarkedIds={bookmarkedIds}
          myTier={myTier}
          q={q}
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  )
}
