'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import GameSwitcher from './GameSwitcher'
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

  const game = pathname.startsWith('/valorant') ? 'valorant' : pathname.startsWith('/lol') ? 'lol' : null
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

  const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }
  const hasResults = teams.length > 0 || users.length > 0

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 px-6 h-20 flex items-center gap-6">
      {/* 로고 */}
      <a href={game ? `/${game}/dashboard` : '/dashboard'} className="shrink-0 flex items-center">
        <Image src="/logo.png" alt="D31" width={64} height={64} className="object-contain" />
      </a>

      {/* 게임 스위처 */}
      <GameSwitcher />

      {/* 네비 링크 */}
      <div className="hidden md:flex items-center gap-1 text-sm">
        <a href={link('/scrims/post')} className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">스크림 올리기</a>
        <a href={link('/teams')} className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">팀 찾기</a>
        <a href="/recruit" className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">모집</a>
        <a href="/leaderboard" className="text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 transition">리더보드</a>
      </div>

      {/* 검색 */}
      <div ref={wrapperRef} className="flex-1 max-w-md mx-auto relative">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => hasResults && setOpen(true)}
            placeholder="팀 또는 유저 검색"
            className="w-full bg-white/5 border border-white/10 rounded pl-10 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2BE]/60 focus:bg-white/8 transition"
          />
        </div>

        {open && hasResults && (
          <div className="absolute top-full mt-1 w-full bg-[#13131f] border border-white/10 rounded overflow-hidden shadow-xl z-50">
            {teams.length > 0 && (
              <>
                <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">팀</p>
                {teams.map((t) => (
                  <button
                    key={t.id}
                    onMouseDown={() => { router.push(`/teams/${t.id}`); setSearch(''); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{t.name}</p>
                      {t.tier_avg && <p className="text-slate-500 text-xs">{t.tier_avg}</p>}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                      style={{ background: (GAME_COLOR[t.game_type] ?? '#00D2BE') + '22', color: GAME_COLOR[t.game_type] ?? '#00D2BE' }}>
                      {t.game_type === 'valorant' ? 'VAL' : 'LoL'}
                    </span>
                  </button>
                ))}
              </>
            )}
            {users.length > 0 && (
              <>
                <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-t border-white/5">유저</p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={() => { router.push(`/users/${u.id}`); setSearch(''); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/5 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white/40">
                      {u.avatar_url
                        ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                        : u.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{u.riot_gamename}</p>
                      {u.tier && <p className="text-slate-500 text-xs">{u.tier}</p>}
                    </div>
                    {u.game_type && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                        style={{ background: (GAME_COLOR[u.game_type] ?? '#00D2BE') + '22', color: GAME_COLOR[u.game_type] ?? '#00D2BE' }}>
                        {u.game_type === 'valorant' ? 'VAL' : 'LoL'}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* 우측 */}
      <div className="shrink-0 flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </nav>
  )
}
