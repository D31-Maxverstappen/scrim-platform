'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { rankIcon } from '@/lib/valorantRanks'

// 반응 속도 테스트(humanbenchmark 스타일) — 빨강 대기 → 무작위 후 초록 → 클릭까지의 ms 측정.
// 5회 1세션, 5개 평균을 사용자 평균으로 제시. 초록 전 클릭은 '부정출발'(횟수 미차감).

type Phase = 'idle' | 'waiting' | 'ready' | 'early' | 'result' | 'done'

const ROUNDS = 5

// 티어별 평균 반응속도 — D31 자체 참고치(공식 아님). 레벨3 마크만 사용.
const TIER_BENCHMARKS = [
  { slug: 'radiant', label: '레디언트', ms: 140 },
  { slug: 'immortal3', label: '불멸 3', ms: 150 },
  { slug: 'diamond3', label: '다이아몬드 3', ms: 165 },
  { slug: 'ascendant3', label: '초월자 3', ms: 180 },
  { slug: 'platinum3', label: '플래티넘 3', ms: 200 },
  { slug: 'gold3', label: '골드 3', ms: 220 },
  { slug: 'silver3', label: '실버 3', ms: 245 },
  { slug: 'bronze3', label: '브론즈 3', ms: 270 },
  { slug: 'iron3', label: '아이언 3', ms: 300 },
]

// 평균 ms → 도달 티어(빠를수록 상위). 어느 티어보다 느리면 null.
const tierFor = (avg: number) => TIER_BENCHMARKS.find((t) => avg <= t.ms) ?? null

const PHASE_UI: Record<Phase, { bg: string; fg: string; title: string; sub: string }> = {
  idle: { bg: '#13131f', fg: '#e2e8f0', title: '반응 속도 테스트', sub: `초록색으로 바뀌면 최대한 빨리 클릭하세요. 총 ${ROUNDS}회 측정합니다. 시작하려면 클릭.` },
  waiting: { bg: '#ff4655', fg: '#fff', title: '기다리세요…', sub: '초록색이 되는 순간 클릭!' },
  ready: { bg: '#22c55e', fg: '#04342c', title: '클릭!', sub: '지금이에요' },
  early: { bg: '#1e1e2e', fg: '#ff4655', title: '너무 빨랐어요! 부정출발', sub: '초록색이 될 때까지 기다려야 해요. (이번 회차는 차감되지 않아요) 클릭해서 다시.' },
  result: { bg: '#04342c', fg: '#fff', title: '', sub: '' },
  done: { bg: '#04342c', fg: '#fff', title: '', sub: '' },
}

const grade = (ms: number) =>
  ms < 180 ? '프로급 ⚡' : ms < 230 ? '아주 빠름' : ms < 280 ? '평균 이상' : ms < 350 ? '평균' : '연습이 필요해요'

export default function ReactionTest() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [ms, setMs] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number[]>([])
  const timer = useRef<number | undefined>(undefined)
  const greenAt = useRef(0)
  const phaseRef = useRef<Phase>('idle')
  const attemptsRef = useRef<number[]>([])

  const go = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  const startWait = useCallback(() => {
    window.clearTimeout(timer.current)
    setMs(null)
    go('waiting')
    const delay = 1500 + Math.random() * 3500 // 1.5~5.0s
    timer.current = window.setTimeout(() => {
      greenAt.current = performance.now()
      go('ready')
    }, delay)
  }, [go])

  const resetSession = useCallback(() => {
    attemptsRef.current = []
    setAttempts([])
  }, [])

  const handle = useCallback(() => {
    const p = phaseRef.current
    if (p === 'waiting') {
      window.clearTimeout(timer.current)
      go('early')
      return
    }
    if (p === 'ready') {
      const t = Math.round(performance.now() - greenAt.current)
      attemptsRef.current = [...attemptsRef.current, t]
      setAttempts(attemptsRef.current)
      setMs(t)
      go(attemptsRef.current.length >= ROUNDS ? 'done' : 'result')
      return
    }
    if (p === 'done') {
      resetSession()
      startWait()
      return
    }
    // idle · early · result → 다음 회차
    startWait()
  }, [go, startWait, resetSession])

  // 스페이스바·엔터로도 동작(스크롤 방지)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handle])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const ui = PHASE_UI[phase]
  const best = attempts.length ? Math.min(...attempts) : null
  const avg = attempts.length ? Math.round(attempts.reduce((s, v) => s + v, 0) / attempts.length) : null
  const doneTier = phase === 'done' && avg !== null ? tierFor(avg) : null
  const round = Math.min(attempts.length + (phase === 'result' || phase === 'done' ? 0 : 1), ROUNDS)

  return (
    <div className="flex gap-6 items-start flex-col lg:flex-row">
      {/* 좌: 테스트 */}
      <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
        <button
          onClick={handle}
          className="w-full select-none rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{ background: ui.bg, color: ui.fg, height: 400 }}
        >
          {phase === 'done' && avg !== null ? (
            <>
              <div className="text-sm font-bold opacity-70">{ROUNDS}회 평균</div>
              <div className="text-6xl font-black tracking-tight">{avg}<span className="text-2xl font-bold ml-1">ms</span></div>
              <div className="text-sm font-bold opacity-90">{grade(avg)}{doneTier ? ` · ${doneTier.label} 수준` : ' · 아이언 3 미만'}</div>
              <div className="text-xs opacity-70 mt-1">클릭해서 새 세션 시작</div>
            </>
          ) : phase === 'result' && ms !== null ? (
            <>
              <div className="text-sm font-bold opacity-70">{attempts.length}/{ROUNDS}회</div>
              <div className="text-6xl font-black tracking-tight">{ms}<span className="text-2xl font-bold ml-1">ms</span></div>
              <div className="text-sm font-bold opacity-90">{grade(ms)}</div>
              <div className="text-xs opacity-70 mt-1">클릭해서 다음 회차</div>
            </>
          ) : (
            <>
              <div className="text-3xl sm:text-4xl font-black tracking-tight">{ui.title}</div>
              <div className="text-sm opacity-90 px-6 text-center">{ui.sub}</div>
              {phase !== 'idle' && phase !== 'early' && <div className="text-xs opacity-70">{round}/{ROUNDS}회차</div>}
              {phase === 'ready' && <div className="text-xs opacity-70">(또는 스페이스바)</div>}
            </>
          )}
        </button>

        {/* 진행 점 */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full transition ${i < attempts.length ? 'bg-[#00D2BE]' : 'bg-white/15'}`} />
          ))}
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '진행', value: `${attempts.length}/${ROUNDS}` },
            { label: '평균', value: avg !== null ? `${avg} ms` : '—' },
            { label: '최고', value: best !== null ? `${best} ms` : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-[#13131f] border border-white/5 px-4 py-3 text-center">
              <div className="text-[11px] text-slate-500 font-bold mb-1">{s.label}</div>
              <div className="text-lg font-black text-[#00D2BE]">{s.value}</div>
            </div>
          ))}
        </div>

        {attempts.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-500 font-bold">이번 세션</span>
            {attempts.map((t, i) => (
              <span key={i} className="text-xs text-slate-300 bg-white/5 rounded px-2 py-0.5">{t}</span>
            ))}
            <button onClick={() => { window.clearTimeout(timer.current); resetSession(); setMs(null); go('idle') }} className="ml-auto text-[11px] text-slate-500 hover:text-white transition">초기화</button>
          </div>
        )}

        <p className="text-[11px] text-slate-600">빨간 화면에서 대기 → 초록으로 바뀌면 즉시 클릭. {ROUNDS}회 측정 후 평균이 당신의 기록이에요. 초록 전 클릭은 부정출발(차감 없음).</p>
      </div>

      {/* 우: 티어별 반응속도 참고표 */}
      <aside className="w-full lg:w-56 shrink-0 rounded-xl bg-[#13131f] border border-white/5 p-3">
        <div className="text-xs font-bold text-slate-300 mb-0.5">티어별 평균 반응속도</div>
        <div className="text-[10px] text-slate-600 mb-3">D31 참고치 · 공식 아님</div>
        <div className="flex flex-col gap-1">
          {TIER_BENCHMARKS.map((t) => {
            const hit = doneTier?.slug === t.slug
            return (
              <div key={t.slug} className={`flex items-center gap-2 px-2 py-1.5 rounded transition ${hit ? 'bg-[#00D2BE]/15 ring-1 ring-[#00D2BE]' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rankIcon(t.slug) ?? ''} alt={t.label} className="w-6 h-6 object-contain shrink-0" />
                <span className={`text-xs flex-1 ${hit ? 'text-[#00D2BE] font-bold' : 'text-slate-300'}`}>{t.label}</span>
                <span className={`text-xs font-bold ${hit ? 'text-[#00D2BE]' : 'text-slate-500'}`}>{t.ms}ms</span>
              </div>
            )
          })}
        </div>
        {doneTier && <div className="mt-3 text-[11px] text-slate-400 leading-relaxed">당신의 평균은 <b className="text-[#00D2BE]">{doneTier.label}</b> 수준이에요.</div>}
      </aside>
    </div>
  )
}
