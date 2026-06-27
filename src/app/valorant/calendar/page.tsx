export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'
import { toDateInputValue } from '@/lib/datetime'

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // month 파라미터: "2026-06" 형식, 없으면 현재 달(KST 기준)
  const targetMonth = month ?? toDateInputValue().slice(0, 7)
  const [year, mon] = targetMonth.split('-').map(Number)

  // KST 월 경계 — 서버(UTC) 기준 new Date(y,m,1)은 9시간 어긋나 KST 자정~오전 9시 항목이 인접 월로 빠짐
  const pad = (n: number) => String(n).padStart(2, '0')
  const monthStart = new Date(`${year}-${pad(mon)}-01T00:00:00+09:00`).toISOString()
  const monthEnd = new Date(`${mon === 12 ? year + 1 : year}-${pad(mon === 12 ? 1 : mon + 1)}-01T00:00:00+09:00`).toISOString()

  const { data: scrims } = await supabase
    .from('scrim_posts')
    .select('id, preferred_date, format, note, tier_min, tier_max, teams(id, name, tier_avg)')
    .eq('status', 'open')
    .eq('game_type', 'valorant')
    .gte('preferred_date', monthStart)
    .lt('preferred_date', monthEnd)
    .order('preferred_date', { ascending: true })

  // 내 팀의 확정 스크림(matches) — 잡힌 스크림은 matches에 들어가므로 함께 표시
  const { data: myMemberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
  const myTeamIds = (myMemberships ?? []).map((m) => m.team_id).filter((id): id is string => !!id)

  let matches: { id: string; match_date: string | null; format: string | null; status: string | null; team1: { id: string; name: string } | null; team2: { id: string; name: string } | null }[] = []
  if (myTeamIds.length > 0) {
    const orFilter = myTeamIds.flatMap((id) => [`team1_id.eq.${id}`, `team2_id.eq.${id}`]).join(',')
    const { data: matchRows } = await supabase
      .from('matches')
      .select('id, match_date, format, status, team1:teams!team1_id(id, name), team2:teams!team2_id(id, name)')
      .or(orFilter)
      .gte('match_date', monthStart)
      .lt('match_date', monthEnd)
      .in('status', ['scheduled', 'completed'])
      .order('match_date', { ascending: true })
    matches = (matchRows ?? []).map((m) => ({
      ...m,
      team1: Array.isArray(m.team1) ? m.team1[0] : m.team1,
      team2: Array.isArray(m.team2) ? m.team2[0] : m.team2,
    }))
  }

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">스크림 캘린더</h1>
          <p className="text-slate-400 text-sm mt-1">날짜별 스크림 공고를 확인하세요</p>
        </div>
        <CalendarClient
          scrims={scrims ?? []}
          matches={matches}
          year={year}
          month={mon}
        />
      </div>
    </div>
  )
}
