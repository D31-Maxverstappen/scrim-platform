export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse ${className}`} />
}

export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="bg-[#13131f] border border-white/5 p-4 flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-2/3' : 'w-1/3'}`} />
      ))}
    </div>
  )
}
