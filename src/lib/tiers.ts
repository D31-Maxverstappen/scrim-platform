export const VAL_TIERS = [
  'Iron 1', 'Iron 2', 'Iron 3',
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3',
  'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
  'Immortal 1', 'Immortal 2', 'Immortal 3',
  'Radiant',
]

export function tierIndex(tier: string | null | undefined): number {
  if (!tier) return -1
  return VAL_TIERS.indexOf(tier)
}

export function inTierRange(
  teamTier: string | null | undefined,
  tierMin: string | null | undefined,
  tierMax: string | null | undefined,
): boolean {
  if (!tierMin && !tierMax) return true
  const idx = tierIndex(teamTier)
  if (idx === -1) return true
  const minIdx = tierIndex(tierMin)
  const maxIdx = tierIndex(tierMax)
  if (minIdx !== -1 && idx < minIdx) return false
  if (maxIdx !== -1 && idx > maxIdx) return false
  return true
}
