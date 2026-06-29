// 발로란트 역할 아이콘 매핑 — 한글 역할명 → public/roles/<slug>.png
// 아이콘 출처: Riot 공식 VALORANT 자산(Public Content Catalog / VALORANT Asset Kit).

const ROLE_SLUG: Record<string, string> = {
  타격대: 'duelist', 척후대: 'initiator', 감시자: 'sentinel', 전략가: 'controller',
}

// 역할명 → 아이콘 경로. 매핑 없으면 null(컴포넌트에서 미표시).
export function roleIcon(role: string | null | undefined): string | null {
  if (!role) return null
  const slug = ROLE_SLUG[role.trim()]
  return slug ? `/roles/${slug}.png` : null
}
