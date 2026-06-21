export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminReportsClient from './AdminReportsClient'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminReportsPage() {
  const { data: reports } = await admin
    .from('reports')
    .select('id, target_type, target_id, reason, status, action, created_at, reporter:users!reporter_id(riot_gamename, val_gamename)')
    .order('created_at', { ascending: false })
    .limit(100)

  return <AdminReportsClient reports={reports ?? []} />
}
