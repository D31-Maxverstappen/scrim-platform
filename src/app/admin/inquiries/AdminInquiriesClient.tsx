'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  answered: 'bg-green-500/10 text-green-400',
}
const STATUS_LABEL: Record<string, string> = { pending: '미답변', answered: '답변 완료' }

function displayName(inq: any) {
  return inq.users?.val_gamename ?? inq.users?.riot_gamename ?? '(알 수 없음)'
}

export default function AdminInquiriesClient({ inquiries }: { inquiries: any[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'pending' | 'answered'>('pending')
  const [replyMap, setReplyMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = inquiries.filter((i) => i.status === tab)

  const handleAnswer = async (id: string) => {
    setLoading(id)
    await fetch(`/api/admin/inquiries`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, adminReply: replyMap[id] ?? null }),
    })
    setLoading(null)
    router.refresh()
  }

  const tabCls = (active: boolean) =>
    `px-4 py-2 text-xs font-bold border-b-2 transition ${active ? 'border-[#00D2BE] text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`

  return (
    <div>
      {/* 탭 */}
      <div className="flex border-b mb-6" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => setTab('pending')} className={tabCls(tab === 'pending')}>
          미답변
          {inquiries.filter((i) => i.status === 'pending').length > 0 && (
            <span className="ml-2 text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
              {inquiries.filter((i) => i.status === 'pending').length}
            </span>
          )}
        </button>
        <button onClick={() => setTab('answered')} className={tabCls(tab === 'answered')}>
          답변 완료
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-700 text-xs">
            {tab === 'pending' ? '미답변 문의 없음' : '답변 완료된 문의 없음'}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((inq) => (
              <div key={inq.id} className="px-5 py-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-bold">{displayName(inq)}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{inq.subject}</p>
                    <p className="text-slate-700 text-[10px] mt-0.5">
                      {new Date(inq.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${STATUS_STYLE[inq.status]}`}>
                    {STATUS_LABEL[inq.status]}
                  </span>
                </div>

                <div className="rounded-xl px-4 py-3 text-slate-300 text-xs leading-relaxed" style={{ backgroundColor: 'var(--bg-base)' }}>
                  {inq.content}
                </div>

                {inq.status === 'pending' && (
                  <>
                    <textarea
                      value={replyMap[inq.id] ?? ''}
                      onChange={(e) => setReplyMap((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                      placeholder="답변 메모 (선택)"
                      rows={2}
                      className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
                    />
                    <button
                      disabled={!!loading}
                      onClick={() => handleAnswer(inq.id)}
                      className="py-2 rounded-lg text-xs font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
                    >
                      {loading === inq.id ? '처리중...' : '✓ 답변 완료 처리'}
                    </button>
                  </>
                )}

                {inq.status === 'answered' && inq.admin_reply && (
                  <p className="text-slate-600 text-[10px]">메모: {inq.admin_reply}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
