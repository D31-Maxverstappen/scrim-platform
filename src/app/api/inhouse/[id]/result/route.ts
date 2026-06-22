import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { winnerTeam } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { data: room } = await admin.from('inhouse_rooms').select('host_id, status').eq('id', id).single()
  if (!room) return NextResponse.json({ error: '방 없음' }, { status: 404 })
  if (room.host_id !== user.id) return NextResponse.json({ error: '방장만 가능' }, { status: 403 })
  if (!['ongoing', 'full'].includes(room.status)) return NextResponse.json({ error: '진행중인 방이 아닙니다.' }, { status: 400 })
  if (!['A', 'B'].includes(winnerTeam)) return NextResponse.json({ error: '잘못된 팀' }, { status: 400 })

  await admin.from('inhouse_rooms').update({ status: 'done', winner_team: winnerTeam }).eq('id', id)

  return NextResponse.json({ ok: true })
}
