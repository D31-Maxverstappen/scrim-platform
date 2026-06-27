export const dynamic = 'force-dynamic'

import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminInquiriesClient from './AdminInquiriesClient'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminInquiriesPage() {
  const { data: inquiries } = await admin
    .from('inquiries')
    .select('*, users(val_gamename, riot_gamename)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl">
        <div className="mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Support</p>
          <h1 className="text-white font-black text-2xl">문의 관리</h1>
        </div>
        <AdminInquiriesClient inquiries={inquiries ?? []} />
      </div>
    </div>
  )
}
