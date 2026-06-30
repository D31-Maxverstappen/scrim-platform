// 발로란트 요원 초상화 매핑 — 한글 요원명 → public/agents/<slug>.png
// 아이콘 출처: Riot 공식 VALORANT 자산(Public Content Catalog / VALORANT Asset Kit), public/agents/에 보관.

const AGENT_SLUG: Record<string, string> = {
  제트: 'jett', 오멘: 'omen', 레이즈: 'raze', 세이지: 'sage', 킬조이: 'killjoy',
  소바: 'sova', 바이퍼: 'viper', 레이나: 'reyna', 브리치: 'breach', 네온: 'neon',
  페이드: 'fade', 스카이: 'skye', 체임버: 'chamber', 아스트라: 'astra', 요루: 'yoru',
  게코: 'gekko', 데드락: 'deadlock', 하버: 'harbor', 클로브: 'clove', 아이소: 'iso',
  브림스톤: 'brimstone', 사이퍼: 'cypher', '케이/오': 'kayo', 피닉스: 'phoenix', 테호: 'tejo',
  믹스: 'miks', 바이스: 'vyse', 비토: 'veto', 웨이레이: 'waylay',
}

// 팔레트용 요원 목록(초상화 매핑된 요원명).
export const AGENT_NAMES = Object.keys(AGENT_SLUG)

// 요원명 → 초상화 경로. 매핑 없으면 null(컴포넌트에서 이름 첫 글자 폴백).
export function agentIcon(agent: string | null | undefined): string | null {
  if (!agent) return null
  const slug = AGENT_SLUG[agent.trim()]
  return slug ? `/agents/${slug}.png` : null
}

// 요원명 → slug (스킬 매핑 등에서 사용). 매핑 없으면 null.
export function agentSlug(agent: string | null | undefined): string | null {
  if (!agent) return null
  return AGENT_SLUG[agent.trim()] ?? null
}
