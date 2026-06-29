// 발로란트 무기 아이콘 매핑 — 무기 슬러그 → public/weapons/<slug>.png
// 아이콘 출처: Riot 공식 VALORANT 자산(Public Content Catalog / VALORANT Asset Kit).

const KNOWN = new Set(['classic', 'ghost', 'sheriff', 'spectre', 'vandal', 'phantom', 'bulldog'])

// 무기 슬러그 → 아이콘 경로. 매핑 없으면 null(컴포넌트에서 미표시).
export function weaponIcon(weapon: string | null | undefined): string | null {
  if (!weapon) return null
  const s = weapon.trim().toLowerCase()
  return KNOWN.has(s) ? `/weapons/${s}.png` : null
}
