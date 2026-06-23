import type { SupabaseClient } from '@supabase/supabase-js'

type TeamMemberTierRow = {
  role: string
  users: { val_tier: string | null; tier: string | null; game_type: string | null } | null
}

export const TIER_LIST = [
  'Iron 3', 'Iron 2', 'Iron 1',
  'Bronze 3', 'Bronze 2', 'Bronze 1',
  'Silver 3', 'Silver 2', 'Silver 1',
  'Gold 3', 'Gold 2', 'Gold 1',
  'Platinum 3', 'Platinum 2', 'Platinum 1',
  'Diamond 3', 'Diamond 2', 'Diamond 1',
  'Ascendant 3', 'Ascendant 2', 'Ascendant 1',
  'Immortal 3', 'Immortal 2', 'Immortal 1',
  'Radiant',
] as const

export type TierName = typeof TIER_LIST[number]

function tierScore(tier: string | null | undefined): number | null {
  if (!tier) return null
  const cleaned = tier.trim()

  const exact = (TIER_LIST as readonly string[]).indexOf(cleaned)
  if (exact !== -1) return exact + 1

  // 하위 호환: "Platinum" → "Platinum 2" (중간 값)
  const base = cleaned.split(' ')[0]
  const mid = (TIER_LIST as readonly string[]).findIndex(t => t === `${base} 2`)
  if (mid !== -1) return mid + 1

  if (cleaned === 'Radiant') return 25
  return null
}

function scoreToTier(score: number): string {
  const idx = Math.max(0, Math.min(TIER_LIST.length - 1, Math.round(score) - 1))
  return TIER_LIST[idx]
}

export async function recalcTierAvg(supabase: SupabaseClient, teamId: string) {
  const { data: members } = await supabase
    .from('team_members')
    .select('users(val_tier, tier, game_type), role')
    .eq('team_id', teamId)

  const scores: number[] = ((members ?? []) as TeamMemberTierRow[])
    .filter((m) => !['head_coach', 'coach'].includes(m.role))
    .map((m) => {
      const u = m.users
      const t = u?.val_tier ?? u?.tier ?? null
      return tierScore(t)
    })
    .filter((s: number | null): s is number => s !== null)

  if (scores.length === 0) {
    await supabase.from('teams').update({ tier_avg: null }).eq('id', teamId)
    return
  }

  const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
  await supabase.from('teams').update({ tier_avg: scoreToTier(avg) }).eq('id', teamId)
}
