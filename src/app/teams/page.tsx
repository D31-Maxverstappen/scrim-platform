import Navbar from '@/components/Navbar'

const GAME_LABEL: Record<string, string> = {
  valorant:  '🎯 발로란트',
  lol:       '⚔️ 리그 오브 레전드',
  overwatch: '🦸 오버워치 2',
}

export default async function TeamsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-14 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">내 팀</h1>
            <p className="text-slate-400 text-sm mt-1">소속된 팀을 관리하세요</p>
          </div>
          <a href="/teams/create" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
            + 팀 만들기
          </a>
        </div>

        <div className="text-center text-slate-500 py-20">
          <p className="text-4xl mb-4">🛡️</p>
          <p>아직 소속된 팀이 없어요</p>
          <p className="text-sm mt-1">팀을 만들거나 초대를 기다려보세요!</p>
          <a href="/teams/create" className="mt-6 inline-block bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-sm px-5 py-2.5 rounded-xl transition">
            + 팀 만들기
          </a>
        </div>
      </div>
    </div>
  )
}
