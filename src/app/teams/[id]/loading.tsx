import { Skeleton } from '@/components/Skeleton'
import Sidebar from '@/components/Sidebar'

export default function TeamLoading() {
  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <Sidebar />
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        {/* 팀 헤더 */}
        <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
          <Skeleton className="w-20 h-20 rounded" />
          <div className="flex-1 flex flex-col gap-3">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-24 rounded" />
        </div>
        {/* 본문 2단 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#13131f] border border-white/5 rounded p-5 flex flex-col gap-3">
            <Skeleton className="h-3 w-24 mb-1" />
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
          <div className="bg-[#13131f] border border-white/5 rounded p-5 flex flex-col gap-3">
            <Skeleton className="h-3 w-20 mb-1" />
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
