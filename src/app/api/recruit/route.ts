import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const body = await req.json()
  const { type, game_type, tier, roles, note, discord_tag, team_id } = body

  if (!type || !game_type) return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })

  if (type === 'lfp') {
    const { data: team } = await supabase.from('teams').select('captain_id').eq('id', team_id).single()
    if (!team || team.captain_id !== user.id) {
      return NextResponse.json({ error: '팀 캡틴만 선수 모집을 올릴 수 있어요.' }, { status: 403 })
    }
  }

  const { data, error } = await supabase.from('recruitment_posts').insert({
    user_id: user.id,
    team_id: team_id ?? null,
    type,
    game_type,
    tier: tier || null,
    roles: roles?.length ? roles : null,
    note: note || null,
    discord_tag: discord_tag || null,
    status: 'active',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
