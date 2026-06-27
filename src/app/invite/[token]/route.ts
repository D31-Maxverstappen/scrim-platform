import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isCoachAccount } from '@/lib/account'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const origin = new URL(req.url).origin

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인 안 된 경우 → 쿠키 저장 후 로그인 페이지로
  if (!user) {
    const res = NextResponse.redirect(`${origin}/login`)
    res.cookies.set('invite_pending', token, { path: '/', maxAge: 30 * 60, httpOnly: true, sameSite: 'lax' })
    return res
  }

  // 초대 링크 조회
  const { data: invite } = await admin
    .from('invite_links')
    .select('type, target_id')
    .eq('token', token)
    .single()

  if (!invite) return NextResponse.redirect(`${origin}/dashboard`)

  if (invite.type === 'team') {
    const coach = await isCoachAccount(admin, user.id)

    if (coach) {
      // 코치: 다팀 허용 — 이 팀에 이미 있으면 그냥 팀 페이지로, 없으면 코치로 가입
      const { data: thisTeam } = await admin
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('team_id', invite.target_id)
        .maybeSingle()

      if (!thisTeam) {
        await admin.from('team_members').insert({
          team_id: invite.target_id,
          user_id: user.id,
          role: 'coach',
        })
      }
    } else {
      // 선수: 이미 어떤 팀이든 소속된 경우 → 가입 불가, 팀 페이지로만 이동
      const { data: existingMembership } = await admin
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingMembership) {
        return NextResponse.redirect(`${origin}/dashboard?error=already_in_team`)
      }

      await admin.from('team_members').insert({
        team_id: invite.target_id,
        user_id: user.id,
        role: 'player',
      })
    }
    return NextResponse.redirect(`${origin}/teams/${invite.target_id}`)
  }

  if (invite.type === 'inhouse') {
    const { data: room } = await admin
      .from('inhouse_rooms')
      .select('status, max_players')
      .eq('id', invite.target_id)
      .single()

    if (room?.status === 'recruiting') {
      const { count } = await admin
        .from('inhouse_participants')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', invite.target_id)

      if ((count ?? 0) < room.max_players) {
        await admin.from('inhouse_participants')
          .upsert({ room_id: invite.target_id, user_id: user.id }, { onConflict: 'room_id,user_id', ignoreDuplicates: true })

        if ((count ?? 0) + 1 >= room.max_players) {
          await admin.from('inhouse_rooms').update({ status: 'full' }).eq('id', invite.target_id)
        }
      }
    }
    return NextResponse.redirect(`${origin}/inhouse/${invite.target_id}`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
