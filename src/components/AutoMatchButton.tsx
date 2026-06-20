'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'waiting' | 'matched'

export default function AutoMatchButton({ teamId, gameType }: { teamId: string; gameType: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [format, setFormat] = useState<'BO1' | 'BO3' | 'BO5'>('BO3')
  const [server, setServer] = useState<'KR' | 'AS'>('KR')
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sinceRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase = createClient()

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
        }
      })
  }, [gameType])

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
          router.push(`/matches/${payload.new.match_id}`)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [teamId])

  useEffect(() => { return () => stopTimer() }, [])

  useEffect(() => {
    if (status !== 'waiting') return
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/matchmaking/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_type: gameType, format, server }),
        })
        const data = await res.json()
        if (data.status === 'matched' && data.matchId) {
          stopTimer()
          router.push(`/matches/${data.matchId}`)
        }
      } catch { }
    }, 5000)
    return () => clearInterval(poll)
  }, [status, gameType, format, server])

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
        stopTimer()
        router.push(`/matches/${data.matchId}`)
      } else if (data.status === 'waiting') {
        setStatus('waiting')
        sinceRef.current = Date.now()
        startTimer()
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
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}분 ${String(sec).padStart(2, '0')}초` : `${sec}초`
  }

  const chip = (active: boolean) =>
    `px-3 py-1 text-xs font-bold rounded transition cursor-pointer ${active ? 'bg-[#00D2BE] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`

  // 대기 중
  if (status === 'waiting') {
    return (
      <div className="relative rounded-lg overflow-hidden border border-[#00D2BE]/25 bg-[#0d1a19]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00D2BE]/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
              <div className="absolute w-11 h-11 rounded-full bg-[#00D2BE]/20 animate-ping" />
              <div className="w-3 h-3 rounded-full bg-[#00D2BE]" />
            </div>
            <div>
              <p className="text-white font-black text-base">상대팀 탐색 중...</p>
              <p className="text-slate-400 text-sm mt-0.5">
                <span className="text-[#00D2BE] font-bold">{fmt(elapsed)}</span> 대기 중 &middot; {format} &middot; {server} 서버
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-500 hover:text-red-400 text-sm font-semibold transition px-4 py-2 rounded hover:bg-red-500/10"
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  // 기본 상태
  return (
    <div className="rounded-lg overflow-hidden border border-white/5 bg-[#13131f]">
      <div className="flex items-center justify-between px-6 py-5 gap-6">
        {/* 좌측: 타이틀 */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#00D2BE]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#00D2BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-sm">자동 매칭</p>
            <p className="text-slate-500 text-xs mt-0.5">같은 서버·포맷의 팀을 자동으로 찾아드려요</p>
          </div>
        </div>

        {/* 우측: 설정 + 버튼 */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 shrink-0">포맷</span>
              <div className="flex gap-1">
                {(['BO1', 'BO3', 'BO5'] as const).map(f => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={chip(format === f)}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 shrink-0">서버</span>
              <div className="flex gap-1">
                {(['KR', 'AS'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setServer(s)} className={chip(server === s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="bg-[#00D2BE] hover:bg-[#00b8a8] disabled:opacity-50 text-white font-black text-sm px-6 py-2.5 rounded-lg transition shrink-0"
          >
            {loading ? '탐색 중...' : '매칭 시작'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border-t border-red-500/20 px-6 py-2">{error}</p>
      )}
    </div>
  )
}
