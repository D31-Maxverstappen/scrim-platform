import { NextRequest, NextResponse } from 'next/server'
import { getRiotAccount } from '@/lib/riot'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { assignDiscordRole } from '@/lib/discord'

async function getRoleId(admin: any, name: string): Promise<string | null> {
  const { data } = await admin.from('discord_roles').select('discord_role_id').eq('name', name).single()
  return data?.discord_role_id ?? null
}

export async function POST(req: NextRequest) {
  const { gameName, tagLine, gameType, tier, accountType } = await req.json()
  const account_type = accountType === 'coach' ? 'coach' : 'player'

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
    riot_puuid: account.puuid,
    riot_gamename: gameName,
    riot_tagline: tagLine,
    game_type: 'valorant',
    val_gamename: gameName,
    val_tagline: tagLine,
    val_tier: tier ?? null,
    tier: tier ?? null,
    account_type,
  }, { onConflict: 'id' })

  // Discord 역할 부여 (discord_id 있는 경우)
  const { data: profile } = await supabase.from('users').select('discord_id').eq('id', user.id).single()
  if (profile?.discord_id && tier) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const gameRoleName = 'VALORANT Player'
    const tierRoleName = `VAL ${tier}`

    const [gameRoleId, tierRoleId] = await Promise.all([
      getRoleId(admin, gameRoleName),
      getRoleId(admin, tierRoleName),
    ])

    await Promise.allSettled([
      gameRoleId ? assignDiscordRole(profile.discord_id, gameRoleId) : Promise.resolve(),
      tierRoleId ? assignDiscordRole(profile.discord_id, tierRoleId) : Promise.resolve(),
    ])
  }

  return NextResponse.json({ success: true, account })
}
