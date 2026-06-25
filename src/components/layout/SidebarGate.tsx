'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { showSidebar } from '@/lib/showSidebar'

// (사이드바는 root layout에 올라가 네비게이션 간 persist되므로 여기서만 표시 여부를 판단)
export default function SidebarGate() {
  const pathname = usePathname()
  if (!showSidebar(pathname)) return null
  return <Sidebar />
}
