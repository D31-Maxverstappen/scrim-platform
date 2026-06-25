import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

// 평가 → 점수 변화(delta) + 사유(manner_reason enum)
const RATINGS: Record<string, { delta: number; reason: string }> = {
  good:   { delta: 5,   reason: 'positive' },
  bad:    { delta: -10, reason: 'toxic' },
  noshow: { delta: -30, reason: 'no_show' },
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rating } = await req.json()
  const r = RATINGS[rating as string]
  if (!r) return NextResponse.json({ error: '잘못된 평가예요.' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { data: match } = await supabase
    .from('matches')
    .select('id, status, team1_id, team2_id')
    .eq('id', id)
    .single()
  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없어요.' }, { status: 404 })
  if (match.status !== 'completed') return NextResponse.json({ error: '종료된 매치만 평가할 수 있어요.' }, { status: 400 })

  // 요청자가 양 팀 중 한 팀의 캡틴인지 확인
  const { data: myTeam } = await supabase
    .from('teams')
    .select('id')
    .in('id', [match.team1_id, match.team2_id].filter((v): v is string => !!v))
    .eq('captain_id', user.id)
    .single()
  if (!myTeam) return NextResponse.json({ error: '평가 권한이 없어요. (팀 캡틴만 가능)' }, { status: 403 })

  const opponentId = myTeam.id === match.team1_id ? match.team2_id : match.team1_id

  // privileged write: 매너 평가 삽입은 서비스 롤로 수행
  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: members } = await admin
    .from('team_members')
    .select('user_id')
    .eq('team_id', opponentId)
    .neq('role', 'coach')
  if (!members || members.length === 0) return NextResponse.json({ error: '상대 팀원을 찾을 수 없어요.' }, { status: 400 })

  // 상대 팀의 각 멤버에게 평가 기록(본인 제외). 중복(같은 매치·평가자·대상)은 무시.
  const rows = members
    .filter((m) => m.user_id !== user.id)
    .map((m) => ({ match_id: id, from_user_id: user.id, to_user_id: m.user_id, delta: r.delta, reason: r.reason }))

  const { error } = await admin
    .from('manner_logs')
    .upsert(rows, { onConflict: 'match_id,from_user_id,to_user_id', ignoreDuplicates: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, rated: rows.length })
}
