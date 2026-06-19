import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params
  const { action, format = 'BO3' } = await req.json() // 'accept' | 'reject'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 신청 정보 가져오기
  const { data: app } = await supabase
    .from('scrim_applications')
    .select('id, scrim_post_id, status')
    .eq('id', appId)
    .single()

  if (!app) return NextResponse.json({ error: '신청을 찾을 수 없어요.' }, { status: 404 })
  if (app.status !== 'pending') return NextResponse.json({ error: '이미 처리된 신청이에요.' }, { status: 400 })

  // 스크림 포스트의 팀 캡틴인지 확인
  const { data: post } = await supabase
    .from('scrim_posts')
    .select('team_id, teams(captain_id)')
    .eq('id', app.scrim_post_id)
    .single()

  const captain = (Array.isArray(post?.teams) ? post?.teams[0] : post?.teams) as { captain_id: string } | null
  if (captain?.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'
  await supabase.from('scrim_applications').update({ status: newStatus }).eq('id', appId)

  // 수락 시 매치 자동 생성
  if (action === 'accept') {
    const [{ data: scrimPost }, { data: applyApp }] = await Promise.all([
      supabase.from('scrim_posts').select('team_id, preferred_date').eq('id', app.scrim_post_id).single(),
      supabase.from('scrim_applications').select('applying_team_id').eq('id', appId).single(),
    ])

    if (!scrimPost) return NextResponse.json({ error: '스크림 포스트를 찾을 수 없어요.' }, { status: 404 })
    if (!applyApp?.applying_team_id) return NextResponse.json({ error: '신청 팀 정보를 찾을 수 없어요.' }, { status: 404 })

    await supabase.from('scrim_posts').update({ status: 'matched' }).eq('id', app.scrim_post_id)

    const mapCount = format === 'BO5' ? 5 : 3
    const { data: newMatch, error: matchError } = await supabase.from('matches').insert({
      scrim_post_id: app.scrim_post_id,
      team1_id: scrimPost.team_id,
      team2_id: applyApp.applying_team_id,
      match_date: scrimPost.preferred_date,
      status: 'scheduled',
      format,
    }).select('id').single()

    if (matchError || !newMatch?.id) {
      return NextResponse.json({ error: '매치 생성 실패: ' + matchError?.message }, { status: 500 })
    }

    const mapRows = Array.from({ length: mapCount }, (_, i) => ({
      match_id: newMatch.id,
      map_number: i + 1,
      map_name: 'TBD',
      team1_score: 0,
      team2_score: 0,
    }))
    await Promise.all([
      supabase.from('match_maps').insert(mapRows),
      supabase.from('scrim_applications').update({ match_id: newMatch.id }).eq('id', appId),
    ])

    return NextResponse.json({ success: true, matchId: newMatch.id })
  }

  return NextResponse.json({ success: true })
}
