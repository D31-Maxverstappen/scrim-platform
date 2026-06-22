import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { userId, title, teamMode, maxPlayers, tierMin, tierMax, scheduledAt, isPrivate } = await req.json()

  if (!userId || !title) return NextResponse.json({ error: '필수 값 누락' }, { status: 400 })

  const { data, error } = await admin.from('inhouse_rooms').insert({
    host_id: userId,
    title,
    team_mode: teamMode ?? 'random',
    max_players: maxPlayers ?? 10,
    tier_min: tierMin ?? null,
    tier_max: tierMax ?? null,
    scheduled_at: scheduledAt ?? null,
    is_private: isPrivate ?? false,
    game_type: 'valorant',
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 방장 자동 참가
  await admin.from('inhouse_participants').insert({ room_id: data.id, user_id: userId })

  return NextResponse.json({ id: data.id })
}
