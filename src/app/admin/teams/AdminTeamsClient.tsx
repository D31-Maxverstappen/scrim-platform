'use client'

import { useState } from 'react'
import { formatKST } from '@/lib/datetime'

const GAME_COLOR: Record<string, string> = { valorant: '#ff4655' }

export default function AdminTeamsClient({ teams }: { teams: any[] }) {
  const [list, setList] = useState(teams)
  const [loading, setLoading] = useState<string | null>(null)

  const handleDisband = async (teamId: string, name: string) => {
    if (!confirm(`"${name}" 팀을 강제 해산할까요? 멤버 전원에게 알림이 전송됩니다.`)) return
    setLoading(teamId)
    const res = await fetch('/api/admin/teams', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    })
    setLoading(null)
    if (res.ok) setList((prev) => prev.filter((t) => t.id !== teamId))
    else alert('처리 중 오류가 발생했어요.')
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Teams</p>
        <h1 className="text-white font-black text-2xl">팀 관리</h1>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-12 gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          {['팀 이름', '게임', '캡틴', '멤버', '평균 티어', ''].map((h, i) => (
            <span key={i} className={`text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 ${
              i === 0 ? 'col-span-3' : i === 1 ? 'col-span-1' : i === 2 ? 'col-span-3' : i === 3 ? 'col-span-1' : i === 4 ? 'col-span-2' : 'col-span-2'
            }`}>{h}</span>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="py-16 text-center text-slate-700 text-xs">팀이 없어요</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {list.map((t) => {
              const gc = GAME_COLOR[t.game_type] ?? '#00D2BE'
              const captainName = t.captain?.val_gamename ?? t.captain?.riot_gamename ?? '—'
              const date = formatKST(t.created_at, { month: 'short', day: 'numeric' })
              return (
                <div key={t.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-white/[0.02] transition">
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ background: gc + '20', color: gc }}>
                      {(t.abbreviation ?? t.name)[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{t.name}</p>
                      <p className="text-slate-700 text-[10px]">{date}</p>
                    </div>
                  </div>
                  <span className="col-span-1 text-[10px] font-bold" style={{ color: gc }}>
                    {t.game_type === 'valorant' ? 'VAL' : t.game_type}
                  </span>
                  <span className="col-span-3 text-slate-400 text-xs truncate">{captainName}</span>
                  <span className="col-span-1 text-slate-500 text-xs">{t.member_count}명</span>
                  <span className="col-span-2 text-slate-500 text-xs">{t.tier_avg ?? '—'}</span>
                  <div className="col-span-2 flex justify-end gap-2">
                    <a href={`/teams/${t.id}`} target="_blank"
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] transition">
                      보기
                    </a>
                    <button
                      disabled={loading === t.id}
                      onClick={() => handleDisband(t.id, t.name)}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                      {loading === t.id ? '...' : '해산'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
