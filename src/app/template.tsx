'use client'

import { usePathname } from 'next/navigation'

// 페이지 네비게이션 시 콘텐츠를 부드럽게 fade-in.
// root template은 "첫 경로 구간"이 바뀔 때만 리마운트되므로(예: /valorant/* 끼리
// 이동하면 효과 누락), usePathname을 key로 줘서 모든 경로 변경에 확실히 재생시킨다.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return <div key={pathname} className="page-transition">{children}</div>
}
