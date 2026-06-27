import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookmarkButton from '@/components/common/BookmarkButton'

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('target_type, target_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const scrimIds = (bookmarks ?? []).filter((b) => b.target_type === 'scrim_post').map((b) => b.target_id)
  const teamIds = (bookmarks ?? []).filter((b) => b.target_type === 'team').map((b) => b.target_id)

  const [scrimsRes, teamsRes] = await Promise.all([
    scrimIds.length
      ? supabase.from('scrim_posts').select('id, preferred_date, note, server, format, status, teams(name, tier_avg)').in('id', scrimIds)
      : Promise.resolve({ data: [] as any[] }),
    teamIds.length
      ? supabase.from('teams').select('id, name, abbreviation, tier_avg, wins, losses').in('id', teamIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  // 북마크한 순서 유지
  const orderMap = new Map((bookmarks ?? []).map((b, i) => [`${b.target_type}:${b.target_id}`, i]))
  const scrims = (scrimsRes.data ?? [])
    .map((s) => ({ ...s, teams: Array.isArray(s.teams) ? s.teams[0] : s.teams }))
    .sort((a, b) => (orderMap.get(`scrim_post:${a.id}`) ?? 0) - (orderMap.get(`scrim_post:${b.id}`) ?? 0))
  const teams = (teamsRes.data ?? [])
    .sort((a, b) => (orderMap.get(`team:${a.id}`) ?? 0) - (orderMap.get(`team:${b.id}`) ?? 0))

  const isEmpty = scrims.length === 0 && teams.length === 0

  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-black text-white mb-1">즐겨찾기</h1>
        <p className="text-slate-500 text-sm mb-8">저장한 스크림과 팀을 모아봐요.</p>

        {isEmpty ? (
          <div className="border border-white/5 bg-[#13131f] rounded p-12 text-center">
            <p className="text-slate-400 text-sm">아직 즐겨찾기한 항목이 없어요.</p>
            <p className="text-slate-600 text-xs mt-1">스크림이나 팀에서 북마크 버튼을 눌러보세요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">

            {/* 스크림 */}
            {scrims.length > 0 && (
              <section>
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">스크림 {scrims.length}</h2>
                <div className="flex flex-col gap-2">
                  {scrims.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 border border-white/5 bg-[#13131f] rounded px-5 py-4 hover:border-white/10 transition">
                      <Link href={`/scrims/${s.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-sm truncate">{s.teams?.name ?? '팀'}</span>
                          {s.teams?.tier_avg && <span className="text-[#00D2BE] text-xs">{s.teams.tier_avg}</span>}
                          {s.status !== 'open' && <span className="text-[11px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">{s.status}</span>}
                        </div>
                        <p className="text-slate-500 text-xs">
                          {[s.format, s.server, s.preferred_date].filter(Boolean).join(' · ') || '상세 보기'}
                        </p>
                      </Link>
                      <BookmarkButton type="scrim_post" id={s.id} initial refreshOnToggle />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 팀 */}
            {teams.length > 0 && (
              <section>
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">팀 {teams.length}</h2>
                <div className="flex flex-col gap-2">
                  {teams.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 border border-white/5 bg-[#13131f] rounded px-5 py-4 hover:border-white/10 transition">
                      <Link href={`/teams/${t.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-sm truncate">{t.name}</span>
                          {t.tier_avg && <span className="text-[#00D2BE] text-xs">{t.tier_avg}</span>}
                        </div>
                        <p className="text-slate-500 text-xs">{t.wins ?? 0}승 {t.losses ?? 0}패</p>
                      </Link>
                      <BookmarkButton type="team" id={t.id} initial refreshOnToggle />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
