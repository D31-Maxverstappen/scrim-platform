// 자동생성 — abilities_meta.json·maps_coords.json 기반(13대). 작전판 스킬 범위 시각화 데이터.
// 반경(circle)·길이(wall) 단위=미터(시각보정 추정). 1m=100 게임유닛.

export type RangeShape = 'circle' | 'wall'
export type RangeKind = 'smoke' | 'molly' | 'recon' | 'control' | 'wall'
export type SkillRange = { shape: RangeShape; kind: RangeKind; meters: number }

// `${agentSlug}:${name_ko}` → 범위. 그릴 수 있는 스킬만 포함(없으면 도형 미표시).
export const SKILL_RANGES: Record<string, SkillRange> = {
  'gekko:폭파봇 지옥': { shape: 'circle', kind: 'molly', meters: 4.5 },
  'fade:포박': { shape: 'circle', kind: 'control', meters: 4.5 },
  'fade:귀체': { shape: 'circle', kind: 'recon', meters: 8.0 },
  'breach:균열': { shape: 'wall', kind: 'control', meters: 14.0 },
  'breach:여진': { shape: 'circle', kind: 'molly', meters: 3.5 },
  'deadlock:음향 센서': { shape: 'circle', kind: 'recon', meters: 5.0 },
  'deadlock:장벽망': { shape: 'wall', kind: 'wall', meters: 6.0 },
  'deadlock:중력그물': { shape: 'circle', kind: 'control', meters: 4.0 },
  'tejo:유도 일제 사격': { shape: 'circle', kind: 'molly', meters: 4.0 },
  'tejo:특별 배송': { shape: 'circle', kind: 'control', meters: 3.5 },
  'tejo:아마겟돈': { shape: 'wall', kind: 'molly', meters: 20.0 },
  'raze:페인트탄': { shape: 'circle', kind: 'molly', meters: 4.0 },
  'chamber:트레이드마크': { shape: 'circle', kind: 'control', meters: 4.0 },
  'kayo:파편/탄': { shape: 'circle', kind: 'molly', meters: 4.0 },
  'kayo:제로/포인트': { shape: 'circle', kind: 'control', meters: 5.0 },
  'cypher:사이버 감옥': { shape: 'circle', kind: 'smoke', meters: 4.0 },
  'cypher:함정': { shape: 'wall', kind: 'control', meters: 10.0 },
  'sova:충격 화살': { shape: 'circle', kind: 'molly', meters: 3.0 },
  'sova:정찰용 화살': { shape: 'circle', kind: 'recon', meters: 8.0 },
  'miks:M-파동': { shape: 'circle', kind: 'control', meters: 4.0 },
  'miks:웨이브폼': { shape: 'circle', kind: 'smoke', meters: 5.0 },
  'killjoy:나노스웜': { shape: 'circle', kind: 'molly', meters: 4.0 },
  'killjoy:봉쇄': { shape: 'circle', kind: 'control', meters: 10.0 },
  'harbor:만조': { shape: 'wall', kind: 'wall', meters: 15.0 },
  'harbor:폭풍 쇄도': { shape: 'wall', kind: 'control', meters: 12.0 },
  'harbor:해만': { shape: 'circle', kind: 'smoke', meters: 5.0 },
  'harbor:심판': { shape: 'circle', kind: 'control', meters: 8.0 },
  'vyse:가지치기': { shape: 'wall', kind: 'wall', meters: 8.0 },
  'vyse:면도날 덩굴': { shape: 'circle', kind: 'molly', meters: 4.5 },
  'vyse:강철 정원': { shape: 'circle', kind: 'control', meters: 10.0 },
  'viper:독성 연기': { shape: 'circle', kind: 'smoke', meters: 4.5 },
  'viper:독성 장막': { shape: 'wall', kind: 'smoke', meters: 40.0 },
  'viper:뱀 이빨': { shape: 'circle', kind: 'molly', meters: 3.5 },
  'viper:독사의 구덩이': { shape: 'circle', kind: 'smoke', meters: 12.0 },
  'phoenix:불길': { shape: 'wall', kind: 'wall', meters: 10.0 },
  'phoenix:뜨거운 손': { shape: 'circle', kind: 'molly', meters: 3.5 },
  'veto:목조르기': { shape: 'circle', kind: 'control', meters: 3.5 },
  'astra:신성 파동': { shape: 'circle', kind: 'control', meters: 4.5 },
  'astra:성운 / 소멸': { shape: 'circle', kind: 'smoke', meters: 5.0 },
  'astra:중력의 샘': { shape: 'circle', kind: 'control', meters: 4.5 },
  'astra:천상계 형상 / 우주 장벽': { shape: 'wall', kind: 'smoke', meters: 60.0 },
  'brimstone:소이탄': { shape: 'circle', kind: 'molly', meters: 3.5 },
  'brimstone:공중 연막': { shape: 'circle', kind: 'smoke', meters: 5.5 },
  'brimstone:궤도 일격': { shape: 'circle', kind: 'molly', meters: 8.0 },
  'iso:약화': { shape: 'circle', kind: 'control', meters: 3.5 },
  'iso:대비책': { shape: 'wall', kind: 'wall', meters: 12.0 },
  'clove:계략': { shape: 'circle', kind: 'smoke', meters: 5.0 },
  'clove:간섭': { shape: 'circle', kind: 'control', meters: 4.0 },
  'neon:릴레이 볼트': { shape: 'circle', kind: 'control', meters: 4.0 },
  'neon:추월 차선': { shape: 'wall', kind: 'smoke', meters: 18.0 },
  'sage:둔화 구슬': { shape: 'circle', kind: 'control', meters: 5.0 },
  'sage:장벽 구슬': { shape: 'wall', kind: 'wall', meters: 10.0 },
  'omen:어둠의 장막': { shape: 'circle', kind: 'smoke', meters: 4.1 },
  'jett:연막 폭발': { shape: 'circle', kind: 'smoke', meters: 4.0 },
}

// 맵 slug → |xMultiplier| (게임유닛→미니맵 비율, 0~1).
export const MAP_SCALE: Record<string, number> = {
  ascent: 7e-05,
  split: 7.8e-05,
  fracture: 7.8e-05,
  bind: 5.9e-05,
  breeze: 7e-05,
  abyss: 8.1e-05,
  lotus: 7.2e-05,
  sunset: 7.8e-05,
  pearl: 7.8e-05,
  icebox: 7.2e-05,
  corrode: 7e-05,
  haven: 7.5e-05,
  summit: 7.5e-05,
}

// 시각 보정 전역 계수 — 프리뷰로 실측 맞춘 뒤 조정.
export const RANGE_CALIBRATION = 1

// 미터 → 미니맵 픽셀(반경/길이). 맵 배율 없으면 null.
export function rangePx(meters: number, mapSlug: string | null, sizePx: number): number | null {
  if (!mapSlug) return null
  const scale = MAP_SCALE[mapSlug]
  if (!scale) return null
  return meters * 100 * scale * sizePx * RANGE_CALIBRATION
}

// kind → 색(연막 회색·몰리 주황·정찰 파랑·제어 보라·벽 틸).
export const RANGE_COLORS: Record<RangeKind, string> = {
  smoke: '#9aa0a6', molly: '#ff6b3d', recon: '#3b82f6', control: '#a855f7', wall: '#00D2BE',
}
