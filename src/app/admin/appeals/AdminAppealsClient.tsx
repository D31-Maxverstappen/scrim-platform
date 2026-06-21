'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
}
const STATUS_LABEL: Record<string, string> = { pending: '검토중', approved: '승인됨', rejected: '거절됨' }

function displayName(a: any) {
  return a.users?.val_gamename ?? a.users?.riot_gamename ?? a.users?.discord_id ?? '(알 수 없음)'
}

export default function AdminAppealsClient({ appeals }: { appeals: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})

  const handle = async (appealId: string, action: 'approve' | 'reject') => {
    setLoading(appealId + action)
    await fetch('/api/admin/appeals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appealId, action, adminNote: noteMap[appealId] ?? null }),
    })
    setLoading(null)
    router.refresh()
  }

  const pending = appeals.filter((a) => a.status === 'pending')
  const done = appeals.filter((a) => a.status !== 'pending')

  return (
    <div className="flex flex-col gap-5">
      {/* 검토 대기 */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">검토 대기</p>
          {pending.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">{pending.length}</span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="py-10 text-center text-slate-700 text-xs">대기 중인 이의 신청 없음</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {pending.map((a) => (
              <div key={a.id} className="px-5 py-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-bold">{displayName(a)}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5">
                      {new Date(a.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
                <div className="rounded-xl px-4 py-3 text-slate-300 text-xs leading-relaxed" style={{ backgroundColor: 'var(--bg-base)' }}>
                  {a.reason}
                </div>
                <input
                  type="text"
                  value={noteMap[a.id] ?? ''}
                  onChange={(e) => setNoteMap((prev) => ({ ...prev, [a.id]: e.target.value }))}
                  placeholder="관리자 메모 (선택 — 거절 사유 등)"
                  className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
                />
                <div className="flex gap-2">
                  <button
                    disabled={!!loading}
                    onClick={() => handle(a.id, 'approve')}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50">
                    {loading === a.id + 'approve' ? '처리중...' : '✓ 승인 (정지 해제)'}
                  </button>
                  <button
                    disabled={!!loading}
                    onClick={() => handle(a.id, 'reject')}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                    {loading === a.id + 'reject' ? '처리중...' : '✗ 거절'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 처리 완료 */}
      {done.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">처리 완료</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {done.map((a) => (
              <div key={a.id} className="px-5 py-3.5 flex items-start gap-3">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${STATUS_STYLE[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold">{displayName(a)}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed line-clamp-2">{a.reason}</p>
                  {a.admin_note && (
                    <p className="text-slate-600 text-[10px] mt-1">메모: {a.admin_note}</p>
                  )}
                  <p className="text-slate-700 text-[10px] mt-1">
                    {new Date(a.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
