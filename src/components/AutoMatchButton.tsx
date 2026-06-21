'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n'

type Status = 'idle' | 'waiting' | 'matched'

export default function AutoMatchButton({ teamId, gameType }: { teamId: string; gameType: string }) {
  const router = useRouter()
  const { lang } = useLang()
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
    `px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${active ? 'bg-[#00D2BE] text-white shadow-[0_0_10px_rgba(0,210,190,0.5)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`

  // 대기 중
  if (status === 'waiting') {
    return (
      <div className="neon-border-wrap neon-border-glow rounded-xl p-[2px]">
        <div className="relative rounded-xl bg-[#0d1a19] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D2BE]/8 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between px-8 py-7 gap-6">
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <div className="absolute w-16 h-16 rounded-full bg-[#00D2BE]/20 animate-ping" />
                <div className="absolute w-10 h-10 rounded-full bg-[#00D2BE]/10 animate-pulse" />
                <div className="w-4 h-4 rounded-full bg-[#00D2BE] shadow-[0_0_16px_rgba(0,210,190,0.9)]" />
              </div>
              <div>
                <p className="text-white font-black text-xl">{t('auto_match_waiting', lang)}</p>
                <p className="text-slate-400 text-sm mt-1">
                  <span className="text-[#00D2BE] font-bold text-base">{fmt(elapsed)}</span>
                  {' '}&middot; {format} &middot; {server}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-slate-500 hover:text-red-400 text-sm font-semibold transition px-5 py-2.5 rounded-lg hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 shrink-0"
            >
              {t('auto_match_cancel', lang)}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 기본 상태
  return (
    <div className="neon-border-wrap neon-border-glow rounded-xl p-[2px]">
      <div className="relative rounded-xl bg-[#0d1017] overflow-hidden">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D2BE]/5 via-transparent to-[#7B61FF]/5 pointer-events-none" />
        {/* 스캔 라인 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="shimmer absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-[#00D2BE]/6 to-transparent" />
        </div>

        <div className="relative px-8 py-8 flex flex-col gap-6">
          {/* 상단: 아이콘 + 제목 */}
          <div className="flex items-start gap-5">
            <div className="relative w-14 h-14 rounded-xl bg-[#00D2BE]/10 border border-[#00D2BE]/20 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-xl bg-[#00D2BE]/10 animate-pulse" />
              <svg className="relative w-7 h-7 text-[#00D2BE] drop-shadow-[0_0_8px_rgba(0,210,190,1)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-white font-black text-xl drop-shadow-[0_0_12px_rgba(0,210,190,0.4)]">{t('auto_match_title', lang)}</p>
                <span className="px-2 py-0.5 bg-[#00D2BE]/10 text-[#00D2BE] text-[10px] font-black rounded-full border border-[#00D2BE]/25 tracking-widest">
                  BETA
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{t('auto_match_desc', lang)}</p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-white/5" />

          {/* 중간: 설정 옵션 */}
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold tracking-wide">{t('auto_match_count', lang)}</span>
              <div className="flex gap-1.5">
                {(['BO1', 'BO3', 'BO5'] as const).map(f => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={chip(format === f)}>{f}</button>
                ))}
              </div>
            </div>
            <div className="w-px h-5 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-bold tracking-wide">{t('auto_match_server', lang)}</span>
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
            className="w-full bg-[#00D2BE] hover:bg-[#00c4b0] disabled:opacity-50 text-white font-black text-base py-4 rounded-xl transition-all duration-200 shadow-[0_0_24px_rgba(0,210,190,0.4)] hover:shadow-[0_0_40px_rgba(0,210,190,0.65)] hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? t('auto_match_searching', lang) : t('auto_match_start', lang)}
          </button>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 -mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
