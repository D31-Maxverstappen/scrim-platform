import { Skeleton } from '@/components/common/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen ml-56 bg-[#0d0d14]">
      <div className="pt-6 max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">

          {/* 사이드바 */}
          <aside className="w-64 shrink-0 flex flex-col gap-3">
            <div className="bg-[#13131f] border border-white/5 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-2/3" />
            </div>
            <div className="bg-[#13131f] border border-white/5 p-4 flex flex-col gap-2">
              <Skeleton className="h-2 w-1/3 mb-1" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-1 w-full" />
            </div>
            <div className="bg-[#13131f] border border-white/5 p-4 flex flex-col gap-2">
              <Skeleton className="h-2 w-1/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </aside>

          {/* 메인 */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">
            {/* 통계 바 */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#13131f] border border-white/5 p-4">
                  <Skeleton className="h-2 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>

            {/* 받은 스크림 신청 */}
            <div className="bg-[#13131f] border border-white/5">
              <div className="px-4 py-3 border-b border-white/5">
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="px-4 py-6 flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2 w-1/3" />
                    </div>
                    <Skeleton className="h-7 w-14" />
                    <Skeleton className="h-7 w-14" />
                  </div>
                ))}
              </div>
            </div>

            {/* 스크림 목록 */}
            <div className="bg-[#13131f] border border-white/5">
              <div className="px-4 py-3 border-b border-white/5 flex gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-4 py-3 border-t border-white/5 flex items-center gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-2 w-1/3" />
                  </div>
                  <Skeleton className="h-2 w-16" />
                </div>
              ))}
            </div>

            {/* 하단 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#13131f] border border-white/5">
                  <div className="px-4 py-3 border-b border-white/5">
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-3 w-6" />
                        <Skeleton className="h-3 flex-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
