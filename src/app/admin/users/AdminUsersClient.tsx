'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUsersClient({ users, initialSearch }: { users: any[]; initialSearch: string }) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState<string | null>(null)
  const [list, setList] = useState(users)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/admin/users?search=${encodeURIComponent(search)}`)
  }

  const handleSuspend = async (userId: string, suspend: boolean) => {
    setLoading(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: suspend ? 'suspend' : 'unsuspend' }),
    })
    setLoading(null)
    if (res.ok) {
      setList((prev) => prev.map((u) => u.id === userId ? { ...u, suspended: suspend } : u))
    } else {
      alert('처리 중 오류가 발생했어요.')
    }
  }

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`${name} 계정을 강제 탈퇴시킬까요? 이 작업은 되돌릴 수 없습니다.`)) return
    setLoading(userId + 'del')
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setLoading(null)
    if (res.ok) setList((prev) => prev.filter((u) => u.id !== userId))
    else alert('처리 중 오류가 발생했어요.')
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Users</p>
          <h1 className="text-white font-black text-2xl">유저 관리</h1>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="닉네임 검색"
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#00D2BE]/40 transition w-52"
          />
          <button type="submit" className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold px-4 py-2 rounded-xl transition">
            검색
          </button>
        </form>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-12 gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          {['닉네임', '티어', '가입일', '상태', ''].map((h, i) => (
            <span key={i} className={`text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 ${i === 0 ? 'col-span-4' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : 'col-span-2'}`}>{h}</span>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="py-16 text-center text-slate-700 text-xs">검색 결과가 없어요</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {list.map((u) => {
              const name = u.val_gamename ?? u.riot_gamename ?? '(미등록)'
              const tier = u.val_tier ?? u.tier ?? '—'
              const date = new Date(u.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              const isLoading = loading === u.id || loading === u.id + 'del'
              return (
                <div key={u.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center hover:bg-white/[0.02] transition">
                  <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#00D2BE]/10 flex items-center justify-center text-[10px] font-black text-[#00D2BE] shrink-0">
                      {name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <a href={`/admin/users/${u.id}`} className="text-white text-xs font-semibold truncate hover:text-[#00D2BE] transition">{name}</a>
                      {u.is_admin && <span className="text-[9px] font-bold text-[#00D2BE]">ADMIN</span>}
                    </div>
                  </div>
                  <span className="col-span-2 text-slate-500 text-xs">{tier}</span>
                  <span className="col-span-2 text-slate-500 text-xs">{date}</span>
                  <div className="col-span-2">
                    {u.suspended
                      ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">정지됨</span>
                      : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">활성</span>
                    }
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 justify-end">
                    {!u.is_admin && (
                      <>
                        <button
                          disabled={isLoading}
                          onClick={() => handleSuspend(u.id, !u.suspended)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 ${
                            u.suspended
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                          }`}>
                          {isLoading ? '...' : u.suspended ? '해제' : '정지'}
                        </button>
                        <button
                          disabled={isLoading}
                          onClick={() => handleDelete(u.id, name)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                          탈퇴
                        </button>
                      </>
                    )}
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
