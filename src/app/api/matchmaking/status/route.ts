import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const game_type = req.nextUrl.searchParams.get('game_type')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ status: 'idle' })

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('captain_id', user.id)
    .eq('game_type', game_type)
    .single()

  if (!team) return NextResponse.json({ status: 'idle' })

  const { data: entry } = await supabase
    .from('matchmaking_queue')
    .select('status, match_id, created_at, format, server')
    .eq('team_id', team.id)
    .single()

  if (!entry) return NextResponse.json({ status: 'idle' })

  return NextResponse.json({
    status: entry.status,
    matchId: entry.match_id,
    since: entry.created_at,
    format: entry.format,
    server: entry.server,
  })
}
