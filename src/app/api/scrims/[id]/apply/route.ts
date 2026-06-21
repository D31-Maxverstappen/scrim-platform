import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'
import { inTierRange } from '@/lib/tiers'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: scrimPostId } = await params
  const { teamId } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 스크림 포스트 존재 확인
  const { data: post } = await supabase
    .from('scrim_posts')
    .select('id, status, team_id, tier_min, tier_max')
    .eq('id', scrimPostId)
    .single()

  if (!post) return NextResponse.json({ error: '스크림을 찾을 수 없어요.' }, { status: 404 })
  if (post.status !== 'open') return NextResponse.json({ error: '이미 마감된 스크림이에요.' }, { status: 400 })
  if (post.team_id === teamId) return NextResponse.json({ error: '자신의 팀에 신청할 수 없어요.' }, { status: 400 })

  // 신청 팀의 캡틴인지 확인
  const { data: team } = await supabase.from('teams').select('captain_id, name, tier_avg').eq('id', teamId).single()
  if (team?.captain_id !== user.id) return NextResponse.json({ error: '팀 캡틴만 신청할 수 있어요.' }, { status: 403 })

  // 티어 조건 체크
  if (!inTierRange(team?.tier_avg, post.tier_min, post.tier_max)) {
    return NextResponse.json({
      error: `티어 조건을 충족하지 않아요. (요구: ${post.tier_min ?? ''}${post.tier_min && post.tier_max ? ' ~ ' : ''}${post.tier_max ?? ''})`,
    }, { status: 400 })
  }

  // 중복 신청 확인
  const { data: existing } = await supabase
    .from('scrim_applications')
    .select('id, status')
    .eq('scrim_post_id', scrimPostId)
    .eq('applying_team_id', teamId)
    .single()

  if (existing) return NextResponse.json({ error: '이미 신청했어요.', status: existing.status }, { status: 400 })

  const { error } = await supabase
    .from('scrim_applications')
    .insert({ scrim_post_id: scrimPostId, applying_team_id: teamId, status: 'pending' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 게시 팀 캡틴에게 알림
  const { data: postTeam } = await supabase.from('teams').select('captain_id').eq('id', post.team_id).single()
  if (postTeam?.captain_id) {
    await notify(postTeam.captain_id, 'scrim_applied', '스크림 신청이 들어왔어요', `${team?.name ?? '상대팀'}이 신청했어요`, `/scrims/${scrimPostId}`)
  }

  return NextResponse.json({ success: true })
}
