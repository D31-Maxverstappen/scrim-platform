import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { game_type } = await req.json()

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('captain_id', user.id)
    .eq('game_type', game_type)
    .single()

  if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })

  await supabase.from('matchmaking_queue').delete().eq('team_id', team.id).eq('status', 'waiting')

  return NextResponse.json({ success: true })
}
