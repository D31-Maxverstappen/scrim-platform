'use client'

import { useState, useTransition } from 'react'
import { createScrimAction } from '@/app/actions'

const GAMES = [
  { value: 'valorant', label: 'VALORANT' },
  { value: 'lol', label: 'League of Legends' },
]

export default function PostScrimPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [game, setGame] = useState('valorant')
  const [format, setFormat] = useState<'BO1' | 'BO3' | 'BO5'>('BO3')
  const [server, setServer] = useState<'KR' | 'AS'>('KR')

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [hour, setHour] = useState('8')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmpm] = useState<'오전' | '오후'>('오후')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!date) { setError('희망 날짜를 선택해주세요.'); return }
    setError('')

    let h = parseInt(hour)
    if (ampm === '오전' && h === 12) h = 0
    if (ampm === '오후' && h !== 12) h += 12
    const time = `${String(h).padStart(2, '0')}:${minute}`

    if (new Date(`${date}T${time}:00`) < new Date()) {
      setError('현재 시간보다 과거는 선택할 수 없어요.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('game_type', game)
    formData.set('preferred_date', date)
    formData.set('preferred_time', time)
    formData.set('format', format)
    formData.set('server', server)

    startTransition(async () => {
      const result = await createScrimAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <a href="/scrims" className="text-slate-500 text-sm hover:text-slate-300 transition">← 뒤로</a>
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
              {/* 오전/오후 토글 */}
              <div className="flex rounded overflow-hidden border border-white/10 shrink-0">
                {(['오전', '오후'] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setAmpm(v)}
                    className={`px-4 py-3 text-sm font-bold transition ${ampm === v ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                    {v}
                  </button>
                ))}
              </div>
              {/* 시 */}
              <select value={hour} onChange={(e) => setHour(e.target.value)}
                className="flex-1 bg-[#1e1e2e] border border-white/10 rounded px-3 py-3 text-white text-sm focus:outline-none focus:border-[#00D2BE] transition">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h} className="bg-[#1e1e2e] text-white">{h}시</option>
                ))}
              </select>
              {/* 분 */}
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
