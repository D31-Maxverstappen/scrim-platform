import { Skeleton } from '@/components/common/Skeleton'
import Sidebar from '@/components/layout/Sidebar'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen ml-56 bg-[#07070b]">
      <Sidebar />
      <div className="pt-6 max-w-3xl mx-auto px-6 py-10">
        {/* 헤더 */}
        <div className="bg-[#111118] border border-white/5 rounded p-8 flex items-center gap-6 mb-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {/* 게임 계정 */}
        <div className="bg-[#111118] border border-white/5 rounded p-5 mb-6 flex flex-col gap-3">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-10 w-48" />
        </div>
        {/* 스탯 3칸 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#111118] border border-white/5 rounded p-5 flex flex-col gap-3">
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
        {/* 최근 스크림 */}
        <div className="bg-[#111118] border border-white/5 rounded p-5 flex flex-col gap-3">
          <Skeleton className="h-3 w-24 mb-1" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    </div>
  )
}
