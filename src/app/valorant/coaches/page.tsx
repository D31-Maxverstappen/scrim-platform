export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RealtimeRefresher from '@/components/common/RealtimeRefresher'
import Pagination from '@/components/common/Pagination'
import UserDirectory from '@/components/user/UserDirectory'

const PAGE_SIZE = 20

export default async function ValorantCoachesPage({
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
    .eq('account_type', 'coach')
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["users"]} />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-white font-bold text-xl mb-1">코치 목록</h1>
        <p className="text-slate-500 text-sm mb-6">팀을 이끌어줄 코치를 찾아보세요</p>
        <UserDirectory users={users ?? []} variant="coach" />
        <Pagination page={page} total={total ?? 0} pageSize={PAGE_SIZE} basePath="/valorant/coaches" />
      </div>
    </div>
  )
}
