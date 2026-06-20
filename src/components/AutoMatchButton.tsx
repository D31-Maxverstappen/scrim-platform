'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'waiting' | 'matched'

export default function AutoMatchButton({ teamId, gameType }: { teamId: string; gameType: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [matchId, setMatchId] = useState<string | null>(null)
  const [format, setFormat] = useState<'BO1' | 'BO3' | 'BO5'>('BO3')
  const [server, setServer] = useState<'KR' | 'AS'>('KR')
  const [expanded, setExpanded] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sinceRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const supabase = createClient()

  // 페이지 로드 시 현재 상태 확인
  useEffect(() => {
    fetch(`/api/matchmaking/status?game_type=${gameType}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'waiting') {
          setStatus('waiting')
          setFormat(data.format ?? 'BO3')
          setServer(data.server ?? 'KR')
          sinceRef.current = new Date(data.since).getTime()
          startTimer()
        } else if (data.status === 'matched' && data.matchId) {
          setStatus('matched')
          setMatchId(data.matchId)
        }
      })
  }, [gameType])

  // Realtime: matchmaking_queue 내 팀 row 변화 감지
  useEffect(() => {
    const channel = supabase
      .channel(`matchmaking:${teamId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matchmaking_queue',
        filter: `team_id=eq.${teamId}`,
      }, (payload) => {
        if (payload.new.status === 'matched') {
          stopTimer()
          setStatus('matched')
          setMatchId(payload.new.match_id)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [teamId])

  // 대기 타이머
  useEffect(() => {
    return () => stopTimer()
  }, [])

  // 폴링: 'waiting' 상태일 때 5초마다 상태 확인 (Realtime 백업)
  useEffect(() => {
    if (status !== 'waiting') return
    const poll = setInterval(async () => {
      const res = await fetch(`/api/matchmaking/status?game_type=${gameType}`)
      const data = await res.json()
      if (data.status === 'matched' && data.matchId) {
        stopTimer()
        setStatus('matched')
        setMatchId(data.matchId)
      }
    }, 5000)
    return () => clearInterval(poll)
  }, [status, gameType])

  const startTimer = () => {
    if (timerRef.current) return
    sinceRef.current = sinceRef.current ?? Date.now()
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sinceRef.current!) / 1000))
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setElapsed(0)
    sinceRef.current = null
  }

  const handleJoin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/matchmaking/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_type: gameType, format, server }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? `오류 (${res.status})`)
      } else if (data.status === 'matched') {
        setStatus('matched')
        setMatchId(data.matchId)
      } else if (data.status === 'waiting') {
        setStatus('waiting')
        sinceRef.current = Date.now()
        startTimer()
        setExpanded(false)
      } else {
        setError(`알 수 없는 응답: ${JSON.stringify(data)}`)
      }
    } catch (e: any) {
      setError(`오류: ${e?.message ?? '알 수 없는 오류'}`)
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    await fetch('/api/matchmaking/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_type: gameType }),
    })
    stopTimer()
    setStatus('idle')
    setExpanded(false)
  }

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}분 ${sec}초` : `${sec}초`
  }

  const smChip = (active: boolean) =>
    `px-2.5 py-1 text-[10px] font-bold rounded transition ${active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`

  // 매칭 완료
  if (status === 'matched') {
    return (
      <div className="bg-[#00D2BE]/10 border border-[#00D2BE]/30 rounded px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#00D2BE] text-xs font-black">매칭 완료!</p>
            <p className="text-slate-400 text-[10px] mt-0.5">상대팀이 찾아졌어요</p>
          </div>
          <button
            onClick={() => router.push(`/matches/${matchId}`)}
            className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-xs font-bold px-3 py-1.5 rounded transition">
            매치 보기 →
          </button>
        </div>
      </div>
    )
  }

  // 대기 중
  if (status === 'waiting') {
    return (
      <div className="bg-[#13131f] border border-[#00D2BE]/20 rounded px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] animate-pulse" />
            <div>
              <p className="text-white text-xs font-bold">매칭 중...</p>
              <p className="text-slate-500 text-[10px]">{formatElapsed(elapsed)} 대기 중 · {format} · {server}</p>
            </div>
          </div>
          <button onClick={handleCancel} className="text-slate-500 hover:text-red-400 text-[10px] font-semibold transition shrink-0">취소</button>
        </div>
      </div>
    )
  }

  // 기본 상태
  return (
    <div className="bg-[#13131f] border border-white/5 rounded overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition"
      >
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#00D2BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-white text-xs font-bold">자동 매칭</p>
          <p className="text-slate-500 text-[10px]">비슷한 티어 자동 탐색</p>
        </div>
        <span className={`text-slate-600 text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {error && (
        <p className="text-red-400 text-[10px] bg-red-500/10 border-t border-red-500/20 px-4 py-2">{error}</p>
      )}

      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 w-8 shrink-0">포맷</span>
            <div className="flex gap-1">
              {(['BO1', 'BO3', 'BO5'] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFormat(f)} className={smChip(format === f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 w-8 shrink-0">서버</span>
            <div className="flex gap-1">
              {(['KR', 'AS'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setServer(s)} className={smChip(server === s)}>{s}</button>
              ))}
            </div>
          </div>
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-[#00D2BE] hover:bg-[#00a896] disabled:opacity-50 text-white text-xs font-bold py-2 rounded transition mt-1"
          >
            {loading ? '탐색 중...' : '매칭 시작'}
          </button>
        </div>
      )}
    </div>
  )
}
