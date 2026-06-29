// 발로란트 랭크 엠블럼 — 티어명("Diamond 2") → public/ranks/<slug>.png
// 아이콘 출처: Riot 공식 VALORANT 자산(Public Content Catalog / VALORANT Asset Kit).

const KNOWN = new Set([
  'iron1', 'iron2', 'iron3', 'bronze1', 'bronze2', 'bronze3',
  'silver1', 'silver2', 'silver3', 'gold1', 'gold2', 'gold3',
  'platinum1', 'platinum2', 'platinum3', 'diamond1', 'diamond2', 'diamond3',
  'ascendant1', 'ascendant2', 'ascendant3', 'immortal1', 'immortal2', 'immortal3', 'radiant',
])

// 티어 문자열 → 엠블럼 경로. 매핑 안 되면 null(아이콘 미표시).
// 'Diamond 2', 'diamond 2', 'Radiant' 등 허용. 범위/평균도 단일 티어면 매칭.
export function rankIcon(tier: string | null | undefined): string | null {
  if (!tier) return null
  const slug = tier.trim().toLowerCase().replace(/\s+/g, '')
  return KNOWN.has(slug) ? `/ranks/${slug}.png` : null
}
