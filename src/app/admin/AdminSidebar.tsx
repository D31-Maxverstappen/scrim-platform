'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/admin', label: '대시보드' },
  { href: '/admin/users', label: '유저 관리' },
  { href: '/admin/teams', label: '팀 관리' },
  { href: '/admin/reports', label: '신고 관리' },
  { href: '/admin/appeals', label: '이의 신청' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 shrink-0 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">D31 Admin</p>
        <p className="text-white font-black text-lg mt-0.5">관리자 패널</p>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold transition border-l-2 ${
                active
                  ? 'border-[#00D2BE] text-white bg-white/[0.04]'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-[#00D2BE]' : 'bg-slate-700'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <Link href="/valorant/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition">← 메인으로</Link>
      </div>
    </aside>
  )
}
