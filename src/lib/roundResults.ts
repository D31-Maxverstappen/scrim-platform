// 매치 라운드 결과 파서.
// round_results 형식: 라운드마다 2글자 토큰 — <승자><사유>.
//   승자: '1'(team1) | '2'(team2)
//   사유: 'e' 제거(elimination) | 'b' 스파이크 폭발(detonate) | 'd' 해체(defuse) | 't' 시간초과(time)
// 예: "1e2d1b..." → R1 팀1 제거승, R2 팀2 해체승, R3 팀1 폭발승 ...
// ⚠️ 라이엇 매치 API 승인 후엔 roundResults(winningTeam + roundResult 텍스트)를 이 형식으로 매핑해 저장.

export type RoundReason = 'e' | 'b' | 'd' | 't'
export type RoundCell = { winner: 1 | 2; reason: RoundReason }

const REASONS: RoundReason[] = ['e', 'b', 'd', 't']

export function parseRounds(raw: string | null | undefined): RoundCell[] {
  if (!raw) return []
  const out: RoundCell[] = []
  for (let i = 0; i + 1 < raw.length; i += 2) {
    const winner = raw[i] === '2' ? 2 : 1
    const r = raw[i + 1] as RoundReason
    out.push({ winner, reason: REASONS.includes(r) ? r : 'e' })
  }
  return out
}
