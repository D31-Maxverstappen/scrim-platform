import { Skeleton } from '@/components/Skeleton'
import Navbar from '@/components/Navbar'

export default function TeamsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#13131f] border border-white/5 px-5 py-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-20" />
              </div>
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-2 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
