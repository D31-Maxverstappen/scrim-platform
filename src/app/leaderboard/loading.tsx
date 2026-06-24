import { Skeleton } from '@/components/Skeleton'
import Sidebar from '@/components/Sidebar'

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <Sidebar />
      <div className="pt-6 max-w-3xl mx-auto px-6 py-8">
        <Skeleton className="h-7 w-32 mb-6" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-[#13131f] border border-white/5 rounded px-5 py-4 flex items-center gap-4">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-9 h-9 rounded" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-2 w-20" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
