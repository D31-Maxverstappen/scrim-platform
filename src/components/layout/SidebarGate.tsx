'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { showSidebar } from '@/lib/showSidebar'

// (사이드바는 root layout에 올라가 네비게이션 간 persist되므로 여기서만 표시 여부를 판단)
export default function SidebarGate() {
  const pathname = usePathname()
  if (!showSidebar(pathname)) return null
  // Sidebar가 useSearchParams(모집 탭 active 판정)를 쓰므로 Suspense 경계로 감싼다
  return (
    <Suspense fallback={null}>
      <Sidebar />
    </Suspense>
  )
}
