// 발로란트 맵 썸네일 매핑 — 한글 맵명 → public/maps/<slug>.png
// 아이콘 출처: Riot 공식 VALORANT 자산(Public Content Catalog / VALORANT Asset Kit).

// 한글 맵명 → 슬러그. 영문명('Ascent')은 소문자화로 바로 매칭되므로 별도 매핑 불필요.
const MAP_SLUG: Record<string, string> = {
  어센트: 'ascent', 바인드: 'bind', 헤이븐: 'haven', 스플릿: 'split',
  로터스: 'lotus', 선셋: 'sunset', 어비스: 'abyss', 아이스박스: 'icebox',
  브리즈: 'breeze', 프랙처: 'fracture', 펄: 'pearl', 코로드: 'corrode',
  서밋: 'summit',
}

const KNOWN = new Set(Object.values(MAP_SLUG))

// 맵명(한글·영문 모두) → 슬러그. 매핑 없으면 null.
function resolveSlug(map: string | null | undefined): string | null {
  if (!map) return null
  const raw = map.trim()
  const slug = MAP_SLUG[raw] ?? raw.toLowerCase().replace(/\s+/g, '')
  return KNOWN.has(slug) ? slug : null
}

// 맵명(한글·영문) → 슬러그. 스킬 범위 픽셀 변환(MAP_SCALE) 등에서 사용. 매핑 없으면 null.
export function mapSlug(map: string | null | undefined): string | null {
  return resolveSlug(map)
}

// 목록·헤더용 썸네일(listViewIcon). 매핑 없으면 null(컴포넌트에서 미표시).
export function mapIcon(map: string | null | undefined): string | null {
  const s = resolveSlug(map)
  return s ? `/maps/${s}.png` : null
}

// 작전판 배경용 탑뷰 미니맵(displayIcon). 매핑 없으면 null.
export function minimapIcon(map: string | null | undefined): string | null {
  const s = resolveSlug(map)
  return s ? `/minimaps/${s}.png` : null
}
