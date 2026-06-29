import { getD31ScoreMock, type D31Score } from '@/lib/d31ScoreMock'

// D31 Score 카드 (선수 정체성 점수 — 프로필 헤드라인, 현재 목업 시연).
// 데이터는 lib/d31ScoreMock 에서 생성(결정적). 순수 프레젠테이션 — 레이더는 의존성 없이 SVG.

const TEAL = '#00D2BE'

// 육각 등급 엠블럼 (D31 Rating 시그니처 — 트래커 오각=5지표, 우리 육각=6지표)
// 6개 섹터를 지표 강점 여부(filled)로 채움 → S=6칸 다 참, A=1칸 빔, B=2칸 빔 …
function HexEmblem({ grade, color, filled, size = 88 }: { grade: string; color: string; filled: boolean[]; size?: number }) {
  const cx = 40, cy = 40, R = 31
  const verts = Array.from({ length: 6 }, (_, k) => {
    const a = ((-90 + k * 60) * Math.PI) / 180
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as const
  })
  const hexPts = verts.map((v) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className="shrink-0" role="img" aria-label={`등급 ${grade}`}>
      {verts.map((v, i) => {
        const v2 = verts[(i + 1) % 6]
        const on = filled[i % filled.length]
        return (
          <polygon
            key={i}
            points={`${cx},${cy} ${v[0].toFixed(1)},${v[1].toFixed(1)} ${v2[0].toFixed(1)},${v2[1].toFixed(1)}`}
            fill={color}
            fillOpacity={on ? 0.34 : 0.05}
            stroke="#0d0d16"
            strokeWidth="1.2"
          />
        )
      })}
      <polygon points={hexPts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r="12.5" fill="#0d0d16" />
      <text x={cx} y={cy + 5.5} textAnchor="middle" fontSize="17" fontWeight="800" fill={color}>{grade}</text>
    </svg>
  )
}

export default function D31ScoreCard({ seed, role }: { seed: string; role?: string }) {
  const s = getD31ScoreMock(seed, role)
  const win = s.axes.find((a) => a.key === 'win')?.value ?? 0
  return (
    <div
      className="bg-[#111118] border border-white/5 rounded p-5 mb-6"
      style={{ borderLeft: `2px solid ${s.gradeColor}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: TEAL }}>D31 Rating</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-500 tracking-wider">BETA</span>
        </div>
        <span className="text-[11px] text-slate-600">스크림 임팩트 기반</span>
      </div>

      <div className="flex gap-6 items-center max-[640px]:flex-col max-[640px]:items-start">
        {/* 엠블럼 + 점수 + 역할 상위% */}
        <div className="flex items-center gap-4 shrink-0">
          <HexEmblem grade={s.grade} color={s.gradeColor} filled={s.filled} size={88} />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black leading-none" style={{ color: s.gradeColor }}>{s.score}</span>
              <span className="text-xs text-slate-500">/ 1000</span>
            </div>
            {/* 차별 후킹: 역할 내 상위% */}
            <p className="text-sm mt-2">
              <span className="text-white font-bold">{s.role}</span>{' '}
              <span className="font-black" style={{ color: s.gradeColor }}>상위 {s.rolePercent}%</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              전체 상위 {s.topPercent}% · 승리기여 <span className="text-slate-300 font-semibold">{win}</span>
            </p>
            <p className="text-xs mt-1.5">
              <span className={s.trend >= 0 ? 'text-[#00D2BE]' : 'text-red-400'}>
                {s.trend >= 0 ? '▲' : '▼'} {Math.abs(s.trend)}
              </span>
              <span className="text-slate-600"> 최근 5경기</span>
            </p>
          </div>
        </div>

        {/* 레이더 */}
        <div className="flex-1 min-w-0 flex justify-center max-[640px]:w-full">
          <Radar axes={s.axes} color={s.gradeColor} />
        </div>
      </div>

      <p className="text-[11px] text-slate-600 mt-4 pt-3 border-t border-white/5">
        킬 수가 아니라 <span className="text-slate-400">라운드 승리에 기여했는가</span>를 봅니다 — KAST·클러치·선취 전환·승리 기여를 <span className="text-slate-400">역할별로 보정</span>.
        라이엇 연동 시 실제 스크림 데이터로 산출됩니다. (현재 시연용)
      </p>
    </div>
  )
}

// 컴팩트 — 목록/게시판용 (육각 엠블럼 + 점수만, 박스 없음). 같은 목업 소스 재사용.
export function D31ScoreBadge({ seed, role }: { seed: string; role?: string }) {
  const s = getD31ScoreMock(seed, role)
  return (
    <span
      className="inline-flex items-center gap-2"
      title={`D31 Rating ${s.score} · ${s.grade}등급 · ${s.role} 상위 ${s.rolePercent}%`}
    >
      <HexEmblem grade={s.grade} color={s.gradeColor} filled={s.filled} size={40} />
      <span className="text-base font-black tabular-nums" style={{ color: s.gradeColor }}>{s.score}</span>
    </span>
  )
}

function Radar({ axes, color }: { axes: D31Score['axes']; color: string }) {
  const cx = 130, cy = 100, R = 56
  const n = axes.length
  const ANG = axes.map((_, i) => -90 + (i * 360) / n)
  const pt = (val: number, angDeg: number) => {
    const r = (angDeg * Math.PI) / 180
    return [cx + (val / 100) * R * Math.cos(r), cy + (val / 100) * R * Math.sin(r)]
  }
  const label = (angDeg: number) => {
    const r = (angDeg * Math.PI) / 180
    const lr = R + 14
    const c = Math.cos(r)
    return {
      x: cx + lr * c,
      y: cy + lr * Math.sin(r) + 3,
      anchor: c > 0.25 ? ('start' as const) : c < -0.25 ? ('end' as const) : ('middle' as const),
    }
  }
  const ring = (val: number) => ANG.map((a) => pt(val, a).join(',')).join(' ')
  const dataPoly = axes.map((a, i) => pt(a.value, ANG[i]).join(',')).join(' ')

  return (
    <svg viewBox="0 0 260 200" className="w-full" style={{ maxWidth: 270, height: 'auto' }}>
      {[33, 66, 100].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="#ffffff12" />
      ))}
      {ANG.map((a, i) => {
        const [x, y] = pt(100, a)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#ffffff0f" />
      })}
      <polygon points={dataPoly} fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = pt(a.value, ANG[i])
        return <circle key={i} cx={x} cy={y} r="3" fill="#0a0a0a" stroke={color} strokeWidth="2" />
      })}
      {axes.map((a, i) => {
        const l = label(ANG[i])
        return (
          <text key={i} x={l.x} y={l.y} fill="#94a3b8" fontSize="10.5" fontWeight="700" textAnchor={l.anchor}>
            {a.label} <tspan fill={color}>{a.value}</tspan>
          </text>
        )
      })}
    </svg>
  )
}
