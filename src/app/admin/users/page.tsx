export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminUsersClient from './AdminUsersClient'
import Pagination from '@/components/Pagination'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PAGE_SIZE = 20

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const { search, page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = admin.from('users')
    .select('id, riot_gamename, val_gamename, val_tier, tier, avatar_url, created_at, suspended, suspended_at, is_admin, country', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) query = query.ilike('riot_gamename', `%${search}%`)

  const { data: users, count } = await query

  return (
    <div className="flex-1 flex flex-col">
      <AdminUsersClient users={users ?? []} initialSearch={search ?? ''} />
      <div className="px-8 pb-8">
        <Pagination page={page} total={count ?? 0} pageSize={PAGE_SIZE} basePath="/admin/users" params={search ? { search } : {}} />
      </div>
    </div>
  )
}
