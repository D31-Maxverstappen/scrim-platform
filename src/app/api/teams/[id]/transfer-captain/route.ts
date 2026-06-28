import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { notify } from '@/lib/notifications'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// 주장 양도: 현재 주장만 가능. 팀 주장 + 양쪽 멤버 role을 한 번에 교체.
// 새 주장은 출전 로스터(선수/IGL)만 가능 — 코치는 출전 로스터가 아니라 제외.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params
  const { newCaptainId } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  if (!newCaptainId) return NextResponse.json({ error: '양도할 대상이 필요해요.' }, { status: 400 })
  if (newCaptainId === user.id) return NextResponse.json({ error: '이미 주장이에요.' }, { status: 400 })

  const { data: team } = await supabase.from('teams').select('captain_id, name').eq('id', teamId).single()
  if (!team) return NextResponse.json({ error: '팀을 찾을 수 없어요.' }, { status: 404 })
  if (team.captain_id !== user.id) return NextResponse.json({ error: '주장만 양도할 수 있어요.' }, { status: 403 })

  // 대상이 이 팀의 선수(출전 로스터)인지 확인
  const { data: target } = await admin
    .from('team_members').select('role')
    .eq('team_id', teamId).eq('user_id', newCaptainId).maybeSingle()
  if (!target) return NextResponse.json({ error: '대상이 팀 멤버가 아니에요.' }, { status: 400 })
  if (!['player', 'igl'].includes(target.role)) {
    return NextResponse.json({ error: '선수에게만 주장을 넘길 수 있어요.' }, { status: 400 })
  }

  // 원자적 양도(service_role): 팀 주장 → 새 주장 role 'captain' → 옛 주장 role 'player'
  const { error: teamErr } = await admin.from('teams').update({ captain_id: newCaptainId }).eq('id', teamId)
  if (teamErr) return NextResponse.json({ error: teamErr.message }, { status: 500 })
  await admin.from('team_members').update({ role: 'captain' }).eq('team_id', teamId).eq('user_id', newCaptainId)
  await admin.from('team_members').update({ role: 'player' }).eq('team_id', teamId).eq('user_id', user.id)

  await notify(
    newCaptainId, 'captain_transfer',
    `${team.name} 주장이 되었어요`,
    '팀 주장 권한을 넘겨받았어요. 이제 팀을 관리할 수 있어요.',
    `/teams/${teamId}`,
  )

  return NextResponse.json({ success: true })
}
