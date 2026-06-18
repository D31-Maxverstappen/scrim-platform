'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLES = ['player', 'igl', 'head_coach', 'coach']
const ROLE_LABEL: Record<string, string> = {
  captain: 'Captain', igl: 'IGL', player: 'Player',
  head_coach: 'Head Coach', coach: 'Coach',
}
const ROLE_COLOR: Record<string, string> = {
  captain: '#00D2BE', igl: '#f59e0b', player: '#94a3b8',
  head_coach: '#a78bfa', coach: '#60a5fa',
}

function RequestRow({ r, onAction }: { r: any, onAction: (id: string, action: 'accept' | 'reject', role: string) => void }) {
  const [selectedRole, setSelectedRole] = useState('player')
  const u = r.users
  return (
    <div className="bg-[#13131f] border border-white/5 rounded-xl p-4 flex items-center gap-4">
      {u?.avatar_url ? (
        <img src={u.avatar_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black">
          {u?.riot_gamename?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <div className="flex-1">
        <p className="text-white font-semibold text-sm">{u?.riot_gamename ?? '알 수 없음'}{u?.riot_tagline && <span className="text-slate-500 text-xs"> #{u.riot_tagline}</span>}</p>
        {u?.tier && <p className="text-slate-500 text-xs">{u.tier}</p>}
      </div>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
      >
        {ROLES.map(role => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}
      </select>
      <button onClick={() => onAction(r.id, 'accept', selectedRole)} className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold px-4 py-2 rounded-lg transition">
        수락
      </button>
      <button onClick={() => onAction(r.id, 'reject', '')} className="bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold px-4 py-2 rounded-lg transition">
        거절
      </button>
    </div>
  )
}

export default function ManageTeamPage() {
  const { id: teamId } = useParams<{ id: string }>()
  const router = useRouter()
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: t } = await supabase.from('teams').select('*').eq('id', teamId).single()
    if (!t || t.captain_id !== user.id) { router.replace(`/teams/${teamId}`); return }
    setTeam(t)

    const { data: m } = await supabase
      .from('team_members')
      .select('user_id, role, users(riot_gamename, riot_tagline, avatar_url, tier)')
      .eq('team_id', teamId)
    setMembers(m ?? [])

    const { data: r } = await supabase
      .from('team_join_requests')
      .select('id, status, created_at, users(riot_gamename, riot_tagline, avatar_url, tier)')
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    setRequests(r ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [teamId])

  const handleRequest = async (requestId: string, action: 'accept' | 'reject', role = 'player') => {
    const res = await fetch(`/api/teams/${teamId}/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, role }),
    })
    if (res.ok) { setMsg(action === 'accept' ? '수락했어요!' : '거절했어요.'); load() }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase.from('team_members').update({ role: newRole }).eq('team_id', teamId).eq('user_id', userId)
    setMsg('역할을 변경했어요.')
    load()
  }

  const handleKick = async (userId: string) => {
    if (!confirm('정말 내보낼까요?')) return
    await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId)
    setMsg('멤버를 내보냈어요.')
    load()
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#00D2BE] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <a href={`/teams/${teamId}`} className="text-slate-500 text-sm hover:text-slate-300 transition">← 팀 페이지</a>
          <h1 className="text-white font-black text-2xl">{team?.name} 관리</h1>
        </div>

        {msg && (
          <div className="bg-[#00D2BE]/10 border border-[#00D2BE]/20 text-[#00D2BE] text-sm rounded-xl px-4 py-3 mb-6">
            {msg}
          </div>
        )}

        {/* 가입 신청 */}
        <section className="mb-8">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
            가입 신청 {requests.length > 0 && <span className="ml-2 bg-[#00D2BE] text-black text-xs font-black px-2 py-0.5 rounded-full">{requests.length}</span>}
          </h2>
          {requests.length === 0 ? (
            <div className="bg-[#13131f] border border-white/5 rounded-xl p-6 text-center text-slate-600 text-sm">
              대기 중인 신청이 없어요
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((r: any) => (
                <RequestRow key={r.id} r={r} onAction={handleRequest} />
              ))}
            </div>
          )}
        </section>

        {/* 현재 멤버 */}
        <section>
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">현재 멤버</h2>
          <div className="flex flex-col gap-3">
            {members.map((m: any) => {
              const u = m.users
              const isCaptain = m.role === 'captain'
              return (
                <div key={m.user_id} className="bg-[#13131f] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                  {u?.avatar_url ? (
                    <img src={u.avatar_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black">
                      {u?.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{u?.riot_gamename ?? '알 수 없음'}{u?.riot_tagline && <span className="text-slate-500 text-xs"> #{u.riot_tagline}</span>}</p>
                    {u?.tier && <p className="text-slate-500 text-xs">{u.tier}</p>}
                  </div>
                  {isCaptain ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#00D2BE', background: '#00D2BE22' }}>Captain</span>
                  ) : (
                    <>
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                        style={{ color: ROLE_COLOR[m.role] ?? '#94a3b8' }}
                      >
                        {ROLES.map(role => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}
                      </select>
                      <button onClick={() => handleKick(m.user_id)} className="text-xs text-slate-600 hover:text-red-400 transition px-2">
                        내보내기
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
