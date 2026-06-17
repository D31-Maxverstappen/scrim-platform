import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="pt-14 max-w-6xl mx-auto px-6">

        {/* ── 상단 히어로 배너 - 내 팀 현황 ── */}
        <div className="mt-8 relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-white/10 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-2">My Team</p>
              <h2 className="text-white text-2xl font-bold mb-1">소속된 팀이 없어요</h2>
              <p className="text-slate-400 text-sm">팀을 만들거나 참가해서 스크림을 시작하세요</p>
            </div>
            <div className="flex gap-3">
              <a href="/teams/create" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                + 팀 만들기
              </a>
              <a href="/teams" className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                팀 찾기
              </a>
            </div>
          </div>
        </div>

        {/* ── 다음 스크림 일정 ── */}
        <div className="mt-6 bg-[#1e1e2e] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">⚡ 다음 스크림 일정</h3>
            <a href="/scrims" className="text-indigo-400 text-xs hover:underline">전체 보기 →</a>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-slate-600">
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-sm">예정된 스크림이 없어요</p>
            <a href="/scrims" className="mt-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-sm px-4 py-2 rounded-lg transition">
              스크림 찾기
            </a>
          </div>
        </div>

        {/* ── 하단 그리드 ── */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">

          {/* 실시간 매칭 현황 */}
          <div className="md:col-span-2 bg-[#1e1e2e] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">🔴 실시간 스크림 모집</h3>
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Live
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {/* 빈 상태 */}
              <div className="text-center py-8 text-slate-600">
                <p className="text-sm">현재 모집 중인 스크림이 없어요</p>
                <a href="/scrims/post" className="mt-3 inline-block bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm px-4 py-2 rounded-lg transition">
                  + 스크림 올리기
                </a>
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드 */}
          <div className="flex flex-col gap-4">

            {/* 내 매너 점수 */}
            <div className="bg-[#1e1e2e] border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">💎 내 매너 점수</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-extrabold text-indigo-400">100</span>
                <span className="text-xs text-slate-400 bg-indigo-500/20 px-2 py-1 rounded-full">기본</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '50%' }} />
              </div>
              <p className="text-slate-500 text-xs mt-2">0 ~ 200점</p>
            </div>

            {/* 팀 랭킹 TOP 5 */}
            <div className="bg-[#1e1e2e] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">🏆 팀 랭킹</h3>
                <a href="/leaderboard" className="text-indigo-400 text-xs hover:underline">전체 →</a>
              </div>
              <div className="flex flex-col gap-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 text-center ${i === 1 ? 'text-yellow-400' : i === 2 ? 'text-slate-300' : i === 3 ? 'text-orange-400' : 'text-slate-600'}`}>
                      {i}
                    </span>
                    <div className="flex-1 h-3 bg-white/5 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
