import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const CHANNEL_ID = '1517433927126749307'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { discordId } = await req.json()
  if (!discordId) return NextResponse.json({ error: 'No discord ID' }, { status: 400 })

  // 초대 링크 생성
  const inviteRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/invites`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ max_age: 0, max_uses: 1, unique: true }),
  })

  if (!inviteRes.ok) {
    const err = await inviteRes.json()
    return NextResponse.json({ error: 'invite failed', detail: err }, { status: 500 })
  }

  const invite = await inviteRes.json()
  const inviteUrl = `https://discord.gg/${invite.code}`

  // DM 채널 열기
  const dmChannelRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: discordId }),
  })

  if (!dmChannelRes.ok) {
    const err = await dmChannelRes.json()
    return NextResponse.json({ error: 'DM channel failed', detail: err }, { status: 500 })
  }

  const dmChannel = await dmChannelRes.json()

  // DM 전송
  const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `안녕하세요! D31 스크림 플랫폼에 오신 걸 환영해요 🎮\n아래 링크로 D31 공식 Discord 서버에 참여하세요!\n${inviteUrl}`,
    }),
  })

  if (!msgRes.ok) {
    const err = await msgRes.json()
    return NextResponse.json({ error: 'message failed', detail: err }, { status: 500 })
  }

  return NextResponse.json({ success: true, inviteUrl })
}
