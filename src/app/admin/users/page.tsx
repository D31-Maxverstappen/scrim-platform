export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminUsersClient from './AdminUsersClient'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams

  let query = admin.from('users')
    .select('id, riot_gamename, val_gamename, val_tier, tier, avatar_url, created_at, suspended, suspended_at, is_admin, country')
    .order('created_at', { ascending: false })
    .limit(50)

  if (search) query = query.ilike('riot_gamename', `%${search}%`)

  const { data: users } = await query

  return <AdminUsersClient users={users ?? []} initialSearch={search ?? ''} />
}
