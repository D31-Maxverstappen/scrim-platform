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

// 티어별 표시 색상 — 여러 컴포넌트에 중복돼 있던 동일 색상표를 한 곳으로 통합
export const TIER_COLORS: Record<string, string> = {
  Iron: '#B0C4D8', Bronze: '#A57C52', Silver: '#C0C0C0',
  Gold: '#E8B84B', Platinum: '#4FD1C5', Diamond: '#6FA8DC',
  Ascendant: '#52BE80', Immortal: '#E74C3C', Radiant: '#F8D568',
}

export function getTierColor(tier: string): string {
  return TIER_COLORS[tier.split(' ')[0]] ?? '#94a3b8'
}
