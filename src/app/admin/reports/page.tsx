export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminReportsClient from './AdminReportsClient'
import Pagination from '@/components/common/Pagination'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PAGE_SIZE = 20

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: reports, count } = await admin
    .from('reports')
    .select('id, target_type, target_id, reason, status, action, created_at, reporter:users!reporter_id(riot_gamename, val_gamename)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <div className="flex-1 flex flex-col">
      <AdminReportsClient reports={reports ?? []} />
      <div className="px-8 pb-8">
        <Pagination page={page} total={count ?? 0} pageSize={PAGE_SIZE} basePath="/admin/reports" />
      </div>
    </div>
  )
}
