import type { SupabaseClient } from '@supabase/supabase-js'

// 계정 유형 — 가입(온보딩) 시 고정. 선수(player)/코치(coach).
export type AccountType = 'player' | 'coach'

// 코치 계정 여부.
// 코치는 가입 경로가 분리된다: 1인 1팀 제약을 우회해 여러 팀에 들어갈 수 있고,
// 팀 가입 시 role을 'coach'로 부여한다(출전 로스터·티어평균에서 제외됨 — recalcTierAvg 참고).
// account_type은 공개 컬럼(마이그레이션 008 GRANT)이라 본인/타인 모두 조회 가능.
export async function isCoachAccount(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await client.from('users').select('account_type').eq('id', userId).maybeSingle()
  return data?.account_type === 'coach'
}
