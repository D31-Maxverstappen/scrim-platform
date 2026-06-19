import { Skeleton } from '@/components/Skeleton'
import Navbar from '@/components/Navbar'

export default function MatchLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 max-w-5xl mx-auto px-6 py-8">
        {/* 매치 헤더 */}
        <div className="border border-white/10 bg-[#13131f] mb-6 p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-12" />
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-2 w-20" />
            </div>
            <div className="text-center px-8">
              <Skeleton className="h-5 w-16 mx-auto" />
            </div>
            <div className="flex-1 flex flex-col gap-2 items-end">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        </div>

        {/* 로스터 비교 */}
        <div className="bg-[#13131f] border border-white/5 mb-6 p-4">
          <Skeleton className="h-3 w-24 mb-4" />
          <div className="grid grid-cols-[1fr_auto_1fr] gap-x-4 gap-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <>
                <Skeleton key={`l${i}`} className="h-12" />
                <div key={`m${i}`} className="w-8" />
                <Skeleton key={`r${i}`} className="h-12" />
              </>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-[#13131f] border border-white/5">
          <div className="flex border-b border-white/10 gap-1 px-2 pt-1">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
          </div>
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
