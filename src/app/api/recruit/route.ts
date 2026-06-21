import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

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

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // LFT/LFP 중복 방지
  if (type === 'lft') {
    const { count } = await admin
      .from('recruitment_posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'lft')
      .eq('status', 'active')
    if (count && count > 0) {
      return NextResponse.json({ error: '이미 활성 팀 구함 글이 있어요. 기존 글을 삭제 후 다시 올려주세요.' }, { status: 400 })
    }
  }

  if (type === 'lfp' && team_id) {
    const { count } = await admin
      .from('recruitment_posts')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', team_id)
      .eq('type', 'lfp')
      .eq('status', 'active')
    if (count && count > 0) {
      return NextResponse.json({ error: '이미 활성 선수 구함 글이 있어요. 기존 글을 삭제 후 다시 올려주세요.' }, { status: 400 })
    }
  }

  const { data, error } = await admin.from('recruitment_posts').insert({
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
