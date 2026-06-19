import { NextResponse } from 'next/server'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!
const CHANNEL_ID = '1517581328936210464' // 🔒│인증 채널

export async function GET() {
  const res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/invites`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ max_age: 0, max_uses: 0, unique: false }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: 'invite failed', detail: err }, { status: 500 })
  }

  const invite = await res.json()
  return NextResponse.json({ inviteUrl: `https://discord.gg/${invite.code}` })
}
