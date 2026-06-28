'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
// 라이트 모드 일시 비활성화 — 다크 모드 고정 (추후 재개 시 ThemeToggle import·렌더 복구)
// import ThemeToggle from './ThemeToggle'
import ProfileDropdown from '@/components/layout/ProfileDropdown'
import NotificationBell from '@/components/layout/NotificationBell'
import SuspendedWatcher from '@/components/layout/SuspendedWatcher'
import { createClient } from '@/lib/supabase/client'

type TeamResult = { id: string; name: string; game_type: string; tier_avg: string | null }
type UserResult = { id: string; riot_gamename: string | null; tier: string | null; game_type: string | null; avatar_url: string | null }

const NAV = [
  {
    href: '/valorant/dashboard',
    label: '홈',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/valorant/matches',
    label: '내 전적',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/valorant/scrims',
    label: '스크림',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/recruit?type=lft',
    label: '팀 구하기',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/recruit?type=lfp',
    label: '선수·코치 구하기',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317z" />
      </svg>
    ),
  },
  {
    href: '/valorant/teams',
    label: '팀 목록',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/valorant/players',
    label: '선수 목록',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/valorant/coaches',
    label: '코치 목록',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-4 9l1.5 1.5L15 11" />
      </svg>
    ),
  },
  {
    href: '/leaderboard',
    label: '리더보드',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/valorant/calendar',
    label: '캘린더',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  /* 내전 — 일단 숨김 (2026-06-27 요청, 추후 복구)
  {
    href: '/inhouse',
    label: '내전',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  */
  {
    href: '/bookmarks',
    label: '즐겨찾기',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
      </svg>
    ),
  },
  {
    href: '/support',
    label: '문의',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
]

// 내전 컨텍스트 사이드바 — /inhouse 진입 시 자동 전환
const INHOUSE_NAV = [
  {
    href: '/valorant/dashboard',
    label: '← 스크림으로',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 12H4" />
      </svg>
    ),
  },
  {
    href: '/inhouse',
    label: '내전 홈',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: '/inhouse/ranking',
    label: '내전 랭킹',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M6 4h12v5a6 6 0 11-12 0V4z" />
      </svg>
    ),
  },
]

// '내 팀' 메뉴 아이콘 (방패 — 소속/소속팀 식별)
const MY_TEAM_ICON = (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
  </svg>
)

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // 모집 탭(/recruit) active 판정용 — 기본 lft(팀 구하기)
  const recruitType = searchParams.get('type') === 'lfp' ? 'lfp' : 'lft'
  const [search, setSearch] = useState('')
  const [teams, setTeams] = useState<TeamResult[]>([])
  const [users, setUsers] = useState<UserResult[]>([])
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [myTeams, setMyTeams] = useState<{ id: string; name: string; role: string }[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fetchIdRef = useRef(0)

  // /inhouse 진입 시 내전 전용 메뉴로 자동 컨텍스트 전환
  const isInhouse = pathname.startsWith('/inhouse')
  const navItems = isInhouse ? INHOUSE_NAV : NAV
  const activeHref = [...navItems]
    .filter((it) => pathname === it.href || pathname.startsWith(it.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // 소속 팀 전체 조회 → '내 팀' 메뉴 (1팀=바로가기, 여러 팀=드롭다운). 캡틴 팀을 앞으로.
  useEffect(() => {
    if (!userId) { setMyTeams([]); return }
    createClient().from('team_members').select('team_id, role, teams(name)').eq('user_id', userId)
      .then(({ data }) => {
        const list = (data ?? [])
          .map((m) => {
            const t = Array.isArray(m.teams) ? m.teams[0] : m.teams
            return t ? { id: m.team_id as string, name: t.name as string, role: m.role as string } : null
          })
          .filter((x): x is { id: string; name: string; role: string } => !!x)
          .sort((a, b) => Number(b.role === 'captain') - Number(a.role === 'captain'))
        setMyTeams(list)
      })
  }, [userId])

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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const hasResults = teams.length > 0 || users.length > 0

  return (
    <>
      {userId && <SuspendedWatcher userId={userId} />}
      <aside className="sidebar-outer fixed top-0 left-0 bottom-0 w-56 z-50 flex flex-col border-r">

        {/* 로고 */}
        <Link href="/valorant/dashboard" className="flex items-center gap-2.5 px-4 py-5 shrink-0"
          style={{ color: 'var(--text-primary)' }}>
          <Image src="/logo.png" alt="D31" width={32} height={32} className="object-contain shrink-0" />
          <span className="text-base font-black tracking-tight">D31<span className="text-[#00D2BE]">.GG</span></span>
        </Link>

        {/* 검색 */}
        <div ref={wrapperRef} className="px-3 mb-3 relative shrink-0">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => hasResults && setOpen(true)}
              placeholder="검색"
              className="w-full rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none transition"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          {open && hasResults && (
            <div className="absolute top-full mt-1 left-3 right-3 rounded overflow-hidden z-50"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)' }}>
              {teams.length > 0 && (
                <>
                  <p className="px-3 pt-2.5 pb-1 text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>팀</p>
                  {teams.map((t) => (
                    <button key={t.id} onMouseDown={() => { router.push(`/teams/${t.id}`); setSearch(''); setOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 transition text-left"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{t.name}</p>
                        {t.tier_avg && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.tier_avg}</p>}
                      </div>
                    </button>
                  ))}
                </>
              )}
              {users.length > 0 && (
                <>
                  <p className="px-3 pt-2.5 pb-1 text-[11px] font-black uppercase tracking-widest border-t"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>유저</p>
                  {users.map((u) => (
                    <button key={u.id} onMouseDown={() => { router.push(`/users/${u.id}`); setSearch(''); setOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 transition text-left"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[11px] font-bold"
                        style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : u.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{u.riot_gamename}</p>
                        {u.tier && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{u.tier}</p>}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="mx-3 mb-3 h-px" style={{ background: 'var(--border)' }} />

        {/* 네비 링크 */}
        <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
          {navItems.map((item, idx) => {
            // 모집 항목(/recruit?type=...)은 type 쿼리로 active 판정, 그 외는 경로 매칭
            const isRecruit = item.href.startsWith('/recruit?')
            const active = isRecruit
              ? (pathname === '/recruit' && item.href.endsWith(`type=${recruitType}`))
              : item.href === activeHref
            const link = (
              <Link key={item.href} href={item.href}
                className={`sidebar-nav-item flex items-center gap-3 px-3 py-3 rounded text-sm font-semibold${active ? ' active' : ''}`}>
                <span className="w-5 h-5 shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            )
            // 홈(0)·내 전적(1) 다음에 '내 팀' 삽입 (내전 컨텍스트 제외)
            if (!isInhouse && idx === 1) {
              return (
                <Fragment key="nav-my-team">
                  {link}
                  <MyTeamNav teams={myTeams} pathname={pathname} />
                </Fragment>
              )
            }
            return link
          })}
        </nav>

        {/* 하단: 프로필 + 알림 + 테마 */}
        <div className="shrink-0 border-t px-3 py-3 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <ProfileDropdown />
          <div className="flex items-center gap-1">
            <NotificationBell />
            {/* <ThemeToggle /> 라이트 모드 일시 비활성화 — 추후 재개 시 복구 */}
          </div>
        </div>
      </aside>
    </>
  )
}

// '내 팀' 메뉴: 소속 1팀이면 바로가기 Link, 여러 팀이면 펼쳐서 선택하는 드롭다운(아코디언).
function MyTeamNav({ teams, pathname }: {
  teams: { id: string; name: string; role: string }[]
  pathname: string
}) {
  const onTeam = (id: string) => pathname === `/teams/${id}` || pathname.startsWith(`/teams/${id}/`)
  const onAnyMyTeam = teams.some((t) => onTeam(t.id))
  const [open, setOpen] = useState(onAnyMyTeam)

  if (teams.length === 0) return null

  if (teams.length === 1) {
    const t = teams[0]
    return (
      <Link href={`/teams/${t.id}`}
        className={`sidebar-nav-item flex items-center gap-3 px-3 py-3 rounded text-sm font-semibold${onTeam(t.id) ? ' active' : ''}`}>
        <span className="w-5 h-5 shrink-0">{MY_TEAM_ICON}</span>
        내 팀
      </Link>
    )
  }

  const roleTag = (role: string) =>
    role === 'captain' ? <span className="ml-auto text-[9px] font-bold text-[#00D2BE] shrink-0">주장</span>
    : (role === 'coach' || role === 'head_coach') ? <span className="ml-auto text-[9px] font-bold text-[#60a5fa] shrink-0">코치</span>
    : null

  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-3 rounded text-sm font-semibold${onAnyMyTeam ? ' active' : ''}`}>
        <span className="w-5 h-5 shrink-0">{MY_TEAM_ICON}</span>
        내 팀
        <svg className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 mt-0.5 mb-1 pl-4">
          {teams.map((t) => (
            <Link key={t.id} href={`/teams/${t.id}`}
              className={`sidebar-nav-item flex items-center gap-2 px-3 py-2 rounded text-xs font-medium${onTeam(t.id) ? ' active' : ''}`}>
              <span className="w-1 h-1 rounded-full bg-current opacity-40 shrink-0" />
              <span className="truncate">{t.name}</span>
              {roleTag(t.role)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
