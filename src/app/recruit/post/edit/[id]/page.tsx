'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const VAL_ROLES = ['Duelist', 'Initiator', 'Sentinel', 'Controller', 'IGL', 'Flex']
const VAL_TIERS = [
  'Iron 3', 'Iron 2', 'Iron 1', 'Bronze 3', 'Bronze 2', 'Bronze 1',
  'Silver 3', 'Silver 2', 'Silver 1', 'Gold 3', 'Gold 2', 'Gold 1',
  'Platinum 3', 'Platinum 2', 'Platinum 1', 'Diamond 3', 'Diamond 2', 'Diamond 1',
  'Ascendant 3', 'Ascendant 2', 'Ascendant 1', 'Immortal 3', 'Immortal 2', 'Immortal 1', 'Radiant',
]

export default function RecruitEditPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [type, setType] = useState<'lft' | 'lfp'>('lft')
  const [tier, setTier] = useState('')
  const [tiers, setTiers] = useState<string[]>([])
  const [minTier, setMinTier] = useState('')
  const [maxTier, setMaxTier] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [discordTag, setDiscordTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('recruitment_posts')
      .select('type, tier, roles, note, discord_tag, user_id')
      .eq('id', id)
      .single()
      .then(async ({ data }) => {
        if (!data) { router.push('/recruit'); return }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || data.user_id !== user.id) { router.push('/recruit'); return }

        setType(data.type as 'lfp' | 'lft')
        setNote(data.note ?? '')
        setDiscordTag(data.discord_tag ?? '')
        setRoles(data.roles ?? [])

        if (data.type === 'lft') {
          setTier(data.tier ?? '')
        } else {
          const arr = data.tier ? data.tier.split(',').map((t: string) => t.trim()).filter(Boolean) : []
          // 저장된 범위(낮은→높은 순)에서 최소/최대 복원
          const sorted = [...arr].sort((a, b) => VAL_TIERS.indexOf(a) - VAL_TIERS.indexOf(b))
          if (sorted.length > 0) { setMinTier(sorted[0]); setMaxTier(sorted[sorted.length - 1]) }
        }
        setFetching(false)
      })
  }, [id, router])

  const toggleRole = (r: string) =>
    setRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])

  // 최소~최대 → tiers 범위 계산
  useEffect(() => {
    if (!minTier && !maxTier) { setTiers([]); return }
    const lo = minTier || maxTier
    const hi = maxTier || minTier
    let a = VAL_TIERS.indexOf(lo)
    let b = VAL_TIERS.indexOf(hi)
    if (a > b) { const t = a; a = b; b = t }
    setTiers(VAL_TIERS.slice(a, b + 1))
  }, [minTier, maxTier])

  const DISCORD_REGEX = /^[\w.]{2,32}(#\d{4})?$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (discordTag && !DISCORD_REGEX.test(discordTag)) {
      setError('Discord 태그 형식이 올바르지 않아요. (예: username 또는 username#1234)')
      return
    }
    setLoading(true); setError('')
    const res = await fetch(`/api/recruit/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: type === 'lft' ? (tier || null) : (tiers.length ? tiers.join(',') : null),
        roles: roles.length ? roles : null,
        note: note || null,
        discord_tag: discordTag || null,
      }),
    })
    setLoading(false)
    if (res.ok) router.push(`/recruit?type=${type}`)
    else setError('수정 중 오류가 발생했어요.')
  }

  const chipCls = (active: boolean) =>
    `px-2.5 py-1 rounded text-xs font-semibold transition ${active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`

  if (fetching) {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-slate-500 text-sm">불러오는 중...</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <a href="/recruit" className="text-slate-500 text-sm hover:text-slate-300 transition">← 모집 게시판</a>
          <h1 className="text-white font-bold text-2xl mt-3">모집 글 수정</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e1e2e] border border-white/10 rounded p-6 flex flex-col gap-5">

          {/* 유형 표시 (수정 불가) */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded border border-white/10">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">유형</span>
            <span className="text-white font-bold text-sm ml-2">{type === 'lft' ? 'LFT — 팀 구함' : 'LFP — 선수 구함'}</span>
          </div>

          {/* 포지션 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">
              {type === 'lft' ? '내 포지션' : '모집 포지션'} <span className="text-slate-500 font-normal">(복수 선택 가능)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VAL_ROLES.map((r) => (
                <button key={r} type="button" onClick={() => toggleRole(r)} className={chipCls(roles.includes(r))}>{r}</button>
              ))}
            </div>
          </div>

          {/* 티어 — 드롭다운(내 티어 1개 / 희망 티어 최소~최대 범위) */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">
              {type === 'lft' ? '내 티어' : '희망 티어'}
              {type === 'lfp' && tiers.length > 0 && (
                <span className="text-slate-600 font-normal ml-1 text-xs">{tiers.length}개 범위</span>
              )}
            </label>
            {type === 'lft' ? (
              <select value={tier} onChange={(e) => setTier(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition"
                style={{ colorScheme: 'dark' }}>
                <option value="">티어 선택</option>
                {VAL_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <select value={minTier} onChange={(e) => setMinTier(e.target.value)}
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition"
                  style={{ colorScheme: 'dark' }}>
                  <option value="">최소 티어</option>
                  {VAL_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-slate-500 text-sm shrink-0">~</span>
                <select value={maxTier} onChange={(e) => setMaxTier(e.target.value)}
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition"
                  style={{ colorScheme: 'dark' }}>
                  <option value="">최대 티어</option>
                  {VAL_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* 한마디 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">한마디</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={200}
              placeholder={type === 'lft' ? '스크림 가능 시간, 원하는 팀 분위기 등...' : '팀 소개, 연습 일정 등...'}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition resize-none" />
          </div>

          {/* Discord */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">Discord 태그</label>
            <input value={discordTag} onChange={(e) => setDiscordTag(e.target.value)}
              placeholder="예: username#1234 또는 username"
              className={`w-full bg-white/5 border rounded px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none transition ${
                discordTag && !DISCORD_REGEX.test(discordTag)
                  ? 'border-red-500/60 focus:border-red-500'
                  : 'border-white/10 focus:border-[#00D2BE]'
              }`} />
            {discordTag && !DISCORD_REGEX.test(discordTag) && (
              <p className="text-red-400 text-xs mt-1">올바른 형식: username 또는 username#1234</p>
            )}
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-4 py-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-semibold py-3 rounded transition">
            {loading ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      </div>
    </div>
  )
}
