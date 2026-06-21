'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n'

export default function ProfileDropdown() {
  const router = useRouter()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; avatar: string | null; teamId: string | null } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const { data: profile } = await supabase
        .from('users')
        .select('avatar_url, riot_gamename, val_gamename, lol_gamename')
        .eq('id', u.id)
        .single()
      const { data: member } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', u.id)
        .eq('role', 'captain')
        .single()
      setUser({
        name: profile?.val_gamename ?? profile?.lol_gamename ?? profile?.riot_gamename ?? u.user_metadata?.full_name ?? t('profile_default_name', lang),
        email: u.email ?? '',
        avatar: profile?.avatar_url ?? null,
        teamId: member?.team_id ?? null,
      })
    }
    load()
  }, [])

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const initials = user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div ref={ref} className="relative shrink-0">
      {/* 아바타 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 hover:opacity-80 transition focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#00D2BE] to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <svg className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#13131f] border border-white/10 rounded shadow-xl z-50 overflow-hidden">
          {/* 유저 정보 */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-white text-sm font-bold truncate">{user?.name ?? '...'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email ?? ''}</p>
          </div>

          {/* 메뉴 */}
          <div className="py-1">
            <a href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('profile_view', lang)}
            </a>

            <a href="/onboarding"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t('profile_edit', lang)}
            </a>

            {user?.teamId && (
              <a href={`/teams/${user.teamId}/manage`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('profile_team_manage', lang)}
              </a>
            )}

            <a href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t('profile_dashboard', lang)}
            </a>
          </div>

          <div className="border-t border-white/5 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('profile_logout', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
