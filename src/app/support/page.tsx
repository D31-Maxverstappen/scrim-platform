export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import InquiryForm from './InquiryForm'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('val_gamename, riot_gamename')
    .eq('id', user.id)
    .single()

  const displayName = profile?.val_gamename ?? profile?.riot_gamename ?? '—'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 max-w-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Support</p>
          <h1 className="text-white font-black text-2xl">문의하기</h1>
          <p className="text-slate-500 text-sm mt-1">궁금한 점이나 불편한 사항을 남겨주세요</p>
        </div>

        <InquiryForm userId={user.id} displayName={displayName} />
      </div>
    </div>
  )
}
