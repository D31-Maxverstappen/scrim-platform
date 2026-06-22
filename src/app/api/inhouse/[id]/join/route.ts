import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { data: room } = await admin.from('inhouse_rooms').select('status, max_players').eq('id', id).single()
  if (!room) return NextResponse.json({ error: '방 없음' }, { status: 404 })
  if (room.status !== 'recruiting') return NextResponse.json({ error: '모집이 마감되었습니다.' }, { status: 400 })

  const { count } = await admin.from('inhouse_participants').select('id', { count: 'exact', head: true }).eq('room_id', id)
  if ((count ?? 0) >= room.max_players) return NextResponse.json({ error: '인원이 꽉 찼습니다.' }, { status: 400 })

  const { error } = await admin.from('inhouse_participants').insert({ room_id: id, user_id: user.id })
  if (error) return NextResponse.json({ error: '이미 참가중입니다.' }, { status: 400 })

  // 인원 다 찼으면 상태 full로
  const newCount = (count ?? 0) + 1
  if (newCount >= room.max_players) {
    await admin.from('inhouse_rooms').update({ status: 'full' }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  await admin.from('inhouse_participants').delete().eq('room_id', id).eq('user_id', user.id)

  // 다시 모집중으로
  const { data: room } = await admin.from('inhouse_rooms').select('status').eq('id', id).single()
  if (room?.status === 'full') {
    await admin.from('inhouse_rooms').update({ status: 'recruiting' }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
