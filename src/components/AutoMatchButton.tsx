'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'waiting' | 'matched'

const TIER_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Iron:       { bg: 'rgba(138,138,138,0.15)', color: '#a0a0a0', border: 'rgba(138,138,138,0.35)' },
  Bronze:     { bg: 'rgba(160,92,41,0.15)',   color: '#cd7f32', border: 'rgba(160,92,41,0.35)'   },
  Silver:     { bg: 'rgba(192,192,192,0.15)', color: '#c0c0c0', border: 'rgba(192,192,192,0.35)' },
  Gold:       { bg: 'rgba(212,168,67,0.15)',  color: '#d4a843', border: 'rgba(212,168,67,0.35)'  },
  Platinum:   { bg: 'rgba(32,196,168,0.15)',  color: '#20c4a8', border: 'rgba(32,196,168,0.35)'  },
  Diamond:    { bg: 'rgba(75,192,232,0.15)',  color: '#4bc0e8', border: 'rgba(75,192,232,0.35)'  },
  Ascendant:  { bg: 'rgba(39,169,94,0.15)',   color: '#27a95e', border: 'rgba(39,169,94,0.35)'   },
  Immortal:   { bg: 'rgba(196,65,60,0.15)',   color: '#e05c5c', border: 'rgba(196,65,60,0.35)'   },
  Radiant:    { bg: 'rgba(240,229,122,0.15)', color: '#f0e57a', border: 'rgba(240,229,122,0.35)' },
}

function getTierStyle(tierAvg: string) {
  const base = tierAvg.split(' ')[0]
  return TIER_COLORS[base] ?? { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' }
}

export default function AutoMatchButton({ teamId, gameType, tierAvg }: { teamId: string; gameType: string; tierAvg?: string | null }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [format, setFormat] = useState<'BO1' | 'BO3' | 'BO5'>('BO3')
  const [server, setServer] = useState<'KR' | 'AS'>('KR')
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sinceRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPollingRef = useRef(false)
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
      if (isPollingRef.current) return  // 이전 요청 진행 중이면 스킵
      isPollingRef.current = true
      try {
        const res = await fetch('/api/matchmaking/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_type: gameType, format, server }),
        })
        const data = await res.json()
        if (data.status === 'matched' && data.matchId) {
          stopTimer()
          setStatus('matched')  // 즉시 폴링 중단
          router.push(`/matches/${data.matchId}`)
        }
      } catch { }
      isPollingRef.current = false
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
        setError(data.error ?? `error (${res.status})`)
      } else if (data.status === 'matched') {
        stopTimer()
        router.push(`/matches/${data.matchId}`)
      } else if (data.status === 'waiting') {
        setStatus('waiting')
        sinceRef.current = Date.now()
        startTimer()
      } else {
        setError(`unknown response: ${JSON.stringify(data)}`)
      }
    } catch (e: any) {
      setError(`error: ${e?.message ?? 'unknown error'}`)
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
    return m > 0 ? `${m}m ${String(sec).padStart(2, '0')}s` : `${sec}s`
  }

  const chip = (active: boolean) =>
    `px-4 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${active ? 'bg-[#00D2BE] text-white shadow-[0_0_10px_rgba(0,210,190,0.5)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`

  // 대기 중
  if (status === 'waiting') {
    return (
      <div className="neon-border-wrap neon-border-glow rounded p-[2px]">
        <div className="relative rounded bg-[#0d1a19] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D2BE]/8 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between px-8 py-7 gap-6">
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <div className="absolute w-16 h-16 rounded-full bg-[#00D2BE]/20 animate-ping" />
                <div className="absolute w-10 h-10 rounded-full bg-[#00D2BE]/10 animate-pulse" />
                <div className="w-4 h-4 rounded-full bg-[#00D2BE] shadow-[0_0_16px_rgba(0,210,190,0.9)]" />
              </div>
              <div>
                <p className="text-white font-black text-xl">상대팀 탐색 중...</p>
                <p className="text-slate-400 text-sm mt-1">
                  <span className="text-[#00D2BE] font-bold text-base">{fmt(elapsed)}</span>
                  {' '}&middot; {format} &middot; {server}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-slate-500 hover:text-red-400 text-sm font-semibold transition px-5 py-2.5 rounded-sm hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 shrink-0"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 기본 상태
  return (
    <div className="neon-border-wrap neon-border-glow rounded p-[2px]">
      <div className="relative rounded bg-[#0d1017] overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D2BE]/5 via-transparent to-[#7B61FF]/5 pointer-events-none" />
        {/* 스캔 라인 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="shimmer absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-[#00D2BE]/6 to-transparent" />
        </div>

        <div className="relative px-8 py-8 flex flex-col gap-6">
          {/* 상단: 아이콘 + 제목 */}
          <div className="flex items-start gap-5">
            <div className="relative w-14 h-14 rounded bg-[#00D2BE]/10 border border-[#00D2BE]/20 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded bg-[#00D2BE]/10 animate-pulse" />
              <svg className="relative w-7 h-7 text-[#00D2BE] drop-shadow-[0_0_8px_rgba(0,210,190,1)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-white font-black text-xl drop-shadow-[0_0_12px_rgba(0,210,190,0.4)]">자동 매칭</p>
                <span className="px-2 py-0.5 bg-[#00D2BE]/10 text-[#00D2BE] text-[10px] font-black rounded-full border border-[#00D2BE]/25 tracking-widest">
                  BETA
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-slate-400 text-sm">조건에 맞는 상대 팀을 자동으로 찾아드려요.</p>
                {tierAvg && (() => {
                  const s = getTierStyle(tierAvg)
                  return (
                    <span className="shrink-0 text-[11px] font-black px-2.5 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      내 팀 평균 {tierAvg}
                    </span>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-white/5" />

          {/* 중간: 설정 옵션 */}
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold tracking-wide">경기 수</span>
              <div className="flex gap-1.5">
                {(['BO1', 'BO3', 'BO5'] as const).map(f => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={chip(format === f)}>{f}</button>
                ))}
              </div>
            </div>
            <div className="w-px h-5 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold tracking-wide">서버</span>
              <div className="flex gap-1.5">
                {(['KR', 'AS'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setServer(s)} className={chip(server === s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 하단: 매칭 버튼 */}
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-[#00D2BE] hover:bg-[#00c4b0] disabled:opacity-50 text-white font-black text-base py-4 rounded transition-all duration-200 shadow-[0_0_24px_rgba(0,210,190,0.4)] hover:shadow-[0_0_40px_rgba(0,210,190,0.65)] hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? '탐색 중...' : '⚡ 매칭 시작'}
          </button>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-2.5 -mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
