import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { recalcTierAvg } from '@/lib/tierUtils'
import { removeDiscordRole } from '@/lib/discord'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const { userId: targetUserId } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: team } = await supabase
    .from('teams')
    .select('captain_id, discord_role_id')
    .eq('id', teamId)
    .single()

  if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })
  if (team.captain_id !== user.id) return NextResponse.json({ error: '권한이 없어요.' }, { status: 403 })
  if (targetUserId === user.id) return NextResponse.json({ error: '본인은 내보낼 수 없어요.' }, { status: 400 })

  const { error } = await admin
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', targetUserId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcTierAvg(supabase, teamId)

  // Discord 역할 제거
  if (team.discord_role_id) {
    const { data: profile } = await admin.from('users').select('discord_id').eq('id', targetUserId).single()
    if (profile?.discord_id) {
      await removeDiscordRole(profile.discord_id, team.discord_role_id).catch(() => {})
    }
  }

  return NextResponse.json({ success: true })
}
