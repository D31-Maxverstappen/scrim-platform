'use client'

import { useState } from 'react'
import { getTeamStatsMock, type TeamStats } from '@/lib/teamStatsMock'

// 팀 통계 대시보드 (유료 Pro 기능 — 목업 시연용).
// 데이터는 lib/teamStatsMock 에서 생성(결정적). 라이엇 데이터/스크림 축적 후 실집계로 교체.
// 순수 프레젠테이션 — 차트는 의존성 없이 SVG/CSS 로 직접 그린다.
// 무료/Pro 토글은 시연용(실제 구독 연동 전) — 잠금 연출을 두 상태로 보여주기 위함.

const TEAL = '#00D2BE'
const LOSS = '#ff4655'

const ROLE_COLOR: Record<string, string> = {
  타격대: '#ff4655',
  척후대: '#f59e0b',
  감시자: '#22d3ee',
  전략가: '#a78bfa',
}

export default function TeamStatsDashboard({ teamId, teamName }: { teamId: string; teamName: string }) {
  const s = getTeamStatsMock(teamId, teamName)
  const [isPro, setIsPro] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <ProBanner isPro={isPro} onToggle={setIsPro} />
      <KpiRow s={s} />

      {isPro ? (
        <>
          <TrendChart s={s} />
          <div className="grid grid-cols-2 gap-6 max-[820px]:grid-cols-1">
            <SideWinrate s={s} />
            <KeyMetrics s={s} />
          </div>
          <div className="grid grid-cols-2 gap-6 max-[820px]:grid-cols-1">
            <EconomyWinrate s={s} />
            <FirstBloodImpact s={s} />
          </div>
          <div className="grid grid-cols-2 gap-6 max-[820px]:grid-cols-1">
            <FormatBreakdown s={s} />
            <MapWinrates s={s} />
          </div>
          <Head2Head s={s} />
          <PlayerStats s={s} />
        </>
      ) : (
        <LockedTeaser s={s} onUnlock={() => setIsPro(true)} />
      )}
    </div>
  )
}

// ── 공통 카드 ──
function Card({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#13131f] border border-white/5 rounded">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#00D2BE] bg-[#00D2BE]/10 tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function ProBanner({ isPro, onToggle }: { isPro: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded border border-[#00D2BE]/30 bg-[#00D2BE]/[0.06]">
      <span className="text-xs font-black px-2 py-1 rounded bg-[#00D2BE] text-[#04342c] tracking-widest shrink-0">PRO</span>
      <p className="text-sm text-slate-300 flex-1 min-w-0">
        팀 통계 대시보드 — <span className="text-white font-semibold">Pro 구독</span> 팀 전용 심층 분석.
        <span className="text-slate-500"> 무료 팀은 기본 전적까지 표시됩니다.</span>
      </p>
      {/* 시연용 토글 — 무료/Pro 두 상태를 직접 비교 */}
      <div className="flex shrink-0 rounded overflow-hidden border border-white/10 text-xs font-bold">
        <button
          onClick={() => onToggle(false)}
          className={`px-3 py-1.5 transition ${!isPro ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          무료
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`px-3 py-1.5 transition ${isPro ? 'bg-[#00D2BE] text-[#04342c]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Pro
        </button>
      </div>
    </div>
  )
}

// ── 무료 잠금 연출 (위는 또렷 → 아래로 갈수록 흐림·암전 그라데이션) ──
function LockedTeaser({ s, onUnlock }: { s: TeamStats; onUnlock: () => void }) {
  const chips = ['승률 추이', '사이드별 승률', '포맷·맵 분석', '상대별 전적', '선수별 스탯', '핵심 교전 지표']
  // 아주 살짝(위 6%)만 또렷, 곧바로 진해지는 마스크
  const fadeMask = 'linear-gradient(to bottom, transparent 0%, transparent 6%, black 34%)'
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/5" style={{ maxHeight: 560 }}>
      {/* 실제 콘텐츠 — 위는 또렷, 블러는 오버레이가 아래로 갈수록 입힌다 */}
      <div className="flex flex-col gap-6 pointer-events-none select-none" aria-hidden="true">
        <TrendChart s={s} />
        <div className="grid grid-cols-2 gap-6 max-[820px]:grid-cols-1">
          <SideWinrate s={s} />
          <KeyMetrics s={s} />
        </div>
        <div className="grid grid-cols-2 gap-6 max-[820px]:grid-cols-1">
          <EconomyWinrate s={s} />
          <FirstBloodImpact s={s} />
        </div>
      </div>

      {/* 블러 레이어 — 마스크로 아래로 갈수록 강하게 적용 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(9px)',
          WebkitBackdropFilter: 'blur(9px)',
          maskImage: fadeMask,
          WebkitMaskImage: fadeMask,
        }}
      />
      {/* 암전 레이어 — 위는 투명, 곧바로 까맣게 (틸 글로우 한 점) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 5%, rgba(10,10,10,0.6) 26%, rgba(10,10,10,0.96) 50%, #0a0a0a 70%), radial-gradient(80% 50% at 50% 100%, rgba(0,210,190,0.12), transparent 70%)',
        }}
      />

      {/* 잠금 카드 — 가장 어두운 하단에 고정 */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-8">
        <div className="max-w-md w-full text-center">
          <span className="inline-block text-[11px] font-black px-2.5 py-1 rounded-full bg-[#00D2BE]/15 text-[#00D2BE] tracking-widest mb-4">
            PRO 전용
          </span>
          <div
            className="w-14 h-14 mx-auto mb-3.5 flex items-center justify-center rounded-full bg-[#00D2BE]/10 border border-[#00D2BE]/30"
            style={{ boxShadow: '0 0 30px rgba(0,210,190,0.35)' }}
          >
            <svg className="w-7 h-7" fill="none" stroke={TEAL} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <p className="text-white font-black text-xl mb-1.5">심층 통계가 잠겨 있어요</p>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            우리 팀의 모든 데이터를 한눈에.<br />Pro 구독으로 지금 바로 열어보세요.
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 mb-5">
            {chips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-400"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {c}
              </span>
            ))}
          </div>

          <button
            onClick={onUnlock}
            className="w-full max-w-xs mx-auto block py-3 rounded-lg bg-[#00D2BE] text-[#04342c] text-sm font-black hover:opacity-90 transition"
            style={{ boxShadow: '0 8px 24px -6px rgba(0,210,190,0.5)' }}
          >
            Pro 구독하고 잠금 해제
          </button>
          <p className="text-slate-500 text-[11px] mt-2.5">월 4,900원 · 첫 달 무료 · 언제든 해지</p>
        </div>
      </div>
    </div>
  )
}

// ── KPI 타일 ──
function KpiRow({ s }: { s: TeamStats }) {
  return (
    <div className="grid grid-cols-4 gap-3 max-[680px]:grid-cols-2">
      <div className="bg-[#13131f] border border-white/5 rounded p-4">
        <p className="text-xs text-slate-500 mb-1">승률</p>
        <p className="text-2xl font-black" style={{ color: TEAL }}>{s.winrate}%</p>
        <div className="flex gap-1 mt-2">
          {s.recentForm.map((r, i) => (
            <span
              key={i}
              className="w-4 h-4 flex items-center justify-center text-[10px] font-black rounded-sm"
              style={r === 'W' ? { color: '#04342c', background: TEAL } : { color: '#fff', background: LOSS }}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#13131f] border border-white/5 rounded p-4">
        <p className="text-xs text-slate-500 mb-1">전적</p>
        <p className="text-2xl font-black text-white">
          {s.wins}<span className="text-slate-600 text-lg">–</span>{s.losses}
        </p>
        <p className="text-xs text-slate-500 mt-2">총 {s.totalScrims}스크림</p>
      </div>

      <div className="bg-[#13131f] border border-white/5 rounded p-4">
        <p className="text-xs text-slate-500 mb-1">평균 라운드 득실</p>
        <p className="text-2xl font-black" style={{ color: s.avgMargin >= 0 ? TEAL : LOSS }}>
          {s.avgMargin >= 0 ? '+' : ''}{s.avgMargin}
        </p>
        <p className="text-xs text-slate-500 mt-2">매치당 평균</p>
      </div>

      <div className="bg-[#13131f] border border-white/5 rounded p-4">
        <p className="text-xs text-slate-500 mb-1">현재 흐름</p>
        <p className="text-2xl font-black" style={{ color: s.streak.type === 'W' ? TEAL : LOSS }}>
          {s.streak.count}{s.streak.type === 'W' ? '연승' : '연패'}
        </p>
        <p className="text-xs text-slate-500 mt-2">최근 6경기 기준</p>
      </div>
    </div>
  )
}

// ── 승률 추이 (SVG 라인) ──
function TrendChart({ s }: { s: TeamStats }) {
  const W = 600, H = 180
  const padL = 12, padR = 12, padT = 16, padB = 28
  const n = s.trend.length
  const x = (i: number) => padL + (i * (W - padL - padR)) / (n - 1)
  const y = (wr: number) => padT + (1 - wr / 100) * (H - padT - padB)
  const pts = s.trend.map((p, i) => `${x(i)},${y(p.winrate)}`)
  const line = pts.join(' ')
  const area = `${padL},${H - padB} ${line} ${W - padR},${H - padB}`

  return (
    <Card title="승률 추이" badge="최근 6개월">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }} preserveAspectRatio="none">
        <line x1={padL} y1={y(50)} x2={W - padR} y2={y(50)} stroke="#ffffff14" strokeDasharray="3 4" />
        <text x={W - padR} y={y(50) - 4} fill="#475569" fontSize="11" textAnchor="end">50%</text>
        <polygon points={area} fill={TEAL} opacity="0.08" />
        <polyline points={line} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {s.trend.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.winrate)} r="4" fill="#0a0a0a" stroke={TEAL} strokeWidth="2.5" />
            <text x={x(i)} y={y(p.winrate) - 10} fill="#cbd5e1" fontSize="11" fontWeight="700" textAnchor="middle">{p.winrate}</text>
            <text x={x(i)} y={H - 8} fill="#64748b" fontSize="11" textAnchor="middle">{p.label}</text>
          </g>
        ))}
      </svg>
    </Card>
  )
}

// ── 공격·수비 승률 ──
function SideWinrate({ s }: { s: TeamStats }) {
  const rows = [
    { label: '공격', value: s.advanced.attackWinrate, color: LOSS },
    { label: '수비', value: s.advanced.defenseWinrate, color: '#3b82f6' },
  ]
  return (
    <Card title="공격·수비 승률" badge="라이엇 연동 시">
      <div className="flex flex-col gap-4 py-1">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-white">{r.label}</span>
              <span className="text-sm font-black" style={{ color: r.color }}>{r.value}%</span>
            </div>
            <div className="h-2.5 w-full rounded bg-white/5 overflow-hidden">
              <div className="h-full rounded" style={{ width: `${r.value}%`, background: r.color }} />
            </div>
          </div>
        ))}
        <p className="text-[11px] text-slate-600 mt-1">공격할 때 vs 수비할 때 라운드 승률</p>
      </div>
    </Card>
  )
}

// ── 라운드 경제별 승률 ──
function EconomyWinrate({ s }: { s: TeamStats }) {
  const e = s.advanced.economy
  const rows = [
    { label: '풀바이', sub: '완전 구매', value: e.fullBuy },
    { label: '포스바이', sub: '무리한 구매', value: e.forceBuy },
    { label: '이코', sub: '아낌(권총)', value: e.eco },
  ]
  return (
    <Card title="라운드 경제별 승률" badge="라이엇 연동 시">
      <div className="flex flex-col gap-4 py-1">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-white">
                {r.label} <span className="text-[11px] font-normal text-slate-600">{r.sub}</span>
              </span>
              <span className="text-sm font-black" style={{ color: r.value >= 50 ? TEAL : '#f87171' }}>{r.value}%</span>
            </div>
            <div className="h-2.5 w-full rounded bg-white/5 overflow-hidden">
              <div className="h-full rounded" style={{ width: `${r.value}%`, background: r.value >= 50 ? TEAL : LOSS }} />
            </div>
          </div>
        ))}
        <p className="text-[11px] text-slate-600 mt-1">돈 상황별 라운드 승률 — 이코 훔치는 팀이 강팀</p>
      </div>
    </Card>
  )
}

// ── 선취점 임팩트 (첫 킬 → 라운드 승률) ──
function FirstBloodImpact({ s }: { s: TeamStats }) {
  const fb = s.advanced.firstBlood
  const gap = fb.withFb - fb.withoutFb
  return (
    <Card title="선취점 임팩트" badge="라이엇 연동 시">
      <div className="flex flex-col gap-4 py-1">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-white">선취 성공 시</span>
            <span className="text-sm font-black" style={{ color: TEAL }}>{fb.withFb}%</span>
          </div>
          <div className="h-2.5 w-full rounded bg-white/5 overflow-hidden">
            <div className="h-full rounded" style={{ width: `${fb.withFb}%`, background: TEAL }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-white">선취 실패 시</span>
            <span className="text-sm font-black text-red-400">{fb.withoutFb}%</span>
          </div>
          <div className="h-2.5 w-full rounded bg-white/5 overflow-hidden">
            <div className="h-full rounded" style={{ width: `${fb.withoutFb}%`, background: LOSS }} />
          </div>
        </div>
        <p className="text-[11px] text-slate-600 mt-1">
          첫 킬을 따면 라운드 승률이 <span className="font-bold" style={{ color: TEAL }}>+{gap}%p</span> — 엔트리의 가치
        </p>
      </div>
    </Card>
  )
}

// ── 핵심 교전 지표 ──
function KeyMetrics({ s }: { s: TeamStats }) {
  const a = s.advanced
  const items = [
    { label: '피스톨 승률', value: `${a.pistolWinrate}%`, hint: '1·13라운드' },
    { label: '선취점 비율', value: `${a.firstBloodRate}%`, hint: '첫 킬 선점' },
    { label: '클러치 성공', value: `${a.clutchRate}%`, hint: '1vX 상황' },
    { label: '멀티킬 라운드', value: `${a.multiKillRate}%`, hint: '2킬+ 발생' },
  ]
  return (
    <Card title="핵심 교전 지표" badge="라이엇 연동 시">
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded bg-white/[0.02] border border-white/5 p-3">
            <p className="text-[11px] text-slate-500 mb-1">{it.label}</p>
            <p className="text-xl font-black" style={{ color: TEAL }}>{it.value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{it.hint}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-slate-500">팀 평균 ACS</span>
        <span className="text-sm font-black text-white">{a.avgTeamAcs}</span>
      </div>
    </Card>
  )
}

// ── 포맷별 성적 ──
function FormatBreakdown({ s }: { s: TeamStats }) {
  return (
    <Card title="포맷별 성적">
      <div className="flex flex-col gap-4">
        {s.formats.map((f) => {
          const total = f.wins + f.losses
          const wr = total > 0 ? Math.round((f.wins / total) * 100) : 0
          return (
            <div key={f.format}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white">{f.format}</span>
                <span className="text-xs text-slate-400">
                  <span style={{ color: TEAL }}>{f.wins}승</span> · <span className="text-red-400">{f.losses}패</span>
                  <span className="text-slate-600"> · {wr}%</span>
                </span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded bg-white/5">
                <div style={{ width: `${total > 0 ? (f.wins / total) * 100 : 0}%`, background: TEAL }} />
                <div style={{ width: `${total > 0 ? (f.losses / total) * 100 : 0}%`, background: LOSS }} />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── 맵별 승률 ──
function MapWinrates({ s }: { s: TeamStats }) {
  const sorted = [...s.maps].sort((a, b) => {
    const wa = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0
    const wb = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0
    return wb - wa
  })
  return (
    <Card title="맵별 승률" badge="공·수 포함">
      <div className="flex flex-col gap-3.5">
        {sorted.map((m) => {
          const total = m.wins + m.losses
          const wr = total > 0 ? Math.round((m.wins / total) * 100) : 0
          return (
            <div key={m.map}>
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs font-semibold text-slate-300">{m.map}</span>
                <div className="flex-1 h-2 rounded bg-white/5 overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${wr}%`, background: wr >= 50 ? TEAL : LOSS }} />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-bold" style={{ color: wr >= 50 ? TEAL : '#f87171' }}>{wr}%</span>
                <span className="w-12 shrink-0 text-right text-[11px] text-slate-600">{m.wins}-{m.losses}</span>
              </div>
              {/* 공/수 세부 */}
              <div className="flex items-center gap-2 mt-1 pl-[76px] text-[11px]">
                <span className="text-slate-500" style={{ color: '#f87171' }}>공 {m.attackWr}%</span>
                <span className="text-slate-700">·</span>
                <span style={{ color: '#60a5fa' }}>수 {m.defenseWr}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── 상대별 전적 (H2H) ──
function Head2Head({ s }: { s: TeamStats }) {
  return (
    <Card title="상대별 전적" badge="H2H">
      <div className="flex flex-col divide-y divide-white/5">
        {s.h2h.map((h) => {
          const total = h.wins + h.losses
          const wr = total > 0 ? Math.round((h.wins / total) * 100) : 0
          return (
            <div key={h.opponent} className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0">
              <span className="flex-1 min-w-0 truncate text-sm text-white">{h.opponent}</span>
              <div className="w-28 h-2 rounded bg-white/5 overflow-hidden hidden sm:block">
                <div className="h-full rounded" style={{ width: `${wr}%`, background: wr >= 50 ? TEAL : LOSS }} />
              </div>
              <span className="text-xs text-slate-400 w-16 text-right">
                <span style={{ color: TEAL }}>{h.wins}</span>–<span className="text-red-400">{h.losses}</span>
              </span>
              <span className="text-xs font-bold w-10 text-right" style={{ color: wr >= 50 ? TEAL : '#f87171' }}>{wr}%</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── 선수별 스탯 ──
function PlayerStats({ s }: { s: TeamStats }) {
  const maxAcs = Math.max(...s.players.map((p) => p.acs))
  return (
    <Card title="선수별 스탯" badge="라이엇 연동 시">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 text-[11px] uppercase tracking-wider">
              <th className="text-left font-semibold pb-2.5">선수</th>
              <th className="text-right font-semibold pb-2.5">ACS</th>
              <th className="text-right font-semibold pb-2.5">K / D / A</th>
              <th className="text-right font-semibold pb-2.5 hidden sm:table-cell">KAST</th>
              <th className="text-right font-semibold pb-2.5 hidden sm:table-cell">ADR</th>
              <th className="text-right font-semibold pb-2.5 hidden md:table-cell">HS%</th>
              <th className="text-right font-semibold pb-2.5 hidden md:table-cell">FK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {s.players.map((p) => (
              <tr key={p.name}>
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1 h-7 rounded-full shrink-0" style={{ background: ROLE_COLOR[p.role] ?? '#94a3b8' }} />
                    <div>
                      <p className="text-white font-semibold leading-tight">{p.name}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">{p.agent} · {p.role}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span className="font-black text-white">{p.acs}</span>
                    <span className="block w-14 h-1 rounded bg-white/5 overflow-hidden">
                      <span className="block h-full rounded" style={{ width: `${(p.acs / maxAcs) * 100}%`, background: TEAL }} />
                    </span>
                  </div>
                </td>
                <td className="py-2.5 text-right text-slate-300 tabular-nums">
                  {p.kills} / <span className="text-red-400">{p.deaths}</span> / {p.assists}
                </td>
                <td className="py-2.5 text-right text-slate-300 hidden sm:table-cell tabular-nums">{p.kast}%</td>
                <td className="py-2.5 text-right text-slate-300 hidden sm:table-cell tabular-nums">{p.adr}</td>
                <td className="py-2.5 text-right text-slate-300 hidden md:table-cell tabular-nums">{p.hs}%</td>
                <td className="py-2.5 text-right text-slate-300 hidden md:table-cell tabular-nums">{p.fk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-600 mt-3">
        선수별 고급 스탯은 Riot VAL Match API 승인 후 실제 데이터로 채워집니다. (현재 시연용 목업)
      </p>
    </Card>
  )
}
