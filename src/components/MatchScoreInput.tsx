'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const VAL_MAPS = ['Ascent', 'Bind', 'Breeze', 'Fracture', 'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset', 'Abyss']

function mapCount(format: string) {
  if (format === 'BO5') return 5
  if (format === 'BO1') return 1
  return 3
}

function seriesWins(format: string) {
  if (format === 'BO5') return 3
  if (format === 'BO1') return 1
  return 2
}

type MapState = { map_name: string; t1: string; t2: string }

export default function MatchScoreInput({
  matchId, format, gameType, team1Id, team1Name, team2Id, team2Name, initialMaps,
}: {
  matchId: string
  format: string
  gameType: string
  team1Id: string
  team1Name: string
  team2Id: string
  team2Name: string
  initialMaps: { map_number: number; map_name: string; team1_score: number; team2_score: number }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isVal = gameType === 'valorant'
  const total = mapCount(format)
  const winsNeeded = seriesWins(format)

  const [maps, setMaps] = useState<MapState[]>(() =>
    Array.from({ length: total }, (_, i) => {
      const existing = initialMaps.find((m) => m.map_number === i + 1)
      return {
        map_name: existing?.map_name !== 'TBD' ? (existing?.map_name ?? '') : '',
        t1: existing?.team1_score ? String(existing.team1_score) : '',
        t2: existing?.team2_score ? String(existing.team2_score) : '',
      }
    })
  )

  const set = (i: number, key: keyof MapState, val: string) =>
    setMaps((prev) => prev.map((m, idx) => idx === i ? { ...m, [key]: val } : m))

  // 현재 입력 기준 시리즈 상태 계산
  const t1Wins = maps.filter((m) => {
    const t1 = parseInt(m.t1 || '0')
    const t2 = parseInt(m.t2 || '0')
    return isVal ? t1 > t2 : t1 === 1
  }).length
  const t2Wins = maps.filter((m) => {
    const t1 = parseInt(m.t1 || '0')
    const t2 = parseInt(m.t2 || '0')
    return isVal ? t2 > t1 : t2 === 1
  }).length

  const projectedWinner =
    t1Wins >= winsNeeded ? team1Name :
    t2Wins >= winsNeeded ? team2Name : null

  const mapsPlayed = maps.filter((m) => m.t1 !== '' || m.t2 !== '').length

  const handleSubmit = async () => {
    if (mapsPlayed === 0) { setError('최소 1맵 결과를 입력해주세요.'); return }
    setError('')
    setLoading(true)

    const payload = maps.slice(0, mapsPlayed).map((m, i) => ({
      map_number: i + 1,
      map_name: m.map_name || (isVal ? 'Unknown' : `Map ${i + 1}`),
      team1_score: parseInt(m.t1 || '0'),
      team2_score: parseInt(m.t2 || '0'),
    }))

    const res = await fetch(`/api/matches/${matchId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maps: payload }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      router.refresh()
      setOpen(false)
    } else {
      setError(data.error ?? '오류가 발생했어요')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold px-4 py-2 bg-[#00D2BE]/10 text-[#00D2BE] hover:bg-[#00D2BE]/20 border border-[#00D2BE]/20 hover:border-[#00D2BE]/40 transition rounded"
      >
        결과 입력
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#13131f] border border-white/10 rounded w-full max-w-lg shadow-2xl overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-sm">결과 입력</h2>
            <p className="text-slate-500 text-xs mt-0.5">{team1Name} vs {team2Name} · {format}</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition text-xl leading-none">×</button>
        </div>

        {/* 맵별 입력 */}
        <div className="px-6 py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {maps.map((m, i) => {
            const t1 = parseInt(m.t1 || '0')
            const t2 = parseInt(m.t2 || '0')
            const hasResult = m.t1 !== '' || m.t2 !== ''
            const t1win = hasResult && t1 > t2
            const t2win = hasResult && t2 > t1

            return (
              <div key={i} className={`border rounded p-4 transition ${hasResult ? 'border-white/10' : 'border-white/5'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Map {i + 1}</span>
                  {isVal && (
                    <select
                      value={m.map_name}
                      onChange={(e) => set(i, 'map_name', e.target.value)}
                      className="ml-auto bg-white/5 border border-white/10 text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-[#00D2BE]"
                    >
                      <option value="">맵 선택</option>
                      {VAL_MAPS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  )}
                </div>

                {isVal ? (
                  /* Valorant: 스코어 입력 */
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className={`text-xs font-bold mb-1.5 truncate ${t1win ? 'text-[#00D2BE]' : 'text-slate-400'}`}>{team1Name}</p>
                      <input
                        type="number" min="0" max="30"
                        value={m.t1}
                        onChange={(e) => set(i, 't1', e.target.value)}
                        placeholder="0"
                        className={`w-full bg-white/5 border rounded px-3 py-2.5 text-center text-xl font-black focus:outline-none transition
                          ${t1win ? 'border-[#00D2BE]/40 text-[#00D2BE]' : 'border-white/10 text-white focus:border-[#00D2BE]/40'}`}
                      />
                    </div>
                    <span className="text-slate-700 font-bold text-lg pt-5">—</span>
                    <div className="flex-1">
                      <p className={`text-xs font-bold mb-1.5 truncate text-right ${t2win ? 'text-[#00D2BE]' : 'text-slate-400'}`}>{team2Name}</p>
                      <input
                        type="number" min="0" max="30"
                        value={m.t2}
                        onChange={(e) => set(i, 't2', e.target.value)}
                        placeholder="0"
                        className={`w-full bg-white/5 border rounded px-3 py-2.5 text-center text-xl font-black focus:outline-none transition
                          ${t2win ? 'border-[#00D2BE]/40 text-[#00D2BE]' : 'border-white/10 text-white focus:border-[#00D2BE]/40'}`}
                      />
                    </div>
                  </div>
                ) : (
                  /* LoL: 승/패 버튼 */
                  <div className="flex gap-2">
                    <button
                      onClick={() => { set(i, 't1', m.t1 === '1' ? '' : '1'); set(i, 't2', m.t1 === '1' ? '' : '0') }}
                      className={`flex-1 py-2.5 rounded text-xs font-bold transition ${m.t1 === '1' ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {team1Name} 승
                    </button>
                    <button
                      onClick={() => { set(i, 't2', m.t2 === '1' ? '' : '1'); set(i, 't1', m.t2 === '1' ? '' : '0') }}
                      className={`flex-1 py-2.5 rounded text-xs font-bold transition ${m.t2 === '1' ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {team2Name} 승
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 시리즈 결과 프리뷰 */}
        {mapsPlayed > 0 && (
          <div className="mx-6 mb-4 bg-white/3 border border-white/5 rounded px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-black ${t1Wins > t2Wins ? 'text-white' : 'text-slate-600'}`}>{t1Wins}</span>
              <span className="text-slate-700">:</span>
              <span className={`text-lg font-black ${t2Wins > t1Wins ? 'text-white' : 'text-slate-600'}`}>{t2Wins}</span>
            </div>
            {projectedWinner ? (
              <span className="text-[#00D2BE] text-xs font-bold">🏆 {projectedWinner} 승리</span>
            ) : (
              <span className="text-slate-500 text-xs">진행 중...</span>
            )}
          </div>
        )}

        {/* 에러 + 버튼 */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading || mapsPlayed === 0}
              className="flex-1 bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-40 text-white font-bold py-3 rounded transition text-sm"
            >
              {loading ? '저장 중...' : '결과 저장'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold rounded transition text-sm"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
