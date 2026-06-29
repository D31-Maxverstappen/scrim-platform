// 팀 통계 대시보드(유료 Pro 기능) 목업 데이터.
// 라이엇 Production API Key 승인 + 충분한 스크림 데이터 축적 전까지 Pro 통계 UI를
// 시연하기 위한 임시 데이터다. 승인/축적 후에는 이 모듈을 실제 집계 쿼리로 교체한다:
//   - 매치 결과/포맷/추이/상대전적/맵별 → matches·match_maps 집계 (정책 안전, 즉시 가능)
//   - 선수별 ACS/KAST/ADR 등 고급 스탯 → match_player_stats (RSO+VAL Match API 승인 후)
// ⚠️ UI(컴포넌트)와 분리(SoC) — 화면은 src/components/team/TeamStatsDashboard.tsx 가 담당.

export type WinratePoint = { label: string; winrate: number; games: number }
export type FormatRecord = { format: 'BO1' | 'BO3' | 'BO5'; wins: number; losses: number }
export type MapStat = { map: string; wins: number; losses: number; attackWr: number; defenseWr: number }
export type H2HRecord = { opponent: string; wins: number; losses: number }
export type PlayerStatRow = {
  name: string
  agent: string
  role: string // 타격대 / 척후대 / 감시자 / 전략가
  acs: number
  kills: number
  deaths: number
  assists: number
  kast: number // %
  adr: number
  hs: number // %
  fk: number // 첫 킬(First Kill)
}

// 심층 지표 (발로란트 라운드/교전 단위 — 라이엇 데이터 연동 후 실집계)
export type AdvancedStats = {
  attackWinrate: number // 공격 라운드 승률 %
  defenseWinrate: number // 수비 라운드 승률 %
  pistolWinrate: number // 피스톨(1·13R) 승률 %
  firstBloodRate: number // 선취점(첫 킬 선점) 비율 %
  clutchRate: number // 클러치(1vX) 성공률 %
  multiKillRate: number // 멀티킬 발생 라운드 비율 %
  avgTeamAcs: number // 팀 평균 ACS
  // 라운드 경제별 승률
  economy: { fullBuy: number; forceBuy: number; eco: number }
  // 선취점(첫 킬) 임팩트 — 선취 성공/실패 시 라운드 승률
  firstBlood: { withFb: number; withoutFb: number }
}

export type TeamStats = {
  totalScrims: number
  wins: number
  losses: number
  winrate: number // %
  avgMargin: number // 매치당 평균 라운드 득실 (+면 우세)
  recentForm: ('W' | 'L')[] // 최근 순(왼→오)
  streak: { type: 'W' | 'L'; count: number }
  trend: WinratePoint[] // 월별 누적 승률
  formats: FormatRecord[]
  maps: MapStat[]
  h2h: H2HRecord[]
  players: PlayerStatRow[]
  advanced: AdvancedStats
}

// 결정적 시드 RNG (팀 id 기반 → SSR/CSR 동일 결과)
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

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const MAP_POOL = ['어센트', '바인드', '헤이븐', '스플릿', '로터스', '선셋', '어비스', '아이스박스']
const OPP_POOL = ['Phantom Squad', 'Nightfall', 'Aurora', 'Velocity', 'Kraken GG', 'Mirage', 'Tempest', 'Onyx Academy']
const PLAYER_NAMES = ['Stormi', 'Kael', 'Nova', 'Riven', 'Zephyr']
const AGENT_BY_ROLE: Record<string, string[]> = {
  타격대: ['제트', '레이즈', '레이나'],
  척후대: ['소바', '브리치', '스카이'],
  감시자: ['킬조이', '세이지', '체임버'],
  전략가: ['오멘', '바이퍼', '아스트라'],
}
const ROLE_LINEUP = ['타격대', '타격대', '척후대', '감시자', '전략가']

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length]
}

export function getTeamStatsMock(teamId: string, teamName: string): TeamStats {
  const rng = mulberry32(hashStr(teamId || teamName || 'd31'))

  // 전체 전적
  const totalScrims = 18 + Math.floor(rng() * 30) // 18~47
  const baseWinrate = 0.42 + rng() * 0.36 // 42~78%
  const wins = Math.round(totalScrims * baseWinrate)
  const losses = totalScrims - wins
  const winrate = Math.round((wins / totalScrims) * 100)
  const avgMargin = Math.round((rng() * 7 - 2.5) * 10) / 10 // -2.5 ~ +4.5

  // 8~92% 사이로 클램프한 가짜 승률 생성기
  const around = (base: number, spread: number) =>
    Math.round(Math.max(8, Math.min(92, base + (rng() * spread * 2 - spread))))

  // 최근 폼 (6경기) — 승률에 비례한 가중
  const recentForm: ('W' | 'L')[] = Array.from({ length: 6 }, () => (rng() < baseWinrate ? 'W' : 'L'))
  let streakCount = 1
  for (let i = recentForm.length - 2; i >= 0; i--) {
    if (recentForm[i] === recentForm[recentForm.length - 1]) streakCount++
    else break
  }
  const streak = { type: recentForm[recentForm.length - 1], count: streakCount }

  // 월별 승률 추이 (최근 6개월)
  const now = new Date()
  const trend: WinratePoint[] = Array.from({ length: 6 }, (_, i) => {
    const m = (now.getMonth() - (5 - i) + 12) % 12
    const wr = Math.max(20, Math.min(92, Math.round(baseWinrate * 100 + (rng() * 40 - 20))))
    return { label: MONTHS[m], winrate: wr, games: 2 + Math.floor(rng() * 6) }
  })

  // 포맷별 성적
  const formats: FormatRecord[] = (['BO1', 'BO3', 'BO5'] as const).map((format) => {
    const g = 3 + Math.floor(rng() * 10)
    const w = Math.round(g * (baseWinrate + (rng() * 0.3 - 0.15)))
    return { format, wins: Math.max(0, Math.min(g, w)), losses: Math.max(0, g - Math.max(0, Math.min(g, w))) }
  })

  // 맵별 승률 (5개 맵)
  const mapCount = 5
  const shuffledMaps = [...MAP_POOL].sort(() => rng() - 0.5).slice(0, mapCount)
  const maps: MapStat[] = shuffledMaps.map((map) => {
    const g = 2 + Math.floor(rng() * 8)
    const w = Math.round(g * (rng() * 0.6 + 0.2))
    return { map, wins: w, losses: g - w, attackWr: around(50, 20), defenseWr: around(50, 20) }
  })

  // 상대별 전적 (4팀)
  const shuffledOpp = [...OPP_POOL].sort(() => rng() - 0.5).slice(0, 4)
  const h2h: H2HRecord[] = shuffledOpp.map((opponent) => {
    const g = 1 + Math.floor(rng() * 5)
    const w = Math.round(g * (rng() * 0.8 + 0.1))
    return { opponent, wins: Math.max(0, Math.min(g, w)), losses: g - Math.max(0, Math.min(g, w)) }
  })

  // 선수별 스탯 (출전 5인)
  const players: PlayerStatRow[] = ROLE_LINEUP.map((role, i) => {
    const acs = Math.round(160 + rng() * 130) // 160~290
    const kills = Math.round(12 + rng() * 12)
    const deaths = Math.round(10 + rng() * 9)
    const assists = Math.round(3 + rng() * 9)
    return {
      name: PLAYER_NAMES[i],
      agent: pick(AGENT_BY_ROLE[role], rng()),
      role,
      acs,
      kills,
      deaths,
      assists,
      kast: Math.round(62 + rng() * 26), // 62~88%
      adr: Math.round(120 + rng() * 70),
      hs: Math.round(14 + rng() * 22), // 14~36%
      fk: Math.round(rng() * 6),
    }
  })

  // 심층 지표 — 팀 승률에 느슨하게 상관되도록 생성
  const advanced: AdvancedStats = {
    attackWinrate: around(winrate, 16),
    defenseWinrate: around(winrate, 16),
    pistolWinrate: around(winrate, 22),
    firstBloodRate: around(52, 14),
    clutchRate: around(34, 16),
    multiKillRate: around(28, 12),
    avgTeamAcs: Math.round(players.reduce((sum, p) => sum + p.acs, 0) / players.length),
    economy: {
      fullBuy: around(60, 12), // 풀바이는 보통 높음
      forceBuy: around(38, 14),
      eco: around(22, 12), // 이코는 보통 낮음
    },
    firstBlood: {
      withFb: around(72, 10), // 선취 잡으면 승률 높음
      withoutFb: around(30, 12), // 놓치면 낮음
    },
  }

  return {
    totalScrims,
    wins,
    losses,
    winrate,
    avgMargin,
    recentForm,
    streak,
    trend,
    formats,
    maps,
    h2h,
    players,
    advanced,
  }
}
