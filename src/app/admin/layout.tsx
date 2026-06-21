import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await adminDb.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-8">
        {children}
      </main>
    </div>
  )
}
