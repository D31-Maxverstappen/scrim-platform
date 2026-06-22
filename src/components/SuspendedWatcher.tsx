'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SuspendedWatcher({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const check = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('suspended')
        .eq('id', userId)
        .single()

      if (error) return  // 네트워크 오류 등 일시적 실패는 무시

      if (data?.suspended === true) {
        await supabase.auth.signOut()
        router.push(`/suspended?uid=${userId}`)
      }
    }

    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [userId, router])

  return null
}
