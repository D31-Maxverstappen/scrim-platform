'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import GameSwitcher from './GameSwitcher'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState('')

  const game = pathname.startsWith('/valorant') ? 'valorant' : pathname.startsWith('/lol') ? 'lol' : null

  const link = (path: string) => game ? `/${game}${path}` : path

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`${link('/scrims')}?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 px-6 h-20 flex items-center gap-6">
      {/* 로고 */}
      <a href="/dashboard" className="shrink-0 flex items-center">
        <Image src="/logo.png" alt="D31" width={64} height={64} className="object-contain" />
      </a>

      {/* 게임 스위처 */}
      <GameSwitcher />

      {/* 네비 링크 */}
      <div className="hidden md:flex items-center gap-1 text-sm">
        <a href={link('/scrims')} className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">스크림</a>
        <a href={link('/scrims/post')} className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">스크림 올리기</a>
        <a href={link('/teams')} className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">팀 찾기</a>
        <a href="/leaderboard" className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">리더보드</a>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="팀 이름, 게임 검색..."
            className="w-full bg-white/5 border border-white/10 rounded pl-10 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE]/60 focus:bg-white/8 transition"
          />
        </div>
      </form>

      {/* 우측 */}
      <div className="shrink-0 flex items-center gap-3">
        <ThemeToggle />
        <a href="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D2BE] to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            나
          </div>
          <span className="hidden sm:block text-sm text-slate-400 hover:text-white transition">프로필</span>
        </a>
      </div>
    </nav>
  )
}
