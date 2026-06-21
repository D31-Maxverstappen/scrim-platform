export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminUserDetailClient from './AdminUserDetailClient'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: user } = await admin
    .from('users')
    .select('id, riot_gamename, val_gamename, val_tier, tier, avatar_url, created_at, suspended, suspended_at, is_admin, country')
    .eq('id', id)
    .single()

  if (!user) notFound()

  const { data: team } = await admin
    .from('team_members')
    .select('team_id, role, teams(id, name, game_type)')
    .eq('user_id', id)
    .maybeSingle()

  const { data: reports } = await admin
    .from('reports')
    .select('id, reason, status, created_at')
    .eq('target_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/users" className="text-slate-600 hover:text-slate-400 text-xs transition">← 유저 관리</Link>
        <span className="text-slate-700 text-xs">/</span>
        <span className="text-xs text-white">{user.val_gamename ?? user.riot_gamename ?? '(미등록)'}</span>
      </div>
      <AdminUserDetailClient user={user} team={team} reports={reports ?? []} />
    </div>
  )
}
