export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import RecruitBoard from '@/components/scrim/RecruitBoard'
import Pagination from '@/components/common/Pagination'

const PAGE_SIZE = 20

export default async function RecruitPage({ searchParams }: { searchParams: Promise<{ type?: string; tier?: string; role?: string; page?: string }> }) {
  const { type = 'lft', tier = '', role = '', page: pageStr = '1' } = await searchParams
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
    .select('*, users(id, riot_gamename, val_gamename, val_tier, tier, avatar_url, account_type), teams(id, name, tier_avg, game_type, captain_id)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  // '선수·코치 구하기' 탭(lfp)은 팀의 선수모집(lfp)+코치모집(lfc)을 함께 노출
  query = type === 'lfp' ? (query as any).in('type', ['lfp', 'lfc']) : (query as any).eq('type', type)

  if (tier) query = (query as any).ilike('tier', `%${tier}%`)
  if (role) query = (query as any).contains('roles', [role])

  const [{ data: posts, count }, { data: myMember }, { data: meRow }] = await Promise.all([
    query,
    supabase.from('team_members').select('team_id').eq('user_id', user.id).limit(1).maybeSingle(),
    supabase.from('users').select('account_type').eq('id', user.id).maybeSingle(),
  ])
  const myTeam = myMember
  const currentUserAccountType = meRow?.account_type ?? 'player'

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-white font-black text-2xl">모집 게시판</h1>
          <p className="text-slate-500 text-sm mt-1">팀을 찾거나 선수를 모집하세요</p>
        </div>

        <RecruitBoard
          posts={posts ?? []}
          currentUserId={user.id}
          currentUserHasTeam={!!myTeam}
          currentUserAccountType={currentUserAccountType}
          activeType={type}
          activeTier={tier}
          activeRole={role}
        />
        <Pagination
          page={page}
          total={count ?? 0}
          pageSize={PAGE_SIZE}
          basePath="/recruit"
          params={{ type, ...(tier && { tier }), ...(role && { role }) }}
        />
      </div>
    </div>
  )
}
