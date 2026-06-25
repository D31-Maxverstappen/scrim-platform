export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminTeamsClient from './AdminTeamsClient'
import Pagination from '@/components/common/Pagination'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PAGE_SIZE = 20

export default async function AdminTeamsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr = '1' } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: teams, count } = await admin
    .from('teams')
    .select('id, name, abbreviation, game_type, tier_avg, wins, losses, created_at, captain_id, users!captain_id(riot_gamename, val_gamename)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const teamIds = (teams ?? []).map((t) => t.id)
  const { data: memberCounts } = teamIds.length
    ? await admin.from('team_members').select('team_id').in('team_id', teamIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  ;(memberCounts ?? []).forEach((m) => { countMap[m.team_id] = (countMap[m.team_id] ?? 0) + 1 })

  const enriched = (teams ?? []).map((t) => ({
    ...t,
    captain: Array.isArray(t.users) ? t.users[0] : t.users,
    member_count: countMap[t.id] ?? 0,
  }))

  return (
    <div className="flex-1 flex flex-col">
      <AdminTeamsClient teams={enriched} />
      <div className="px-8 pb-8">
        <Pagination page={page} total={count ?? 0} pageSize={PAGE_SIZE} basePath="/admin/teams" />
      </div>
    </div>
  )
}
