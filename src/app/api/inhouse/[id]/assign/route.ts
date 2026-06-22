import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { tierIndex } from '@/lib/tiers'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { data: room } = await admin.from('inhouse_rooms').select('host_id, team_mode, max_players').eq('id', id).single()
  if (!room) return NextResponse.json({ error: '방 없음' }, { status: 404 })
  if (room.host_id !== user.id) return NextResponse.json({ error: '방장만 가능' }, { status: 403 })

  const { data: participants } = await admin
    .from('inhouse_participants')
    .select('id, user_id, users(val_tier, tier)')
    .eq('room_id', id)

  if (!participants || participants.length < 2) {
    return NextResponse.json({ error: '참가자가 2명 이상이어야 합니다.' }, { status: 400 })
  }

  const half = Math.floor(participants.length / 2)
  let teamA: string[] = []
  let teamB: string[] = []

  if (room.team_mode === 'balanced') {
    // 티어 높은 순 정렬 후 지그재그 배정 (뱀 드래프트)
    const sorted = [...participants].sort((a, b) => {
      const au = Array.isArray(a.users) ? a.users[0] : a.users
      const bu = Array.isArray(b.users) ? b.users[0] : b.users
      return tierIndex(bu?.val_tier ?? bu?.tier) - tierIndex(au?.val_tier ?? au?.tier)
    })
    sorted.forEach((p, i) => {
      if (i % 4 === 0 || i % 4 === 3) teamA.push(p.user_id)
      else teamB.push(p.user_id)
    })
  } else {
    // 랜덤
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    teamA = shuffled.slice(0, half).map((p) => p.user_id)
    teamB = shuffled.slice(half).map((p) => p.user_id)
  }

  // 팀 배정 업데이트
  await Promise.all([
    ...teamA.map((uid) => admin.from('inhouse_participants').update({ team: 'A' }).eq('room_id', id).eq('user_id', uid)),
    ...teamB.map((uid) => admin.from('inhouse_participants').update({ team: 'B' }).eq('room_id', id).eq('user_id', uid)),
  ])

  await admin.from('inhouse_rooms').update({ status: 'ongoing' }).eq('id', id)

  return NextResponse.json({ ok: true })
}
