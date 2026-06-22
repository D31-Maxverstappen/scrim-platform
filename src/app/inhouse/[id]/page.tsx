export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RoomClient from './RoomClient'

export default async function InhouseRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: room } = await supabase
    .from('inhouse_rooms')
    .select('*, host:users!host_id(id, val_gamename, riot_gamename, val_tier, tier, avatar_url)')
    .eq('id', id)
    .single()

  if (!room) redirect('/inhouse')

  const { data: participants } = await supabase
    .from('inhouse_participants')
    .select('id, user_id, team, joined_at, users(id, val_gamename, riot_gamename, val_tier, tier, avatar_url)')
    .eq('room_id', id)
    .order('joined_at', { ascending: true })

  const enriched = (participants ?? []).map((p: any) => ({
    ...p,
    users: Array.isArray(p.users) ? p.users[0] : p.users,
  }))

  const host = Array.isArray(room.host) ? room.host[0] : room.host
  const isHost = host?.id === user.id
  const isParticipant = enriched.some((p: any) => p.user_id === user.id)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 max-w-3xl mx-auto px-6 py-8">
        <RoomClient
          room={{ ...room, host }}
          participants={enriched}
          currentUserId={user.id}
          isHost={isHost}
          isParticipant={isParticipant}
        />
      </div>
    </div>
  )
}
