'use client'

import { useState } from 'react'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  resolved: 'bg-green-500/10 text-green-400',
  dismissed: 'bg-slate-700/30 text-slate-500',
}
const STATUS_LABEL: Record<string, string> = { pending: '처리중', resolved: '처리완료', dismissed: '무시됨' }

export default function AdminReportsClient({ reports }: { reports: any[] }) {
  const [list, setList] = useState(reports)
  const [tab, setTab] = useState<'pending' | 'done'>('pending')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = list.filter((r) => tab === 'pending' ? r.status === 'pending' : r.status !== 'pending')

  const handle = async (reportId: string, action: 'resolve' | 'dismiss', actionNote?: string) => {
    setLoading(reportId)
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, action, actionNote }),
    })
    setLoading(null)
    if (res.ok) {
      const status = action === 'resolve' ? 'resolved' : 'dismissed'
      setList((prev) => prev.map((r) => r.id === reportId ? { ...r, status, action: actionNote ?? null } : r))
    } else {
      alert('처리 중 오류가 발생했어요.')
    }
  }

  const pendingCount = list.filter((r) => r.status === 'pending').length

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Reports</p>
        <h1 className="text-white font-black text-2xl">신고 관리</h1>
      </div>

      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-5 w-fit">
        {(['pending', 'done'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              tab === t ? 'bg-[#0d0d1a] text-white' : 'text-slate-600 hover:text-slate-400'
            }`}>
            {t === 'pending' ? '처리중' : '완료'}
            {t === 'pending' && pendingCount > 0 && (
              <span className="bg-[#ff4655] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-700 text-xs">
            {tab === 'pending' ? '미처리 신고가 없어요' : '처리된 신고가 없어요'}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((r) => {
              const reporter = Array.isArray(r.reporter) ? r.reporter[0] : r.reporter
              const reporterName = reporter?.val_gamename ?? reporter?.riot_gamename ?? '알 수 없음'
              const date = new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              const isLoading = loading === r.id
              return (
                <div key={r.id} className="px-5 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${STATUS_STYLE[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.04] text-slate-500">
                          {r.target_type === 'user' ? '유저 신고' : '팀 신고'}
                        </span>
                        <span className="text-slate-700 text-[10px]">{date}</span>
                      </div>
                      <p className="text-white text-xs font-semibold mb-0.5">신고자: {reporterName}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{r.reason}</p>
                      {r.action && (
                        <p className="text-slate-600 text-[10px] mt-1">처리 내용: {r.action}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={r.target_type === 'user' ? `/admin/users?search=${r.target_id}` : `/teams/${r.target_id}`}
                        target={r.target_type === 'team' ? '_blank' : undefined}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] transition">
                        대상 보기
                      </a>
                    </div>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                      <button disabled={isLoading} onClick={() => handle(r.id, 'resolve', '경고 조치')}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition disabled:opacity-50">
                        {isLoading ? '...' : '경고'}
                      </button>
                      <button disabled={isLoading} onClick={() => handle(r.id, 'resolve', '계정 정지')}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                        {isLoading ? '...' : '정지 처리'}
                      </button>
                      <button disabled={isLoading} onClick={() => handle(r.id, 'dismiss')}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] transition disabled:opacity-50">
                        {isLoading ? '...' : '무시'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
