'use client'

import { useState, useEffect, useRef } from 'react'
import { formatKST } from '@/lib/datetime'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Notif = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean | null
  created_at: string | null
}

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifs(data ?? [])
    }
    load()

    const channel = supabase
      .channel('notif-bell')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifs(prev => [payload.new as Notif, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (n: Notif) => {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', n.id)
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  const markAllRead = async () => {
    const ids = notifs.filter(n => !n.read).map(n => n.id)
    if (!ids.length) return
    setNotifs(prev => prev.map(x => ({ ...x, read: true })))
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).in('id', ids)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00D2BE] text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-2 w-80 bg-[#13131f] border border-white/10 rounded shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="text-white text-xs font-bold uppercase tracking-widest">알림</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[#00D2BE] text-xs hover:underline">모두 읽음</button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="py-8 text-center text-slate-600 text-xs">알림이 없어요</div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {notifs.map(n => (
                <button
                  key={n.id}
                  onMouseDown={() => markRead(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/3 transition ${!n.read ? 'bg-[#00D2BE]/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] mt-1.5 shrink-0" />}
                    <div className={!n.read ? '' : 'ml-3.5'}>
                      <p className="text-white text-xs font-semibold">{n.title}</p>
                      {n.body && <p className="text-slate-500 text-xs mt-0.5">{n.body}</p>}
                      <p className="text-slate-700 text-[11px] mt-1">
                        {n.created_at ? formatKST(n.created_at, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
