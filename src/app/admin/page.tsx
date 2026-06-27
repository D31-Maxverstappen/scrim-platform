export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { formatKST } from '@/lib/datetime'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminDashboard() {
  const [
    { count: userCount },
    { count: teamCount },
    { count: scrimCount },
    { count: pendingReports },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('users').select('id', { count: 'exact', head: true }),
    admin.from('teams').select('id', { count: 'exact', head: true }),
    admin.from('scrim_posts').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('users').select('id, riot_gamename, val_gamename, avatar_url, created_at, suspended').order('created_at', { ascending: false }).limit(8),
  ])

  const STATS = [
    { label: '총 유저', value: userCount ?? 0, color: '#00D2BE' },
    { label: '총 팀', value: teamCount ?? 0, color: '#00D2BE' },
    { label: '활성 스크림', value: scrimCount ?? 0, color: '#00D2BE' },
    { label: '미처리 신고', value: pendingReports ?? 0, color: pendingReports ? '#ff4655' : '#00D2BE' },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Overview</p>
        <h1 className="text-white font-black text-2xl">관리자 대시보드</h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl px-5 py-5">
            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 mb-3">{s.label}</p>
            <p className="text-4xl font-black leading-none" style={{ color: s.color }}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.04]">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">최근 가입 유저</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {(recentUsers ?? []).map((u) => {
            const name = u.val_gamename ?? u.riot_gamename ?? '(미등록)'
            const date = formatKST(u.created_at, { month: 'short', day: 'numeric' })
            return (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-xl bg-[#00D2BE]/10 border border-[#00D2BE]/20 flex items-center justify-center text-xs font-black text-[#00D2BE] shrink-0">
                  {name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{name}</p>
                </div>
                {u.suspended && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400">정지됨</span>
                )}
                <span className="text-slate-600 text-[11px] shrink-0">{date}</span>
                <a href={`/admin/users/${u.id}`} className="text-slate-700 hover:text-[#00D2BE] text-xs transition shrink-0">→</a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
