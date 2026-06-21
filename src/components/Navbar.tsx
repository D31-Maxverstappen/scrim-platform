'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import ProfileDropdown from './ProfileDropdown'
import NotificationBell from './NotificationBell'
import { createClient } from '@/lib/supabase/client'

type TeamResult = { id: string; name: string; game_type: string; tier_avg: string | null }
type UserResult = { id: string; riot_gamename: string | null; tier: string | null; game_type: string | null; avatar_url: string | null }

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [teams, setTeams] = useState<TeamResult[]>([])
  const [users, setUsers] = useState<UserResult[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fetchIdRef = useRef(0)

  const game = pathname.startsWith('/valorant') ? 'valorant' : null
  const link = (path: string) => game ? `/${game}${path}` : path

  useEffect(() => {
    if (!search.trim()) { setTeams([]); setUsers([]); setOpen(false); return }
    setOpen(true)
    const myId = ++fetchIdRef.current
    const q = search.trim()
    const supabase = createClient()
    Promise.all([
      supabase.from('teams').select('id, name, game_type, tier_avg').ilike('name', `%${q}%`).limit(4),
      supabase.from('users').select('id, riot_gamename, tier, game_type, avatar_url').ilike('riot_gamename', `%${q}%`).limit(4),
    ]).then(([{ data: teamData }, { data: userData }]) => {
      if (fetchIdRef.current !== myId) return
      setTeams(teamData ?? [])
      setUsers((userData ?? []).filter((u) => u.riot_gamename))
    })
  }, [search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const hasResults = teams.length > 0 || users.length > 0

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070711]/95 backdrop-blur-md border-b border-white/[0.06] px-6 h-16 flex items-center gap-6 relative">
      {/* 로고 */}
      <a href={game ? `/${game}/dashboard` : '/dashboard'} className="shrink-0 flex items-center">
        <Image src="/logo.png" alt="D31" width={52} height={52} className="object-contain" />
      </a>

      {/* 중앙 워드마크 */}
      <a
        href={game ? `/${game}/dashboard` : '/dashboard'}
        className="absolute left-1/2 -translate-x-1/2 select-none"
      >
        <span
          className="text-xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #d4d4d4 0%, #c0c0c0 40%, #c0392b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 10px rgba(192,57,43,0.35))',
          }}
        >
          D31
        </span>
        <span
          className="text-xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #c0392b 0%, #96281b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 10px rgba(192,57,43,0.5))',
          }}
        >
          .GG
        </span>
      </a>

      {/* 네비 링크 */}
      <div className="hidden md:flex items-center gap-0.5 text-sm">
        {[
          { href: link('/teams'), label: '팀 목록' },
          { href: '/recruit', label: '팀 또는 선수 찾기' },
          { href: '/leaderboard', label: '리더보드' },
        ].map((item) => (
          <a key={item.href} href={item.href}
            className={`text-slate-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-white/[0.04] ${
              pathname === item.href ? 'text-white bg-white/[0.04]' : ''
            }`}>
            {item.label}
          </a>
        ))}
      </div>

      {/* 검색 */}
      <div ref={wrapperRef} className="ml-auto w-64 relative">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => hasResults && setOpen(true)}
            placeholder="팀 또는 유저 검색"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#00D2BE]/40 transition"
          />
        </div>

        {open && hasResults && (
          <div className="absolute top-full mt-2 w-full bg-[#0d0d1a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl z-50">
            {teams.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-700 uppercase tracking-[0.15em]">팀</p>
                {teams.map((t) => (
                  <button
                    key={t.id}
                    onMouseDown={() => { router.push(`/teams/${t.id}`); setSearch(''); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{t.name}</p>
                      {t.tier_avg && <p className="text-slate-600 text-[10px]">{t.tier_avg}</p>}
                    </div>
                    {t.game_type === 'valorant' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                        style={{ background: '#ff455518', color: '#ff4655' }}>VAL</span>
                    )}
                  </button>
                ))}
              </>
            )}
            {users.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-700 uppercase tracking-[0.15em] border-t border-white/[0.04]">유저</p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={() => { router.push(`/users/${u.id}`); setSearch(''); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/[0.05] overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white/40">
                      {u.avatar_url
                        ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                        : u.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{u.riot_gamename}</p>
                      {u.tier && <p className="text-slate-600 text-[10px]">{u.tier}</p>}
                    </div>
                    {u.game_type === 'valorant' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                        style={{ background: '#ff455518', color: '#ff4655' }}>VAL</span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* 우측 */}
      <div className="shrink-0 flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </nav>
  )
}
