'use client'

import { useState, useEffect } from 'react'

type Application = {
  id: string
  status: string | null
  match_id: string | null
  applying_team: { id: string; name: string; tier_avg: string | null; game_type: string }
  scrim_post: { id: string; preferred_date: string | null; note: string | null }
}

export default function ReceivedApplications({ initialApps }: { initialApps: Application[] }) {
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
      alert(err.error ?? 'error')
      return
    }
    const data = await res.json()
    if (data.matchId) {
      setMatchLinks((prev) => ({ ...prev, [appId]: data.matchId }))
      setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: 'accepted' } : a))
      window.location.href = `/matches/${data.matchId}`
      return
    }
    setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: 'accepted' } : a))
  }

  const handleReject = async (appId: string) => {
    setLoading(appId + 'reject')
    await fetch(`/api/scrims/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    })
    setLoading(null)
    setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status: 'rejected' } : a))
  }

  const pending = apps.filter((a) => a.status === 'pending')
  const done = apps.filter((a) => a.status !== 'pending')

  if (apps.length === 0) return null

  return (
    <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden card-glow transition-all duration-300">
      <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">받은 스크림 신청</p>
        {pending.length > 0 && (
          <span className="text-[10px] font-black bg-[#ff4655] text-white px-2 py-0.5 rounded-full">
            {pending.length}
          </span>
        )}
      </div>

      <div className="divide-y divide-white/[0.04]">
        {[...pending, ...done].map((app) => {
          const date = app.scrim_post.preferred_date
            ? new Date(app.scrim_post.preferred_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '미정'

          return (
            <div key={app.id} className="px-5 py-4 flex items-center gap-4">
              {/* 팀 아이콘 */}
              <div className="w-9 h-9 rounded-xl bg-[#ff4655]/10 border border-[#ff4655]/20 flex items-center justify-center shrink-0 font-black text-sm text-[#ff4655]">
                {app.applying_team.name[0]?.toUpperCase() ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white text-xs font-bold">{app.applying_team.name}</span>
                  {app.applying_team.tier_avg && (
                    <span className="text-slate-600 text-[10px]">{app.applying_team.tier_avg}</span>
                  )}
                </div>
                <p className="text-slate-600 text-[10px]">희망 시간: {date}</p>
                {app.scrim_post.note && (
                  <p className="text-slate-700 text-[10px] truncate mt-0.5">{app.scrim_post.note}</p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {app.status === 'pending' ? (
                  accepting === app.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptConfirm(app.id)}
                        disabled={!!loading}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-[#00D2BE]/15 text-[#00D2BE] border border-[#00D2BE]/30 hover:bg-[#00D2BE]/25 transition disabled:opacity-50"
                      >
                        {loading === app.id + 'accept' ? '...' : '확정'}
                      </button>
                      <button onClick={() => setAccepting(null)} className="text-[10px] text-slate-600 hover:text-slate-400 transition">✕</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setAccepting(app.id)}
                        disabled={!!loading}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-[#00D2BE]/15 text-[#00D2BE] border border-[#00D2BE]/30 hover:bg-[#00D2BE]/25 transition disabled:opacity-50"
                      >
                        수락
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={!!loading}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:bg-white/[0.08] transition disabled:opacity-50"
                      >
                        {loading === app.id + 'reject' ? '...' : '거절'}
                      </button>
                    </>
                  )
                ) : app.status === 'accepted' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-green-400">수락됨</span>
                    {matchLinks[app.id] && (
                      <a href={`/matches/${matchLinks[app.id]}`}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-[#00D2BE]/15 text-[#00D2BE] border border-[#00D2BE]/30 hover:bg-[#00D2BE]/25 transition">
                        매치 보기 →
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-700">거절됨</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
