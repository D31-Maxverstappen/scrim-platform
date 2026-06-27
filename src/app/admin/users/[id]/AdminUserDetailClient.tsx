'use client'

import { useState } from 'react'
import { formatKST } from '@/lib/datetime'
import { useRouter } from 'next/navigation'

export default function AdminUserDetailClient({ user, team, reports }: {
  user: any
  team: any
  reports: any[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const name = user.val_gamename ?? user.riot_gamename ?? '(미등록)'
  const joined = formatKST(user.created_at, { year: 'numeric', month: 'long', day: 'numeric' })

  const handleSuspend = async (suspend: boolean) => {
    setLoading('suspend')
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, action: suspend ? 'suspend' : 'unsuspend' }),
    })
    setLoading(null)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm(`${name} 계정을 강제 탈퇴시킬까요? 되돌릴 수 없습니다.`)) return
    setLoading('delete')
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    setLoading(null)
    if (res.ok) router.push('/admin/users')
    else alert('처리 중 오류가 발생했어요.')
  }

  const STATUS_STYLE: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    resolved: 'bg-green-500/10 text-green-400',
    dismissed: 'bg-slate-700/30 text-slate-500',
  }
  const STATUS_LABEL: Record<string, string> = { pending: '처리중', resolved: '완료', dismissed: '무시됨' }

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      {/* 프로필 카드 */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Profile</p>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#00D2BE]/10 border border-[#00D2BE]/20 flex items-center justify-center text-2xl font-black text-[#00D2BE] shrink-0">
            {name[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white font-black text-xl">{name}</h2>
              {user.is_admin && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00D2BE]/10 text-[#00D2BE]">ADMIN</span>}
              {user.suspended
                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400">정지됨</span>
                : <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400">활성</span>
              }
            </div>
            <p className="text-slate-500 text-xs">{joined} 가입</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: '티어', value: user.val_tier ?? user.tier ?? '—' },
            { label: '국가', value: user.country ?? '—' },
            { label: '소속 팀', value: (team?.teams as any)?.name ?? '없음' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-base)' }}>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 mb-1">{item.label}</p>
              <p className="text-white text-sm font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {!user.is_admin && (
            <>
              <button
                disabled={!!loading}
                onClick={() => handleSuspend(!user.suspended)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-50 ${
                  user.suspended
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                }`}>
                {loading === 'suspend' ? '처리중...' : user.suspended ? '정지 해제' : '계정 정지'}
              </button>
              <button
                disabled={!!loading}
                onClick={handleDelete}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                {loading === 'delete' ? '처리중...' : '강제 탈퇴'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 신고 내역 */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">신고 내역</p>
        </div>
        {reports.length === 0 ? (
          <div className="py-10 text-center text-slate-700 text-xs">신고 내역 없음</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {reports.map((r) => (
              <div key={r.id} className="px-5 py-3.5 flex items-start gap-3">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 mt-0.5 ${STATUS_STYLE[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs leading-relaxed">{r.reason}</p>
                  <p className="text-slate-700 text-[10px] mt-0.5">
                    {formatKST(r.created_at, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
