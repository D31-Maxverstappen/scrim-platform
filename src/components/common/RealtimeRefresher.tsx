'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeRefresher({ tables }: { tables: string[] }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    // 여러 테이블을 단일 채널에 묶어 구독한다. 채널(=동시 연결) 수가 Realtime 한도를
    // 좌우하므로, 테이블당 채널을 따로 열지 않고 1채널에 .on()을 여러 번 붙여 연결 수를 줄인다.
    const channel = tables.reduce(
      (ch, table) => ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        router.refresh()
      }),
      supabase.channel(`realtime:${tables.join(',')}`)
    )
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [router])

  return null
}
