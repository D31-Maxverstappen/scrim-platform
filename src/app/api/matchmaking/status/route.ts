import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { GameType } from '@/lib/types'

export async function GET(req: NextRequest) {
  const game_type = req.nextUrl.searchParams.get('game_type')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ status: 'idle' })

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('captain_id', user.id)
    .eq('game_type', game_type as GameType)
    .single()

  if (!team) return NextResponse.json({ status: 'idle' })

  const { data: entry } = await supabase
    .from('matchmaking_queue')
    .select('status, match_id, created_at, format, server')
    .eq('team_id', team.id)
    .single()

  if (!entry) return NextResponse.json({ status: 'idle' })

  // 매치가 완료/취소됐으면 큐 정리 후 idle 반환
  if (entry.status === 'matched' && entry.match_id) {
    const { data: match } = await supabase.from('matches').select('status').eq('id', entry.match_id).single()
    if (!match || match.status === 'completed' || match.status === 'cancelled') {
      await supabase.from('matchmaking_queue').delete().eq('team_id', team.id)
      return NextResponse.json({ status: 'idle' })
    }
  }

  return NextResponse.json({
    status: entry.status,
    matchId: entry.match_id,
    since: entry.created_at,
    format: entry.format,
    server: entry.server,
  })
}
