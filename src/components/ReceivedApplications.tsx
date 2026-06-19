'use client'

import { useState } from 'react'

type Application = {
  id: string
  status: string
  applying_team: { id: string; name: string; tier_avg: string | null; game_type: string }
  scrim_post: { id: string; preferred_date: string | null; note: string | null }
}

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655', lol: '#c89b3c' }
const GAME_LABEL: Record<string, string> = { valorant: 'VALORANT', lol: 'LoL' }

export default function ReceivedApplications({ initialApps }: { initialApps: Application[] }) {
  const [apps, setApps] = useState(initialApps)
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (appId: string, action: 'accept' | 'reject') => {
    setLoading(appId + action)
    const res = await fetch(`/api/scrims/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setLoading(null)
    if (res.ok) {
      setApps((prev) => prev.map((a) =>
        a.id === appId ? { ...a, status: action === 'accept' ? 'accepted' : 'rejected' } : a
      ))
    }
  }

  const pending = apps.filter((a) => a.status === 'pending')
  const done = apps.filter((a) => a.status !== 'pending')

  return (
    <div className="bg-[#13131f] border border-white/5">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <p className="text-white font-bold text-xs uppercase tracking-widest">받은 스크림 신청</p>
        {pending.length > 0 && (
          <span className="text-[10px] font-bold bg-[#00D2BE] text-white px-2 py-0.5">{pending.length}</span>
        )}
      </div>

      {apps.length === 0 ? (
        <div className="px-4 py-6 text-center text-slate-600 text-xs">
          아직 들어온 요청이 없어요!
        </div>
      ) : (
      <div className="divide-y divide-white/5">
        {[...pending, ...done].map((app) => {
          const gc = GAME_COLOR[app.applying_team.game_type] ?? '#00D2BE'
          const date = app.scrim_post.preferred_date
            ? new Date(app.scrim_post.preferred_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '미정'

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
                <p className="text-slate-600 text-[10px]">희망 시간: {date}</p>
                {app.scrim_post.note && (
                  <p className="text-slate-600 text-[10px] truncate">{app.scrim_post.note}</p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {app.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleAction(app.id, 'accept')}
                      disabled={!!loading}
                      className="text-[10px] font-bold px-3 py-1.5 bg-[#00D2BE]/20 text-[#00D2BE] hover:bg-[#00D2BE]/30 transition disabled:opacity-50"
                    >
                      {loading === app.id + 'accept' ? '...' : '수락'}
                    </button>
                    <button
                      onClick={() => handleAction(app.id, 'reject')}
                      disabled={!!loading}
                      className="text-[10px] font-bold px-3 py-1.5 bg-white/5 text-slate-400 hover:bg-white/10 transition disabled:opacity-50"
                    >
                      {loading === app.id + 'reject' ? '...' : '거절'}
                    </button>
                  </>
                ) : app.status === 'accepted' ? (
                  <span className="text-[10px] font-bold text-green-400">수락됨</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">거절됨</span>
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
