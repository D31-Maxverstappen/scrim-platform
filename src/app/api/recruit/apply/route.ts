import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { notify } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  // 이미 팀이 있으면 차단
  const { data: myTeam } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single()
  if (myTeam) return NextResponse.json({ error: '이미 팀에 소속되어 있어요.' }, { status: 400 })

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: '잘못된 요청이에요.' }, { status: 400 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: post } = await admin
    .from('recruitment_posts')
    .select('id, team_id, user_id, teams(captain_id), users(riot_gamename, val_gamename, discord_tag)')
    .eq('id', postId)
    .single()

  if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없어요.' }, { status: 404 })
  if (post.user_id === user.id) return NextResponse.json({ error: '본인 글에는 신청할 수 없어요.' }, { status: 400 })

  const team = Array.isArray(post.teams) ? post.teams[0] : post.teams
  const captainId = team?.captain_id ?? post.user_id

  // LFP(선수 모집) 글이면 team_join_requests에 기록 → 캡틴이 팀 관리에서 수락/거절 가능
  if (post.team_id) {
    const { data: existingRequest } = await admin
      .from('team_join_requests')
      .select('id')
      .eq('team_id', post.team_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingRequest) return NextResponse.json({ error: '이미 신청한 팀이에요.' }, { status: 400 })

    await admin.from('team_join_requests').insert({
      team_id: post.team_id,
      user_id: user.id,
      status: 'pending',
    })
  }

  // 내 프로필
  const { data: myProfile } = await supabase
    .from('users')
    .select('riot_gamename, val_gamename, discord_tag')
    .eq('id', user.id)
    .single()

  const myName = myProfile?.riot_gamename ?? myProfile?.val_gamename ?? '누군가'

  // 캡틴에게 알림
  await notify(
    captainId,
    'join_request',
    '팀 가입 신청이 왔어요!',
    `${myName}님이 선수 모집 글에 가입 신청을 했어요.${myProfile?.discord_tag ? ` Discord: ${myProfile.discord_tag}` : ''}`,
    post.team_id ? `/teams/${post.team_id}/manage` : `/recruit`,
  )

  return NextResponse.json({ success: true })
}
