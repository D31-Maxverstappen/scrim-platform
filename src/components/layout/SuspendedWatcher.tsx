'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SuspendedWatcher({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const enforce = async () => {
      await supabase.auth.signOut()
      router.push(`/suspended?uid=${userId}`)
    }

    // 마운트 시 1회만 체크 — 이미 정지된 채 접속한 경우 차단 (반복 폴링은 제거)
    fetch('/api/me/suspended')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => { if (d?.suspended) enforce() })
      .catch(() => {})

    // 본인 users 행의 정지 상태 변경을 실시간 감지 (5초 폴링 대체 — 지연 0·부하 0)
    const channel = supabase
      .channel(`suspended:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload) => { if ((payload.new as { suspended?: boolean }).suspended === true) enforce() },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, router])

  return null
}
