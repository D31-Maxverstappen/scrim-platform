import { Skeleton } from '@/components/common/Skeleton'
import Sidebar from '@/components/layout/Sidebar'

export default function ScrimsLoading() {
  return (
    <div className="min-h-screen ml-56 bg-[#0a0a0a]">
      <Sidebar />
      <div className="pt-6 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#13131f] border border-white/5 rounded px-5 py-4 flex items-center gap-4">
              <Skeleton className="w-11 h-11 rounded" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2 w-24" />
              </div>
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
