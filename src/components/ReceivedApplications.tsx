'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n'

type Application = {
  id: string
  status: string
  match_id: string | null
  applying_team: { id: string; name: string; tier_avg: string | null; game_type: string }
  scrim_post: { id: string; preferred_date: string | null; note: string | null }
}

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }
const GAME_LABEL: Record<string, string> = { valorant: 'VALORANT', lol: 'LoL' }

export default function ReceivedApplications({ initialApps }: { initialApps: Application[] }) {
  const { lang } = useLang()
  const [apps, setApps] = useState(initialApps)
  const [loading, setLoading] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [matchLinks, setMatchLinks] = useState<Record<string, string>>(
    () => Object.fromEntries(initialApps.filter((a) => a.match_id).map((a) => [a.id, a.match_id!]))
  )

  useEffect(() => {
    setApps(initialApps)
    setMatchLinks(Object.fromEntries(initialApps.filter((a) => a.match_id).map((a) => [a.id, a.match_id!])))
  }, [initialApps])

  const handleAcceptConfirm = async (appId: string) => {
    setLoading(appId + 'accept')
    const res = await fetch(`/api/scrims/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept' }),
    })
    setLoading(null)
    setAccepting(null)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(err.error ?? t('error', lang))
      return
    }
    if (res.ok) {
      const data = await res.json()
      if (data.matchId) {
        setMatchLinks((prev) => ({ ...prev, [appId]: data.matchId }))
        setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: 'accepted' } : a))
        window.location.href = `/matches/${data.matchId}`
        return
      }
      setApps((prev) => prev.map((a) =>
        a.id === appId ? { ...a, status: 'accepted' } : a
      ))
    }
  }

  const handleReject = async (appId: string) => {
    setLoading(appId + 'reject')
    await fetch(`/api/scrims/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    })
    setLoading(null)
    setApps((prev) => prev.map((a) =>
      a.id === appId ? { ...a, status: 'rejected' } : a
    ))
  }

  const pending = apps.filter((a) => a.status === 'pending')
  const done = apps.filter((a) => a.status !== 'pending')

  return (
    <div className="bg-[#13131f] border border-white/5">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <p className="text-white font-bold text-xs uppercase tracking-widest">{t('recv_title', lang)}</p>
        {pending.length > 0 && (
          <span className="text-[10px] font-bold bg-[#00D2BE] text-white px-2 py-0.5">{pending.length}</span>
        )}
      </div>

      {apps.length === 0 ? (
        <div className="px-4 py-6 text-center text-slate-600 text-xs">
          {t('recv_no_requests', lang)}
        </div>
      ) : (
      <div className="divide-y divide-white/5">
        {[...pending, ...done].map((app) => {
          const gc = GAME_COLOR[app.applying_team.game_type] ?? '#00D2BE'
          const date = app.scrim_post.preferred_date
            ? new Date(app.scrim_post.preferred_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : t('scrim_undecided', lang)

          return (
            <div key={app.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold" style={{ color: gc }}>{GAME_LABEL[app.applying_team.game_type]}</span>
                  <span className="text-white text-xs font-semibold">{app.applying_team.name}</span>
                  {app.applying_team.tier_avg && (
                    <span className="text-slate-500 text-xs">{app.applying_team.tier_avg}</span>
                  )}
                </div>
                <p className="text-slate-600 text-[10px]">{t('recv_preferred_time', lang)} {date}</p>
                {app.scrim_post.note && (
                  <p className="text-slate-600 text-[10px] truncate">{app.scrim_post.note}</p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {app.status === 'pending' ? (
                  accepting === app.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptConfirm(app.id)}
                        disabled={!!loading}
                        className="text-[10px] font-bold px-3 py-1.5 bg-[#00D2BE]/20 text-[#00D2BE] hover:bg-[#00D2BE]/30 transition disabled:opacity-50"
                      >
                        {loading === app.id + 'accept' ? '...' : t('recv_confirm', lang)}
                      </button>
                      <button onClick={() => setAccepting(null)} className="text-[10px] text-slate-600 hover:text-slate-400 transition">✕</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setAccepting(app.id)}
                        disabled={!!loading}
                        className="text-[10px] font-bold px-3 py-1.5 bg-[#00D2BE]/20 text-[#00D2BE] hover:bg-[#00D2BE]/30 transition disabled:opacity-50"
                      >
                        {t('recv_accept', lang)}
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={!!loading}
                        className="text-[10px] font-bold px-3 py-1.5 bg-white/5 text-slate-400 hover:bg-white/10 transition disabled:opacity-50"
                      >
                        {loading === app.id + 'reject' ? '...' : t('recv_reject', lang)}
                      </button>
                    </>
                  )
                ) : app.status === 'accepted' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-green-400">{t('recv_accepted', lang)}</span>
                    {matchLinks[app.id] && (
                      <a href={`/matches/${matchLinks[app.id]}`}
                        className="text-[10px] font-bold px-3 py-1.5 bg-[#00D2BE]/20 text-[#00D2BE] hover:bg-[#00D2BE]/30 transition">
                        {t('recv_view_match', lang)}
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">{t('recv_rejected', lang)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
