import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminAppealsClient from './AdminAppealsClient'

export const dynamic = 'force-dynamic'

export default async function AdminAppealsPage() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: appeals } = await admin
    .from('appeals')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Appeals</p>
          <h1 className="text-white font-black text-2xl">이의 신청 관리</h1>
        </div>
        <AdminAppealsClient appeals={appeals ?? []} />
      </div>
    </div>
  )
}
