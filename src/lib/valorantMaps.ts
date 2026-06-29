// 발로란트 맵 썸네일 매핑 — 한글 맵명 → public/maps/<slug>.png
// 아이콘 출처: Riot 공식 VALORANT 자산(Public Content Catalog / VALORANT Asset Kit).

// 한글 맵명 → 슬러그. 영문명('Ascent')은 소문자화로 바로 매칭되므로 별도 매핑 불필요.
const MAP_SLUG: Record<string, string> = {
  어센트: 'ascent', 바인드: 'bind', 헤이븐: 'haven', 스플릿: 'split',
  로터스: 'lotus', 선셋: 'sunset', 어비스: 'abyss', 아이스박스: 'icebox',
  브리즈: 'breeze', 프랙처: 'fracture', 펄: 'pearl', 커로드: 'corrode',
}

const KNOWN = new Set(Object.values(MAP_SLUG))

// 맵명(한글·영문 모두) → 썸네일 경로. 매핑 없으면 null(컴포넌트에서 미표시).
export function mapIcon(map: string | null | undefined): string | null {
  if (!map) return null
  const raw = map.trim()
  const slug = MAP_SLUG[raw] ?? raw.toLowerCase().replace(/\s+/g, '')
  return KNOWN.has(slug) ? `/maps/${slug}.png` : null
}
