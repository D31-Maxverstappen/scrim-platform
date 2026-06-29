// D31 Score(독자 선수 평점) 목업 데이터.
// 트래커 스코어가 "솔로랭크 개인 기량"을 보는 것과 달리, D31 Score는 "조직적 스크림에서의
// 임팩트·승리 기여"를 본다(역할 보정 포함). 라이엇/스크림 선수스탯(match_player_stats)이
// 쌓이기 전까지 시연용 목업이며, 이후 실제 집계 공식으로 교체한다.
//
// 승리 기여 측정 = 직접 못 재므로 라운드 결과와 인과적으로 가까운 프록시를 합성:
//   KAST(라운드 기여) + 클러치 성공 + 선취점→라운드 전환 + (승리경기 성과−패배경기 성과)
//   → 역할 보정 → 0~1000 정규화. (데이터 확보 시 라운드 승률변화 기반 '임팩트 레이팅'으로 승급)

export type D31ScoreAxis = { key: string; label: string; value: number } // value 0~100

export type D31Score = {
  score: number // 0~1000
  grade: string // S / A / B / C / D
  gradeColor: string
  topPercent: number // 전체 상위 N%
  rolePercent: number // 같은 역할 내 상위 N% (역할 보정 — 트래커 차별점)
  role: string // 역할 보정 기준
  trend: number // 최근 변동 (+/-)
  axes: D31ScoreAxis[] // 6개 지표 (육각)
  filled: boolean[] // 각 지표가 기준 통과(강점)인지 — 엠블럼 채움. 채운 개수 = 등급(6→S,5→A…)
}

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ROLES = ['타격대', '척후대', '감시자', '전략가']

// 육각 6개 지표 (가중치 합 1.0 — 승리기여 최대)
const AXES_DEF = [
  { key: 'win', label: '승리기여', w: 0.28 },
  { key: 'impact', label: '임팩트', w: 0.20 },
  { key: 'combat', label: '전투력', w: 0.16 },
  { key: 'survival', label: '생존력', w: 0.12 },
  { key: 'consistency', label: '꾸준함', w: 0.12 },
  { key: 'role', label: '역할수행', w: 0.12 },
]
const FILL_THRESHOLD = 62 // 이 점수 이상이면 그 지표 '강점'(엠블럼 채움)

const GRADE_COLOR: Record<string, string> = {
  S: '#00D2BE', A: '#22d3ee', B: '#60a5fa', C: '#f59e0b', D: '#94a3b8',
}
// 채운 지표 개수 → 등급 (S=6개 다 채움, A=1개 빔, B=2개 빔 …)
function gradeFromFilled(n: number): string {
  if (n >= 6) return 'S'
  if (n === 5) return 'A'
  if (n === 4) return 'B'
  if (n === 3) return 'C'
  return 'D'
}

export function getD31ScoreMock(seed: string, roleHint?: string): D31Score {
  const rng = mulberry32(hashStr(seed || 'd31'))
  const base = 48 + rng() * 38 // 48~86 기준 경기력
  const ax = (spread: number) => Math.round(Math.max(20, Math.min(99, base + (rng() * spread * 2 - spread))))

  // 6개 지표 값 생성 (지표마다 강약이 갈리도록)
  const values = AXES_DEF.map(() => ax(20))
  const filled = values.map((v) => v >= FILL_THRESHOLD)
  const filledCount = filled.filter(Boolean).length
  const gradeLetter = gradeFromFilled(filledCount)
  const gradeColor = GRADE_COLOR[gradeLetter]

  // 점수(0~1000) = 가중합 (승리기여 최대). 등급(폭)과 별개의 종합 수치.
  const score = Math.round(AXES_DEF.reduce((sum, a, i) => sum + values[i] * a.w, 0) * 10)
  const topPercent = Math.max(1, Math.round(100 - score / 10)) // 점수↑ → 상위%↓
  // 역할 내 상위% — 역할 보정 시 보통 전체보다 유리(같은 역할끼리 비교)
  const rolePercent = Math.max(1, Math.min(99, Math.round(topPercent * (0.55 + rng() * 0.4))))

  return {
    score,
    grade: gradeLetter,
    gradeColor,
    topPercent,
    rolePercent,
    role: roleHint && ROLES.includes(roleHint) ? roleHint : ROLES[hashStr(seed) % ROLES.length],
    trend: Math.round(rng() * 50 - 18), // -18 ~ +32
    axes: AXES_DEF.map((a, i) => ({ key: a.key, label: a.label, value: values[i] })),
    filled,
  }
}
