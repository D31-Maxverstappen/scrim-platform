'use client'

import { useEffect, useState, useRef } from 'react'
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
    <div className="bg-[#13131f] border border-white/5 rounded p-4 flex items-center gap-4">
      {u?.avatar_url ? (
        <img src={u.avatar_url} className="w-10 h-10 rounded object-cover" alt="" />
      ) : (
        <div className="w-10 h-10 rounded bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black">
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
        className="bg-[#1e1e2e] border border-white/10  px-3 py-1.5 text-white text-xs focus:outline-none"
      >
        {ROLES.map(role => <option key={role} value={role} className="bg-[#1e1e2e] text-white">{ROLE_LABEL[role]}</option>)}
      </select>
      <button onClick={() => onAction(r.id, 'accept', selectedRole)} className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold px-4 py-2  transition">
        수락
      </button>
      <button onClick={() => onAction(r.id, 'reject', '')} className="bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold px-4 py-2  transition">
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
  const [editName, setEditName] = useState('')
  const [editAbbr, setEditAbbr] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [isOpenSaving, setIsOpenSaving] = useState(false)
  const [inviteSearch, setInviteSearch] = useState('')
  const [inviteResults, setInviteResults] = useState<any[]>([])
  const [inviteStatus, setInviteStatus] = useState<Record<string, 'idle' | 'sent' | 'error'>>({})
  const inviteFetchRef = useRef(0)

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: t } = await supabase.from('teams').select('*').eq('id', teamId).single()
    if (!t || t.captain_id !== user.id) { router.replace(`/teams/${teamId}`); return }
    setTeam(t)
    setEditName(t.name ?? '')
    setEditAbbr(t.abbreviation ?? '')
    setIsOpen(t.is_open !== false)

    const { data: m } = await supabase
      .from('team_members')
      .select('user_id, role, is_igl, users(riot_gamename, riot_tagline, avatar_url, tier)')
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

  useEffect(() => {
    if (!inviteSearch.trim()) { setInviteResults([]); return }
    const myId = ++inviteFetchRef.current
    supabase.from('users').select('id, riot_gamename, tier, avatar_url').ilike('riot_gamename', `%${inviteSearch.trim()}%`).limit(5)
      .then(({ data }) => {
        if (inviteFetchRef.current !== myId) return
        setInviteResults((data ?? []).filter((u: any) => u.riot_gamename))
      })
  }, [inviteSearch])

  const sendInvite = async (userId: string) => {
    setInviteStatus(prev => ({ ...prev, [userId]: 'idle' }))
    const res = await fetch(`/api/teams/${teamId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: userId }),
    })
    setInviteStatus(prev => ({ ...prev, [userId]: res.ok ? 'sent' : 'error' }))
  }

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

  const handleIglToggle = async (userId: string, currentIsIgl: boolean) => {
    if (!currentIsIgl) {
      await supabase.from('team_members').update({ is_igl: false }).eq('team_id', teamId)
      setMembers((prev) => prev.map((m) => ({ ...m, is_igl: false })))
    }
    await supabase.from('team_members').update({ is_igl: !currentIsIgl }).eq('team_id', teamId).eq('user_id', userId)
    setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, is_igl: !currentIsIgl } : m))
    setMsg(!currentIsIgl ? 'IGL을 지정했어요.' : 'IGL을 해제했어요.')
  }

  const handleKick = async (userId: string) => {
    if (!confirm('정말 내보낼까요?')) return
    await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId)
    setMsg('멤버를 내보냈어요.')
    load()
  }

  const handleToggleOpen = async () => {
    setIsOpenSaving(true)
    const newVal = !isOpen
    await supabase.from('teams').update({ is_open: newVal }).eq('id', teamId)
    setIsOpen(newVal)
    setIsOpenSaving(false)
    setMsg(newVal ? '팀을 공개로 전환했어요.' : '팀을 초대 전용으로 전환했어요.')
  }

  const handleSaveInfo = async () => {
    if (!editName.trim()) return
    const abbr = editAbbr.toUpperCase().trim()
    if (abbr && (abbr.length < 2 || abbr.length > 5)) {
      setMsg('팀 약자는 2~5글자여야 해요.')
      return
    }
    setEditSaving(true)
    await supabase.from('teams').update({
      name: editName.trim(),
      abbreviation: abbr || null,
    }).eq('id', teamId)
    setEditSaving(false)
    setMsg('팀 정보를 저장했어요.')
    load()
  }

  const handleDelete = async () => {
    if (deleteInput !== team?.name) return
    const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' })
    if (res.ok) router.replace(team?.game_type === 'lol' ? '/lol/teams' : '/valorant/teams')
    else {
      const data = await res.json()
      setMsg('삭제 실패: ' + (data.error ?? '알 수 없는 오류'))
    }
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
          <div className="bg-[#00D2BE]/10 border border-[#00D2BE]/20 text-[#00D2BE] text-sm rounded px-4 py-3 mb-6">
            {msg}
          </div>
        )}

        {/* 팀 정보 수정 */}
        <section className="mb-8">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">팀 정보 수정</h2>
          <div className="bg-[#13131f] border border-white/5 rounded p-5 flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">팀 이름</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">팀 약자 <span className="text-slate-600">(Discord 채널명에 사용)</span></label>
              <input
                value={editAbbr}
                onChange={(e) => setEditAbbr(e.target.value.toUpperCase())}
                maxLength={5}
                placeholder="예: PRX, T1, GEN"
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition font-bold tracking-widest"
              />
            </div>
            <button
              onClick={handleSaveInfo}
              disabled={editSaving || !editName.trim()}
              className="self-start bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded transition"
            >
              {editSaving ? '저장 중...' : '저장'}
            </button>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">팀 공개 설정</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {isOpen ? '공개 팀 — 누구든 가입 신청을 보낼 수 있어요' : '초대 전용 — 캡틴이 직접 초대해야 합류할 수 있어요'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleOpen}
                  disabled={isOpenSaving}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50
                    ${isOpen ? 'bg-[#00D2BE]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                    ${isOpen ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 멤버 초대 */}
        <section className="mb-8">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">멤버 초대</h2>
          <div className="bg-[#13131f] border border-white/5 rounded p-5">
            <input
              value={inviteSearch}
              onChange={(e) => setInviteSearch(e.target.value)}
              placeholder="유저 게임 이름 검색..."
              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition mb-3"
            />
            {inviteResults.length > 0 && (
              <div className="flex flex-col gap-2">
                {inviteResults.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 bg-white/3 rounded px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black text-xs overflow-hidden shrink-0">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : u.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{u.riot_gamename}</p>
                      {u.tier && <p className="text-slate-500 text-xs">{u.tier}</p>}
                    </div>
                    {inviteStatus[u.id] === 'sent' ? (
                      <span className="text-[#00D2BE] text-xs font-semibold">전송됨 ✓</span>
                    ) : (
                      <button onClick={() => sendInvite(u.id)} className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold px-3 py-1.5 rounded transition">
                        초대
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {inviteSearch.trim() && inviteResults.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-2">검색 결과가 없어요</p>
            )}
          </div>
        </section>

        {/* 가입 신청 */}
        <section className="mb-8">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
            가입 신청 {requests.length > 0 && <span className="ml-2 bg-[#00D2BE] text-black text-xs font-black px-2 py-0.5 rounded-full">{requests.length}</span>}
          </h2>
          {requests.length === 0 ? (
            <div className="bg-[#13131f] border border-white/5 rounded p-6 text-center text-slate-600 text-sm">
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
                <div key={m.user_id} className="bg-[#13131f] border border-white/5 rounded p-4 flex items-center gap-4">
                  {u?.avatar_url ? (
                    <img src={u.avatar_url} className="w-10 h-10 rounded object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-[#00D2BE]/20 flex items-center justify-center text-[#00D2BE] font-black">
                      {u?.riot_gamename?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{u?.riot_gamename ?? '알 수 없음'}{u?.riot_tagline && <span className="text-slate-500 text-xs"> #{u.riot_tagline}</span>}</p>
                    {u?.tier && <p className="text-slate-500 text-xs">{u.tier}</p>}
                  </div>
                  {/* IGL 토글 (코치 제외) */}
                  {!['head_coach', 'coach'].includes(m.role) && (
                    <button
                      onClick={() => handleIglToggle(m.user_id, m.is_igl)}
                      className={`text-[10px] font-black px-2.5 py-1 border transition ${m.is_igl ? 'border-[#00D2BE] text-[#00D2BE] bg-[#00D2BE]/10' : 'border-white/10 text-slate-600 hover:border-white/30 hover:text-slate-400'}`}
                    >
                      IGL
                    </button>
                  )}
                  {isCaptain ? (
                    <span className="text-xs font-bold px-3 py-1" style={{ color: '#00D2BE', background: '#00D2BE22' }}>Captain</span>
                  ) : (
                    <>
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                        className="bg-[#1e1e2e] border border-white/10 px-3 py-1.5 text-xs focus:outline-none"
                        style={{ color: ROLE_COLOR[m.role] ?? '#94a3b8' }}
                      >
                        {ROLES.map(role => <option key={role} value={role} className="bg-[#1e1e2e] text-white">{ROLE_LABEL[role]}</option>)}
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
        {/* 위험 구역 */}
        <section className="mt-12">
          <h2 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-4">위험 구역</h2>
          <div className="bg-red-500/5 border border-red-500/20 rounded p-5">
            <p className="text-white font-semibold text-sm mb-1">팀 삭제</p>
            <p className="text-slate-400 text-xs mb-4">팀을 삭제하면 모든 멤버, 스크림 기록이 함께 삭제되며 복구할 수 없어요.</p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold px-5 py-2.5 rounded transition border border-red-500/20"
              >
                팀 삭제
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-slate-300 text-sm">
                  확인을 위해 팀 이름 <span className="text-white font-bold">"{team?.name}"</span>을 입력해주세요
                </p>
                <input
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="팀 이름 입력"
                  className="bg-white/5 border border-red-500/30  px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleteInput !== team?.name}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded transition"
                  >
                    영구 삭제
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-bold px-5 py-2.5 rounded transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
