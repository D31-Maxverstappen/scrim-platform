'use client'

import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: '대시보드', icon: '▪' },
  { href: '/admin/users', label: '유저 관리', icon: '▪' },
  { href: '/admin/teams', label: '팀 관리', icon: '▪' },
  { href: '/admin/reports', label: '신고 관리', icon: '▪' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 shrink-0 bg-[#0d0d1a] border-r border-white/[0.06] flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">D31 Admin</p>
        <p className="text-white font-black text-lg mt-0.5">관리자 패널</p>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold transition border-l-2 ${
                active
                  ? 'border-[#00D2BE] text-white bg-white/[0.04]'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-[#00D2BE]' : 'bg-slate-700'}`} />
              {item.label}
            </a>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <a href="/valorant/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition">← 메인으로</a>
      </div>
    </aside>
  )
}
