'use client'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f13] border-b border-white/10 px-6 h-14 flex items-center justify-between">
      <a href="/" className="text-white font-bold text-xl tracking-widest hover:text-indigo-400 transition">
        D31
      </a>
      <div className="flex items-center gap-6 text-sm text-slate-400">
        <a href="/scrims" className="hover:text-white transition">스크림 게시판</a>
        <a href="/teams" className="hover:text-white transition">팀</a>
        <a href="/leaderboard" className="hover:text-white transition">리더보드</a>
        <a href="/profile" className="hover:text-white transition">내 프로필</a>
      </div>
    </nav>
  )
}
