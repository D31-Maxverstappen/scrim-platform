export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// 구버전 최상위 스크림 목록 → 정본(valorant) 리다이렉트. 정본: /valorant/scrims
export default async function ScrimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  redirect('/valorant/scrims')
}
