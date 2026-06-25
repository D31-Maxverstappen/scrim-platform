// 사이드바 표시 여부 판단 — SidebarGate와 Footer 오프셋(ml-56)에서 공용 사용(DRY).
// 사이드바를 숨길 경로 — 마케팅/법무, 인증/온보딩, 풀스크린 폼, redirect stub.
const NO_SIDEBAR_EXACT = new Set([
  '/', '/login', '/onboarding', '/suspended',
  '/privacy', '/terms', '/refund', '/about', '/operating-policy',
  '/teams/create', '/scrims/post',
  '/dashboard', '/teams', '/scrims', // 정본(valorant)으로 리다이렉트되는 stub
])

export function showSidebar(pathname: string): boolean {
  if (NO_SIDEBAR_EXACT.has(pathname)) return false
  if (pathname.startsWith('/admin')) return false        // 관리자 페이지 전체
  if (pathname.startsWith('/recruit/post')) return false // 모집글 작성·수정
  if (pathname.endsWith('/manage')) return false         // 팀 관리(teams/[id]/manage)
  if (pathname.endsWith('/edit')) return false           // 스크림 수정(scrims/[id]/edit)
  return true
}
