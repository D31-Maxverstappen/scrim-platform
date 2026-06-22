'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VAL_TIERS } from '@/lib/tiers'

const MODE_OPTIONS = [
  { value: 'random', label: '랜덤', desc: '시스템이 무작위로 팀 배정' },
  { value: 'balanced', label: '밸런스', desc: '티어 합산 균등 자동 배정' },
  { value: 'captain', label: '캡틴픽', desc: '방장과 부방장이 번갈아 픽' },
]

export default function CreateRoomForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [mode, setMode] = useState('random')
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [tierMin, setTierMin] = useState('')
  const [tierMax, setTierMax] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    const res = await fetch('/api/inhouse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: title.trim(),
        teamMode: mode,
        maxPlayers,
        tierMin: tierMin || null,
        tierMax: tierMax || null,
        scheduledAt: scheduledAt || null,
        isPrivate,
      }),
    })

    if (res.ok) {
      const { id } = await res.json()
      router.push(`/inhouse/${id}`)
    } else {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* 방 제목 */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">방 제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 골드~플래티넘 내전 구합니다"
          className="w-full bg-[#13131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE]/50 transition"
        />
      </div>

      {/* 팀 구성 방식 */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">팀 구성 방식</label>
        <div className="flex flex-col gap-2">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${
                mode === opt.value
                  ? 'border-[#00D2BE]/50 bg-[#00D2BE]/10'
                  : 'border-white/5 bg-[#13131f] hover:border-white/10'
              }`}
            >
              <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${mode === opt.value ? 'border-[#00D2BE] bg-[#00D2BE]' : 'border-slate-600'}`} />
              <div>
                <p className={`text-sm font-bold ${mode === opt.value ? 'text-[#00D2BE]' : 'text-white'}`}>{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 최대 인원 */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">최대 인원</label>
        <div className="flex gap-2">
          {[6, 8, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMaxPlayers(n)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                maxPlayers === n ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {n}명
            </button>
          ))}
        </div>
      </div>

      {/* 티어 제한 */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">티어 제한 (선택)</label>
        <div className="flex gap-2 items-center">
          <select
            value={tierMin}
            onChange={(e) => setTierMin(e.target.value)}
            className="flex-1 bg-[#13131f] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#00D2BE]/50 transition"
          >
            <option value="">제한 없음</option>
            {VAL_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="text-slate-600 text-xs shrink-0">~</span>
          <select
            value={tierMax}
            onChange={(e) => setTierMax(e.target.value)}
            className="flex-1 bg-[#13131f] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#00D2BE]/50 transition"
          >
            <option value="">제한 없음</option>
            {VAL_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* 희망 시간 */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-2">희망 시간 (선택)</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full bg-[#13131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D2BE]/50 transition"
        />
      </div>

      {/* 비밀방 */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setIsPrivate((p) => !p)}
          className={`w-10 h-5 rounded-full transition relative ${isPrivate ? 'bg-[#00D2BE]' : 'bg-white/10'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isPrivate ? 'left-5' : 'left-0.5'}`} />
        </div>
        <span className="text-sm text-slate-400">비밀방 (링크로만 입장 가능)</span>
      </label>

      <button
        type="submit"
        disabled={!title.trim() || loading}
        className="w-full py-3 rounded-xl text-sm font-bold bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-40 disabled:cursor-not-allowed text-white transition mt-2"
      >
        {loading ? '생성 중...' : '방 만들기'}
      </button>
    </form>
  )
}
