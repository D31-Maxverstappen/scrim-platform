'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SuspendedWatcher({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const check = async () => {
      const { data } = await supabase
        .from('users')
        .select('suspended')
        .eq('id', userId)
        .single()
      if (data?.suspended) {
        await supabase.auth.signOut()
        router.push(`/suspended?uid=${userId}`)
      }
    }

    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [userId, router])

  return null
}
