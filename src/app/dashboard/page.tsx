export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0f0f13] p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">🎮 스크림 플랫폼</h1>
        <p className="text-slate-400 mb-8">환영해요!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/scrims" className="bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-xl p-6 transition cursor-pointer">
            <div className="text-3xl mb-3">📋</div>
            <h2 className="text-white font-bold text-lg mb-1">스크림 게시판</h2>
            <p className="text-slate-400 text-sm">스크림 상대를 찾아보세요</p>
          </a>

          <a href="/teams" className="bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-xl p-6 transition cursor-pointer">
            <div className="text-3xl mb-3">🛡️</div>
            <h2 className="text-white font-bold text-lg mb-1">팀 관리</h2>
            <p className="text-slate-400 text-sm">팀을 만들고 멤버를 관리하세요</p>
          </a>

          <a href="/profile" className="bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-xl p-6 transition cursor-pointer">
            <div className="text-3xl mb-3">👤</div>
            <h2 className="text-white font-bold text-lg mb-1">내 프로필</h2>
            <p className="text-slate-400 text-sm">전적과 매너 점수를 확인하세요</p>
          </a>
        </div>
      </div>
    </div>
  )
}
