export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RecruitBoard from '@/components/RecruitBoard'

export default async function RecruitPage({ searchParams }: { searchParams: Promise<{ type?: string; game?: string }> }) {
  const { type, game } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: posts } = await admin
    .from('recruitment_posts')
    .select('*, users(id, riot_gamename, val_gamename, val_tier, tier, avatar_url), teams(id, name, tier_avg, game_type)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-black text-2xl">모집 게시판</h1>
            <p className="text-slate-500 text-sm mt-1">팀을 찾거나 선수를 모집하세요</p>
          </div>
          <a href="/recruit/post"
            className="bg-[#00D2BE] hover:bg-[#00a896] text-white text-sm font-bold px-5 py-2.5 rounded transition">
            + 글 올리기
          </a>
        </div>

        <RecruitBoard
          posts={posts ?? []}
          currentUserId={user.id}
          initialType={type ?? 'lft'}
          initialGame={game ?? ''}
        />
      </div>
    </div>
  )
}
