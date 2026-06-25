export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import RecruitBoard from '@/components/scrim/RecruitBoard'
import Pagination from '@/components/common/Pagination'

const PAGE_SIZE = 20

export default async function RecruitPage({ searchParams }: { searchParams: Promise<{ type?: string; game?: string; page?: string }> }) {
  const { type = 'lft', game = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  let query = admin
    .from('recruitment_posts')
    .select('*, users(id, riot_gamename, val_gamename, val_tier, tier, avatar_url), teams(id, name, tier_avg, game_type, captain_id)', { count: 'exact' })
    .eq('status', 'active')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (game) query = (query as any).eq('game_type', game)

  const [{ data: posts, count }, { data: myTeam }] = await Promise.all([
    query,
    supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single(),
  ])

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <Sidebar />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-black text-2xl">모집 게시판</h1>
            <p className="text-slate-500 text-sm mt-1">팀을 찾거나 선수를 모집하세요</p>
          </div>
          <a href="/recruit/post"
            className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-sm font-bold px-5 py-2.5 rounded transition">
            + 글 올리기
          </a>
        </div>

        <RecruitBoard
          posts={posts ?? []}
          currentUserId={user.id}
          currentUserHasTeam={!!myTeam}
          activeType={type}
          activeGame={game}
        />
        <Pagination
          page={page}
          total={count ?? 0}
          pageSize={PAGE_SIZE}
          basePath="/recruit"
          params={{ type, ...(game && { game }) }}
        />
      </div>
    </div>
  )
}
