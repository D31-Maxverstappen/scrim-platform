import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { type, targetId } = await req.json()

  if (!type || !targetId || (type !== 'team' && type !== 'inhouse')) {
    return NextResponse.json({ error: '필수 값 누락' }, { status: 400 })
  }

  // 본인 확인 — 발급자는 body가 아닌 세션에서만 결정한다 (사칭·위조 차단)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  }

  // 권한 확인 — 팀장/방장만 초대 링크를 발급할 수 있다
  if (type === 'team') {
    const { data: team } = await admin
      .from('teams')
      .select('captain_id')
      .eq('id', targetId)
      .single()
    if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })
    if (team.captain_id !== user.id) {
      return NextResponse.json({ error: '팀장만 초대할 수 있어요.' }, { status: 403 })
    }
  } else {
    const { data: room } = await admin
      .from('inhouse_rooms')
      .select('host_id')
      .eq('id', targetId)
      .single()
    if (!room) return NextResponse.json({ error: '방을 찾을 수 없어요.' }, { status: 404 })
    if (room.host_id !== user.id) {
      return NextResponse.json({ error: '방장만 초대할 수 있어요.' }, { status: 403 })
    }
  }

  const token = randomUUID()
  const { data, error } = await admin
    .from('invite_links')
    .upsert(
      { type, target_id: targetId, created_by: user.id, token },
      { onConflict: 'type,target_id,created_by', ignoreDuplicates: false }
    )
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token: data.token })
}
