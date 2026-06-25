import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { GameType } from '@/lib/types'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import ScrimsBoardClient from '@/components/ScrimsBoardClient'

export default async function ScrimsPage({ searchParams }: { searchParams: Promise<{ game?: string; q?: string; server?: string; format?: string }> }) {
  const { game = '', q = '', server = '', format = '' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('scrim_posts')
    .select('id, game_type, preferred_date, server, format, status, created_at, teams(id, name, tier_avg)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (game) query = query.eq('game_type', game as GameType)
  if (server) query = query.eq('server', server)
  if (format) query = query.eq('format', format)

  if (q) {
    const { data: matched } = await supabase.from('teams').select('id').ilike('name', `%${q}%`)
    const teamIds = matched?.map((t: any) => t.id) ?? []
    if (teamIds.length > 0) {
      query = query.in('team_id', teamIds)
    } else {
      return renderPage([], game, server, format, q)
    }
  }

  const { data: posts } = await query
  return renderPage(posts ?? [], game, server, format, q)
}

function renderPage(posts: any[], game: string, server: string, format: string, q: string) {
  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <RealtimeRefresher tables={["scrim_posts"]} />
      <Sidebar />
      <div className="pt-6 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">스크림 게시판</h1>
            <p className="text-slate-400 text-sm mt-1">팀을 만들고 스크림 상대를 구해보세요</p>
          </div>
          <Link href="/scrims/post" className="bg-[#00D2BE] hover:bg-[#00a896] text-white px-4 py-2 rounded text-sm font-semibold transition">
            + 스크림 올리기
          </Link>
        </div>

        {q && (
          <p className="text-slate-400 text-sm mb-4">
            "<span className="text-white">{q}</span>" 검색 결과 {posts.length}개
          </p>
        )}

        <ScrimsBoardClient posts={posts} game={game} server={server} format={format} />
      </div>
    </div>
  )
}
