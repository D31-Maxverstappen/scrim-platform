export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RealtimeRefresher from '@/components/common/RealtimeRefresher'
import Pagination from '@/components/common/Pagination'
import UserDirectory from '@/components/user/UserDirectory'

const PAGE_SIZE = 20

export default async function ValorantPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: users, count: total } = await supabase
    .from('users')
    .select('id, val_gamename, riot_gamename, val_tier, tier, avatar_url, account_type', { count: 'exact' })
    .or('account_type.is.null,account_type.eq.player')
    .not('is_admin', 'is', true)  // admin(운영) 계정 제외 — null·false는 포함
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["users"]} />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-white font-bold text-xl mb-1">선수 목록</h1>
        <p className="text-slate-500 text-sm mb-6">D31에서 활동하는 선수들을 둘러보세요</p>
        <UserDirectory users={users ?? []} variant="player" />
        <Pagination page={page} total={total ?? 0} pageSize={PAGE_SIZE} basePath="/valorant/players" />
      </div>
    </div>
  )
}
