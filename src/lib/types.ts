// 공용 도메인 타입 — 여러 컴포넌트/페이지에서 재사용하는 데이터 형태 모음.
// Supabase 쿼리 결과의 흔한 형태를 정의해 any 사용을 줄인다.

import type { Database } from './database.types'

// DB enum 정본 재사용 (매직 문자열 흩뿌리기 방지)
export type GameType = Database['public']['Enums']['game_type']
export type MemberRole = Database['public']['Enums']['member_role']

export type UserBrief = {
  id?: string
  val_gamename?: string | null
  riot_gamename?: string | null
  avatar_url?: string | null
  country?: string | null
  tier?: string | null
  val_tier?: string | null
}

export type TeamBrief = {
  id?: string
  name: string
  abbreviation?: string | null
  game_type?: string | null
  tier_avg?: string | null
  logo_url?: string | null
}

export type MatchMap = {
  id: string
  map_name: string | null
  team1_score: number | null
  team2_score: number | null
  round_results: string | null
}

export type MatchStat = {
  id?: string
  user_id: string
  team_id: string
  map_id: string
  users: UserBrief | null
  kills: number
  deaths: number
  assists: number
  acs: number
  kast: number
  adr: number
  hs_pct: number
  fk: number
  fd: number
}

export type TeamMemberBrief = {
  user_id: string
  role?: string
  users: UserBrief | null
}

// 스크림 게시글 — Supabase 조인 시 teams가 배열로 추론될 수 있어 둘 다 허용
export type ScrimPost = {
  id: string
  game_type: string
  server?: string | null
  format?: string | null
  preferred_date?: string | null
  teams: TeamBrief | TeamBrief[] | null
}

// 팀원 모집 게시글 (LFT/LFP) — users/teams가 조인 시 배열로 추론될 수 있음
export type RecruitPost = {
  id: string
  user_id: string
  game_type: string
  tier?: string | null
  roles?: string[] | null
  note?: string | null
  discord_tag?: string | null
  created_at: string
  users?: UserBrief | UserBrief[] | null
  teams?: TeamBrief | TeamBrief[] | null
}
