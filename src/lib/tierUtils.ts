const TIER_SCORE: Record<string, number> = {
  Iron: 1, Bronze: 2, Silver: 3, Gold: 4, Platinum: 5,
  Emerald: 6, Ascendant: 6, Diamond: 7,
  Master: 8, Immortal: 8, Grandmaster: 9,
  Challenger: 10, Radiant: 10,
}

const SCORE_TO_TIER: [number, string][] = [
  [10, 'Radiant'], [9, 'Grandmaster'], [8, 'Master'],
  [7, 'Diamond'], [6, 'Emerald'], [5, 'Platinum'],
  [4, 'Gold'], [3, 'Silver'], [2, 'Bronze'], [1, 'Iron'],
]

function tierScore(tier: string | null | undefined): number | null {
  if (!tier) return null
  const base = tier.split(' ')[0]
  return TIER_SCORE[base] ?? null
}

function scoreToTier(score: number): string {
  for (const [threshold, name] of SCORE_TO_TIER) {
    if (score >= threshold) return name
  }
  return 'Iron'
}

export async function recalcTierAvg(supabase: any, teamId: string) {
  const { data: members } = await supabase
    .from('team_members')
    .select('users(val_tier, lol_tier, tier, game_type), role')
    .eq('team_id', teamId)

  const { data: team } = await supabase
    .from('teams')
    .select('game_type')
    .eq('id', teamId)
    .single()

  const isVal = team?.game_type === 'valorant'

  const scores: number[] = (members ?? [])
    .filter((m: any) => !['head_coach', 'coach'].includes(m.role))
    .map((m: any) => {
      const u = m.users
      const t = isVal
        ? (u?.val_tier ?? u?.tier ?? null)
        : (u?.lol_tier ?? u?.tier ?? null)
      return tierScore(t)
    })
    .filter((s: number | null): s is number => s !== null)

  if (scores.length === 0) {
    await supabase.from('teams').update({ tier_avg: null }).eq('id', teamId)
    return
  }

  const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
  const tierAvg = scoreToTier(Math.round(avg))

  await supabase.from('teams').update({ tier_avg: tierAvg }).eq('id', teamId)
}
