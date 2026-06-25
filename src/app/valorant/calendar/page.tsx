export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // month 파라미터: "2026-06" 형식, 없으면 현재 달
  const now = new Date()
  const targetMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = targetMonth.split('-').map(Number)

  const monthStart = new Date(year, mon - 1, 1).toISOString()
  const monthEnd = new Date(year, mon, 1).toISOString()

  const { data: scrims } = await supabase
    .from('scrim_posts')
    .select('id, preferred_date, format, note, tier_min, tier_max, teams(id, name, tier_avg)')
    .eq('status', 'open')
    .eq('game_type', 'valorant')
    .gte('preferred_date', monthStart)
    .lt('preferred_date', monthEnd)
    .order('preferred_date', { ascending: true })

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <span className="text-xs font-black text-[#ff4655] uppercase tracking-widest">VALORANT</span>
          <h1 className="text-2xl font-bold text-white mt-1">스크림 캘린더</h1>
          <p className="text-slate-400 text-sm mt-1">날짜별 스크림 공고를 확인하세요</p>
        </div>
        <CalendarClient
          scrims={scrims ?? []}
          year={year}
          month={mon}
        />
      </div>
    </div>
  )
}
