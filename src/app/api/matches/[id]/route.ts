import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: match } = await supabase
    .from('matches')
    .select('id, status, team1_id, team2_id')
    .eq('id', id)
    .single()

  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없어요.' }, { status: 404 })
  if (match.status === 'completed') return NextResponse.json({ error: '완료된 매치는 취소할 수 없어요.' }, { status: 400 })

  // 양 팀 중 하나의 캡틴인지 확인
  const { data: captainCheck } = await supabase
    .from('teams')
    .select('id')
    .in('id', [match.team1_id, match.team2_id])
    .eq('captain_id', user.id)
    .single()

  if (!captainCheck) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  await supabase.from('match_player_stats').delete().eq('match_id', id)
  await supabase.from('match_maps').delete().eq('match_id', id)
  await supabase.from('matches').delete().eq('id', id)

  return NextResponse.json({ success: true })
}
