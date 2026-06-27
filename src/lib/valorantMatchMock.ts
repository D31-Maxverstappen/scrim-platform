// 발로란트 매치기록(전적) 목업 데이터.
// 라이엇 Production API Key 승인 전까지 매치기록 UI를 시연하기 위한 임시 데이터다.
// 승인 후에는 이 모듈을 VAL Match API(val/match/v1) 응답 매핑으로 교체한다.
// ⚠️ UI(페이지)와 분리(SoC) — 화면은 src/app/valorant/matches/page.tsx 가 담당.

export type ValMatchMode = '경쟁전' | '일반전' | '스크림'

// 매치 스코어보드의 개별 플레이어 (양 팀 10명)
export type ValMatchPlayer = {
  name: string
  tag: string
  agent: string
  team: 'blue' | 'red' // blue = 본인 팀(아군), red = 상대 팀
  kills: number
  deaths: number
  assists: number
  acs: number
  hsPercent: number
  isMe?: boolean
}

export type ValMatch = {
  id: string
  mode: ValMatchMode
  map: string
  win: boolean
  roundsWon: number
  roundsLost: number
  agent: string
  agentRole: string
  kills: number
  deaths: number
  assists: number
  acs: number // 평균 전투 점수 (Average Combat Score)
  hsPercent: number // 헤드샷 비율
  adr: number // 라운드당 평균 피해량
  mvp: boolean // 매치 MVP 여부
  playedAt: string // ISO 8601
  durationMin: number
  players: ValMatchPlayer[] // 양 팀 10명 스코어보드 (승인 후 Match-V1로 교체)
}

export type ValRank = {
  name: string // 예: '불멸 2'
  colorKey: string // lib/tiers.ts getTierColor 키 (예: 'Immortal')
  rr: number // 0~100
}

// 연동된 라이엇 계정의 현재 경쟁전 티어 (목업)
export const MOCK_RANK: ValRank = { name: '불멸 2', colorKey: 'Immortal', rr: 47 }

// ── 스코어보드 플레이어 생성 (결정적: 매치 id 시드로 SSR/CSR 동일 결과) ──
const AGENTS = ['제트', '오멘', '레이즈', '세이지', '킬조이', '소바', '바이퍼', '레이나', '브리치', '네온', '페이드', '스카이', '체임버', '아스트라', '요루', '게코', '데드락', '하버', '클로브', '아이소']
const NAMES = ['Stormi', 'Kael', 'Nova', 'Riven', 'Zephyr', 'Lumi', 'Dusk', 'Vexa', 'Orion', 'Sable', 'Wisp', 'Talon', 'Echo', 'Frost', 'Nyx', 'Onyx', 'Pyre', 'Quill', 'Rune', 'Mochi']
const TAGS = ['KR1', 'KR2', 'VAL', 'D31', 'GG', 'PRO', 'ACE', 'OG']

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h) || 1
}
function rngFrom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function genPlayers(m: Omit<ValMatch, 'players'>): ValMatchPlayer[] {
  const rng = rngFrom(hashStr(m.id))
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const usedAgents = new Set<string>([m.agent])
  const usedNames = new Set<string>()
  const uniqAgent = () => { let a = pick(AGENTS); while (usedAgents.has(a)) a = pick(AGENTS); usedAgents.add(a); return a }
  const uniqName = () => { let n = pick(NAMES); while (usedNames.has(n)) n = pick(NAMES); usedNames.add(n); return n }
  const stat = (base: number, spread: number) => Math.max(0, Math.round(base + (rng() - 0.5) * spread))
  const filler = (team: 'blue' | 'red'): ValMatchPlayer => ({
    name: uniqName(), tag: pick(TAGS), agent: uniqAgent(), team,
    kills: stat(18, 18), deaths: stat(15, 10), assists: stat(6, 9), acs: stat(225, 150), hsPercent: stat(24, 18),
  })

  const me: ValMatchPlayer = {
    name: '나', tag: '', agent: m.agent, team: 'blue', isMe: true,
    kills: m.kills, deaths: m.deaths, assists: m.assists, acs: m.acs, hsPercent: m.hsPercent,
  }
  const blue = [me, ...Array.from({ length: 4 }, () => filler('blue'))]
  const red = Array.from({ length: 5 }, () => filler('red'))
  const byAcs = (a: ValMatchPlayer, b: ValMatchPlayer) => b.acs - a.acs
  return [...blue.sort(byAcs), ...red.sort(byAcs)]
}

// 최근 매치 (최신순)
const BASE_MATCHES: Omit<ValMatch, 'players'>[] = [
  { id: 'm1', mode: '경쟁전', map: '어센트', win: true, roundsWon: 13, roundsLost: 8, agent: '제트', agentRole: '타격대', kills: 27, deaths: 14, assists: 5, acs: 312, hsPercent: 29, adr: 168, mvp: true, playedAt: '2026-06-24T22:41:00+09:00', durationMin: 34 },
  { id: 'm2', mode: '스크림', map: '로터스', win: true, roundsWon: 13, roundsLost: 11, agent: '오멘', agentRole: '전략가', kills: 19, deaths: 16, assists: 9, acs: 241, hsPercent: 24, adr: 141, mvp: false, playedAt: '2026-06-24T21:55:00+09:00', durationMin: 41 },
  { id: 'm3', mode: '경쟁전', map: '헤이븐', win: false, roundsWon: 10, roundsLost: 13, agent: '레이즈', agentRole: '타격대', kills: 21, deaths: 18, assists: 4, acs: 263, hsPercent: 18, adr: 152, mvp: false, playedAt: '2026-06-23T23:12:00+09:00', durationMin: 38 },
  { id: 'm4', mode: '경쟁전', map: '바인드', win: true, roundsWon: 13, roundsLost: 6, agent: '제트', agentRole: '타격대', kills: 24, deaths: 11, assists: 3, acs: 298, hsPercent: 31, adr: 161, mvp: true, playedAt: '2026-06-23T22:08:00+09:00', durationMin: 29 },
  { id: 'm5', mode: '일반전', map: '스플릿', win: false, roundsWon: 7, roundsLost: 13, agent: '레이나', agentRole: '타격대', kills: 16, deaths: 17, assists: 2, acs: 214, hsPercent: 22, adr: 128, mvp: false, playedAt: '2026-06-22T20:33:00+09:00', durationMin: 31 },
  { id: 'm6', mode: '스크림', map: '펄', win: true, roundsWon: 13, roundsLost: 9, agent: '킬조이', agentRole: '감시자', kills: 18, deaths: 13, assists: 7, acs: 232, hsPercent: 26, adr: 137, mvp: false, playedAt: '2026-06-22T19:40:00+09:00', durationMin: 36 },
  { id: 'm7', mode: '경쟁전', map: '선셋', win: true, roundsWon: 14, roundsLost: 12, agent: '소바', agentRole: '척후대', kills: 20, deaths: 15, assists: 11, acs: 245, hsPercent: 20, adr: 144, mvp: false, playedAt: '2026-06-21T23:50:00+09:00', durationMin: 43 },
  { id: 'm8', mode: '경쟁전', map: '아이스박스', win: false, roundsWon: 11, roundsLost: 13, agent: '바이퍼', agentRole: '전략가', kills: 17, deaths: 18, assists: 6, acs: 219, hsPercent: 23, adr: 131, mvp: false, playedAt: '2026-06-21T22:31:00+09:00', durationMin: 39 },
  { id: 'm9', mode: '경쟁전', map: '어센트', win: true, roundsWon: 13, roundsLost: 10, agent: '제트', agentRole: '타격대', kills: 25, deaths: 16, assists: 4, acs: 281, hsPercent: 28, adr: 158, mvp: false, playedAt: '2026-06-20T21:18:00+09:00', durationMin: 37 },
]

export const MOCK_MATCHES: ValMatch[] = BASE_MATCHES.map((m) => ({ ...m, players: genPlayers(m) }))

export type ValSummary = {
  wins: number
  losses: number
  winRate: number
  avgAcs: number
  kd: number
  hsPercent: number
  totalKills: number
  totalDeaths: number
  totalAssists: number
  topAgents: { agent: string; games: number; winRate: number }[]
}

// 매치 배열에서 요약 통계를 계산한다 (실데이터 연결 시에도 그대로 재사용).
export function summarize(matches: ValMatch[]): ValSummary {
  const n = matches.length || 1
  const wins = matches.filter((m) => m.win).length
  const losses = matches.length - wins
  const totalKills = matches.reduce((s, m) => s + m.kills, 0)
  const totalDeaths = matches.reduce((s, m) => s + m.deaths, 0)
  const totalAssists = matches.reduce((s, m) => s + m.assists, 0)

  const agentMap = new Map<string, { games: number; wins: number }>()
  for (const m of matches) {
    const cur = agentMap.get(m.agent) ?? { games: 0, wins: 0 }
    cur.games += 1
    if (m.win) cur.wins += 1
    agentMap.set(m.agent, cur)
  }
  const topAgents = [...agentMap.entries()]
    .map(([agent, v]) => ({ agent, games: v.games, winRate: Math.round((v.wins / v.games) * 100) }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 3)

  return {
    wins,
    losses,
    winRate: Math.round((wins / matches.length) * 100),
    avgAcs: Math.round(matches.reduce((s, m) => s + m.acs, 0) / n),
    kd: Math.round((totalKills / (totalDeaths || 1)) * 100) / 100,
    hsPercent: Math.round(matches.reduce((s, m) => s + m.hsPercent, 0) / n),
    totalKills,
    totalDeaths,
    totalAssists,
    topAgents,
  }
}
