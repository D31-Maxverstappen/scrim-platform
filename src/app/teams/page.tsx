export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// 구버전 최상위 팀 목록 → 정본(valorant) 리다이렉트. 정본: /valorant/teams
export default async function TeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  redirect('/valorant/teams')
}
