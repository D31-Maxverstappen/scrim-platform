export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
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
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <Sidebar />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">SUPPORT</p>
          <h1 className="text-white font-black text-3xl">문의하기</h1>
          <p className="text-slate-500 text-sm mt-2">궁금한 점이나 불편한 사항을 남겨주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* 폼 */}
          <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-8">
            <InquiryForm displayName={displayName} />
          </div>

          {/* 우측 정보 패널 */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
              <p className="text-white font-bold text-sm mb-3">답변 안내</p>
              <ul className="text-slate-500 text-xs space-y-2.5">
                <li className="flex gap-2"><span className="text-[#00D2BE]">—</span>평균 답변 시간 1~2 영업일</li>
                <li className="flex gap-2"><span className="text-[#00D2BE]">—</span>접수 완료 후 알림으로 안내</li>
                <li className="flex gap-2"><span className="text-[#00D2BE]">—</span>버그 신고는 재현 방법을 포함해 주세요</li>
              </ul>
            </div>
            <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
              <p className="text-white font-bold text-sm mb-1">문의 이메일</p>
              <p className="text-[#00D2BE] text-xs font-mono mt-2 select-all">ceoofd31@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
