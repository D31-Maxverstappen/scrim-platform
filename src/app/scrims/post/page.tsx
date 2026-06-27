'use client'
import Link from 'next/link'

import { useState, useTransition } from 'react'
import { createScrimAction } from '@/app/actions'
import { VAL_TIERS } from '@/lib/tiers'
import { toDateInputValue } from '@/lib/datetime'

const GAMES = [
  { value: 'valorant', label: 'VALORANT' },
]

export default function PostScrimPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [game, setGame] = useState('valorant')
  const [format, setFormat] = useState<'BO1' | 'BO3' | 'BO5'>('BO3')
  const [server, setServer] = useState<'KR' | 'AS'>('KR')
  const [tierMin, setTierMin] = useState('')
  const [tierMax, setTierMax] = useState('')

  const today = toDateInputValue()
  const [date, setDate] = useState(today)
  const [hour, setHour] = useState('8')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmpm] = useState<'오전' | '오후'>('오후')

  const availableMax = tierMin ? VAL_TIERS.slice(VAL_TIERS.indexOf(tierMin)) : VAL_TIERS

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!date) { setError('희망 날짜를 선택해주세요.'); return }
    if (tierMin && tierMax && VAL_TIERS.indexOf(tierMin) > VAL_TIERS.indexOf(tierMax)) {
      setError('최소 티어가 최대 티어보다 높을 수 없어요.'); return
    }
    setError('')

    let h = parseInt(hour)
    if (ampm === '오전' && h === 12) h = 0
    if (ampm === '오후' && h !== 12) h += 12
    const time = `${String(h).padStart(2, '0')}:${minute}`

    if (new Date(`${date}T${time}:00+09:00`) < new Date()) {
      setError('현재 시간보다 과거는 선택할 수 없어요.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('game_type', game)
    formData.set('preferred_date', date)
    formData.set('preferred_time', time)
    formData.set('format', format)
    formData.set('server', server)
    formData.set('tier_min', tierMin)
    formData.set('tier_max', tierMax)

    startTransition(async () => {
      const result = await createScrimAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/scrims" className="text-slate-500 text-sm hover:text-slate-300 transition">← 뒤로</Link>
          <h1 className="text-white font-bold text-2xl mt-3">스크림 올리기</h1>
          <p className="text-slate-400 text-sm mt-1">상대 팀을 모집하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e1e2e] border border-white/10 rounded p-6 flex flex-col gap-5">

          {/* 게임 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">게임 *</label>
            <div className="grid grid-cols-2 gap-2">
              {GAMES.map((g) => (
                <button key={g.value} type="button" onClick={() => setGame(g.value)}
                  className={`py-2.5 rounded text-sm font-semibold transition ${game === g.value ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* 날짜 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">희망 날짜 *</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#00D2BE] transition"
            />
          </div>

          {/* 시간 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">희망 시간 *</label>
            <div className="flex items-center gap-2">
              <div className="flex rounded overflow-hidden border border-white/10 shrink-0">
                {(['오전', '오후'] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setAmpm(v)}
                    className={`px-4 py-3 text-sm font-bold transition ${ampm === v ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                    {v}
                  </button>
                ))}
              </div>
              <select value={hour} onChange={(e) => setHour(e.target.value)}
                className="flex-1 bg-[#1e1e2e] border border-white/10 rounded px-3 py-3 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h} className="bg-[#1e1e2e] text-white">{h}시</option>
                ))}
              </select>
              <select value={minute} onChange={(e) => setMinute(e.target.value)}
                className="flex-1 bg-[#1e1e2e] border border-white/10 rounded px-3 py-3 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition">
                {['00', '10', '20', '30', '40', '50'].map((m) => (
                  <option key={m} value={m} className="bg-[#1e1e2e] text-white">{m}분</option>
                ))}
              </select>
            </div>
          </div>

          {/* 경기 수 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">경기 수 *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['BO1', 'BO3', 'BO5'] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={`py-2.5 rounded text-sm font-semibold transition ${format === f ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 서버 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">서버 *</label>
            <div className="grid grid-cols-2 gap-2">
              {(['KR', 'AS'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setServer(s)}
                  className={`py-2.5 rounded text-sm font-semibold transition ${server === s ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {s === 'KR' ? 'KR (한국)' : 'AS (아시아)'}
                </button>
              ))}
            </div>
          </div>

          {/* 상대 팀 티어 조건 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-1">상대 팀 티어 조건</label>
            <p className="text-slate-600 text-xs mb-2">설정하지 않으면 모든 티어에서 신청 가능해요</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-slate-500 text-xs mb-1">최소 티어</p>
                <select
                  value={tierMin}
                  onChange={(e) => { setTierMin(e.target.value); setTierMax('') }}
                  className="w-full bg-[#13131f] border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition">
                  <option value="" className="bg-[#13131f]">제한 없음</option>
                  {VAL_TIERS.map((t) => (
                    <option key={t} value={t} className="bg-[#13131f]">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">최대 티어</p>
                <select
                  value={tierMax}
                  onChange={(e) => setTierMax(e.target.value)}
                  className="w-full bg-[#13131f] border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition">
                  <option value="" className="bg-[#13131f]">제한 없음</option>
                  {availableMax.map((t) => (
                    <option key={t} value={t} className="bg-[#13131f]">{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {(tierMin || tierMax) && (
              <p className="text-[#00D2BE] text-xs mt-1.5">
                {tierMin && tierMax ? `${tierMin} ~ ${tierMax} 팀만 신청 가능` :
                 tierMin ? `${tierMin} 이상 팀만 신청 가능` :
                 `${tierMax} 이하 팀만 신청 가능`}
              </p>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">메모</label>
            <textarea
              name="note"
              placeholder="추가 조건이나 연락 방법 등을 적어주세요 (선택)"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D2BE] transition resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={isPending || !date}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-semibold py-3 rounded transition">
            {isPending ? '올리는 중...' : '스크림 올리기'}
          </button>
        </form>
      </div>
    </div>
  )
}
