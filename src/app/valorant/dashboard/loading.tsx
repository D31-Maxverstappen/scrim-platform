import { Skeleton } from '@/components/common/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen ml-56 bg-[#070711]">
      <div className="max-w-7xl mx-auto px-6 pb-16 pt-8">
        <Skeleton className="h-7 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#13131f] border border-white/5 rounded p-5 flex flex-col gap-3">
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#13131f] border border-white/5 rounded p-5 flex flex-col gap-3">
            <Skeleton className="h-3 w-24 mb-2" />
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
          <div className="bg-[#13131f] border border-white/5 rounded p-5 flex flex-col gap-3">
            <Skeleton className="h-3 w-20 mb-2" />
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
