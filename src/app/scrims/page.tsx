import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ScrimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('scrim_posts')
    .select('*, teams(name, tier_avg)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0f0f13] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">📋 스크림 게시판</h1>
          <a
            href="/scrims/post"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + 스크림 올리기
          </a>
        </div>

        {posts && posts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-[#1e1e2e] rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold">{post.teams?.name}</span>
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                      {post.game_type === 'valorant' ? '발로란트' : '리그 오브 레전드'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    희망 일정: {new Date(post.preferred_date).toLocaleString('ko-KR')}
                  </p>
                  {post.note && <p className="text-slate-500 text-xs mt-1">{post.note}</p>}
                </div>
                <button className="bg-green-500/20 hover:bg-green-500/40 text-green-300 text-sm px-4 py-2 rounded-lg transition">
                  신청하기
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-20">
            <p className="text-4xl mb-4">🎮</p>
            <p>아직 스크림 모집 글이 없어요</p>
            <p className="text-sm mt-1">첫 번째로 올려보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}
