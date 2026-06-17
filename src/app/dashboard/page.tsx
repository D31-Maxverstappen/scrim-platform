import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <Navbar />

      <div className="pt-14 p-8 max-w-6xl mx-auto">
        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* 왼쪽 - 메인 메뉴 */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-white font-bold text-lg">메뉴</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/scrims" className="bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-xl p-6 transition">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-white font-bold text-lg mb-1">스크림 게시판</h3>
                <p className="text-slate-400 text-sm">스크림 상대를 찾아보세요</p>
              </a>
              <a href="/teams" className="bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-xl p-6 transition">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-white font-bold text-lg mb-1">팀 관리</h3>
                <p className="text-slate-400 text-sm">팀을 만들고 멤버를 관리하세요</p>
              </a>
              <a href="/leaderboard" className="bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-xl p-6 transition">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-white font-bold text-lg mb-1">리더보드</h3>
                <p className="text-slate-400 text-sm">팀 랭킹을 확인하세요</p>
              </a>
              <a href="/profile" className="bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-xl p-6 transition">
                <div className="text-3xl mb-3">👤</div>
                <h3 className="text-white font-bold text-lg mb-1">내 프로필</h3>
                <p className="text-slate-400 text-sm">전적과 매너 점수를 확인하세요</p>
              </a>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="flex flex-col gap-4">

            {/* 리더보드 미리보기 */}
            <div className="bg-[#1e1e2e] rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">🏆 팀 랭킹 TOP 5</h3>
              <div className="flex flex-col gap-2">
                {['—', '—', '—', '—', '—'].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500 w-4">{i + 1}</span>
                    <div className="flex-1 h-4 bg-[#2a2a3e] rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <a href="/leaderboard" className="text-indigo-400 text-xs mt-3 block hover:underline">전체 보기 →</a>
            </div>

            {/* 등록된 팀 현황 */}
            <div className="bg-[#1e1e2e] rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">🛡️ 등록된 팀 현황</h3>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>발로란트</span>
                  <span className="text-white font-bold">— 팀</span>
                </div>
                <div className="flex justify-between">
                  <span>리그 오브 레전드</span>
                  <span className="text-white font-bold">— 팀</span>
                </div>
              </div>
              <a href="/teams" className="text-indigo-400 text-xs mt-3 block hover:underline">팀 만들기 →</a>
            </div>

            {/* 최근 스크림 */}
            <div className="bg-[#1e1e2e] rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">⚔️ 최근 스크림</h3>
              <p className="text-slate-500 text-sm">아직 진행된 스크림이 없어요</p>
              <a href="/scrims" className="text-indigo-400 text-xs mt-3 block hover:underline">스크림 찾기 →</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
