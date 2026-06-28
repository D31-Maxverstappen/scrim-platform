import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 전략 노트 작성. RLS(team_notes_insert_member)가 본인 팀 + 본인 명의만 허용 →
// 비소속 팀 작성/상대 팀 노트 끼워넣기는 DB 레벨에서 차단된다.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  const { teamId, matchId, content } = await req.json()
  const text = (content ?? '').trim()
  if (!teamId || !text) return NextResponse.json({ error: '내용을 입력해 주세요.' }, { status: 400 })
  if (text.length > 4000) return NextResponse.json({ error: '내용이 너무 길어요. (최대 4000자)' }, { status: 400 })

  const { data, error } = await supabase
    .from('team_notes')
    .insert({ team_id: teamId, match_id: matchId ?? null, author_id: user.id, content: text })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: '작성 권한이 없거나 오류가 발생했어요.' }, { status: 403 })
  return NextResponse.json({ ok: true, id: data.id })
}
