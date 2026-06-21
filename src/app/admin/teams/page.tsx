export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminTeamsClient from './AdminTeamsClient'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminTeamsPage() {
  const { data: teams } = await admin
    .from('teams')
    .select('id, name, abbreviation, game_type, tier_avg, wins, losses, created_at, captain_id, users!captain_id(riot_gamename, val_gamename)')
    .order('created_at', { ascending: false })
    .limit(100)

  const teamIds = (teams ?? []).map((t: any) => t.id)
  const { data: memberCounts } = teamIds.length
    ? await admin.from('team_members').select('team_id').in('team_id', teamIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  ;(memberCounts ?? []).forEach((m: any) => { countMap[m.team_id] = (countMap[m.team_id] ?? 0) + 1 })

  const enriched = (teams ?? []).map((t: any) => ({
    ...t,
    captain: Array.isArray(t.users) ? t.users[0] : t.users,
    member_count: countMap[t.id] ?? 0,
  }))

  return <AdminTeamsClient teams={enriched} />
}
