'use client'

import { useState } from 'react'
import { formatKST } from '@/lib/datetime'

export type MyInquiry = {
  id: string
  subject: string
  content: string
  status: string
  admin_reply: string | null
  created_at: string | null
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  answered: 'bg-[#00D2BE]/10 text-[#00D2BE] border-[#00D2BE]/20',
}
const STATUS_LABEL: Record<string, string> = { pending: '답변 대기', answered: '답변 완료' }

function fmt(dt: string | null) {
  return formatKST(dt, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function MyInquiries({ inquiries }: { inquiries: MyInquiry[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (inquiries.length === 0) {
    return (
      <div className="bg-[#0d0d14] border border-white/5 rounded-2xl py-12 text-center">
        <p className="text-slate-600 text-sm">아직 접수한 문의가 없어요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {inquiries.map((inq) => {
        const open = openId === inq.id
        const style = STATUS_STYLE[inq.status] ?? STATUS_STYLE.pending
        const label = STATUS_LABEL[inq.status] ?? inq.status
        return (
          <div key={inq.id} className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : inq.id)}
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-white/[0.02] transition"
            >
              <span className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold border ${style}`}>{label}</span>
              <span className="flex-1 min-w-0 text-white text-sm font-bold truncate">{inq.subject}</span>
              <span className="shrink-0 text-slate-600 text-[11px]">{fmt(inq.created_at)}</span>
              <svg
                className={`shrink-0 w-4 h-4 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="px-6 pb-5 pt-1 flex flex-col gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-1.5">문의 내용</p>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{inq.content}</p>
                </div>

                {inq.status === 'answered' ? (
                  <div className="bg-[#00D2BE]/[0.04] border border-[#00D2BE]/15 rounded-xl px-4 py-3.5">
                    <p className="text-[11px] font-bold text-[#00D2BE] mb-1.5">운영팀 답변</p>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap">
                      {inq.admin_reply?.trim() || '답변이 등록되었습니다.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-600 text-xs">아직 답변을 준비 중이에요. 답변이 등록되면 알림으로 안내드릴게요.</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
