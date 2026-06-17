import { NextRequest, NextResponse } from 'next/server'
import { getRiotAccount } from '@/lib/riot'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { gameName, tagLine, gameType, tier } = await req.json()

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: '이름과 태그를 입력해주세요.' }, { status: 400 })
  }

  const account = await getRiotAccount(gameName, tagLine)
  if (!account) {
    return NextResponse.json({ error: '라이엇 계정을 찾을 수 없어요. 이름#태그 형식을 확인해주세요.' }, { status: 404 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })

  await supabase.from('users').upsert({
    id: user.id,
    summoner_name: `${gameName}#${tagLine}`,
    riot_puuid: account.puuid,
    riot_gamename: gameName,
    riot_tagline: tagLine,
    game_type: gameType,
    tier: tier ?? null,
  }, { onConflict: 'id' })

  return NextResponse.json({ success: true, account })
}
