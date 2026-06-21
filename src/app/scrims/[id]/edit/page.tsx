'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ScrimEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [format, setFormat] = useState<'BO1' | 'BO3' | 'BO5'>('BO3')
  const [server, setServer] = useState<'KR' | 'AS'>('KR')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hour, setHour] = useState('8')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmpm] = useState<'오전' | '오후'>('오후')

  const supabase = createClient()

  useEffect(() => {
    supabase.from('scrim_posts').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) { router.replace('/scrims'); return }
      setFormat(data.format ?? 'BO3')
      setServer(data.server ?? 'KR')
      if (data.preferred_date) {
        const d = new Date(data.preferred_date)
        setDate(d.toISOString().split('T')[0])
        const localHour = d.getHours()
        const h12 = localHour % 12 || 12
        setHour(String(h12))
        setAmpm(localHour < 12 ? '오전' : '오후')
        const mins = String(d.getMinutes()).padStart(2, '0')
        const MINUTES = ['00', '10', '20', '30', '40', '50']
        setMinute(MINUTES.includes(mins) ? mins : '00')
      }
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) { setError('날짜를 선택해주세요.'); return }
    setError('')
    setSaving(true)

    let h = parseInt(hour)
    if (ampm === '오전' && h === 12) h = 0
    if (ampm === '오후' && h !== 12) h += 12
    const preferred_date = `${date}T${String(h).padStart(2, '0')}:${minute}:00`

    const res = await fetch(`/api/scrims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferred_date, format, server }),
    })
    setSaving(false)
    if (res.ok) router.push(`/scrims/${id}`)
    else {
      const data = await res.json()
      setError(data.error ?? '저장에 실패했어요.')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#00D2BE] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <a href={`/scrims/${id}`} className="text-slate-500 text-sm hover:text-slate-300 transition">← 뒤로</a>
          <h1 className="text-white font-bold text-2xl mt-3">스크림 수정</h1>
          <p className="text-slate-400 text-sm mt-1">일정, 경기 수, 서버를 변경할 수 있어요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e1e2e] border border-white/10 rounded p-6 flex flex-col gap-5">

          {/* 날짜 */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">희망 날짜 *</label>
            <input
              type="date"
              value={date}
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

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={saving || !date}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white font-semibold py-3 rounded transition">
            {saving ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      </div>
    </div>
  )
}
