import { Skeleton } from '@/components/common/Skeleton'

export default function ValorantMatchesLoading() {
  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <div className="pt-6 max-w-5xl mx-auto px-6 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        {/* 요약 헤더 */}
        <div className="border border-white/10 bg-[#13131f] rounded mb-6 p-8">
          <div className="flex items-center gap-5 mb-7">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#0e0e16] border border-white/5 rounded px-3 py-2.5 flex flex-col gap-2">
                <Skeleton className="h-2 w-12" />
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </div>
        {/* 매치 목록 */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#13131f] border border-white/5 rounded px-5 py-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-20" />
              </div>
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
