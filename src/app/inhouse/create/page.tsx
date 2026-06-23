export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CreateRoomForm from './CreateRoomForm'

export default async function CreateInhousePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <Sidebar />
      <div className="pt-6 max-w-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">내전 방 만들기</h1>
          <p className="text-slate-400 text-sm mt-1">방 설정 후 참가자를 모집하세요</p>
        </div>
        <CreateRoomForm />
      </div>
    </div>
  )
}
