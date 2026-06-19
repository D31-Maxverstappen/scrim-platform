export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('game_type').eq('id', user.id).single()
  const game = profile?.game_type === 'lol' ? 'lol' : 'valorant'
  redirect(`/${game}/dashboard`)
}
