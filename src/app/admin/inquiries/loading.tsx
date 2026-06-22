export default function Loading() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl">
        <div className="mb-6">
          <div className="h-3 w-16 rounded mb-2 animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
          <div className="h-7 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-4 flex flex-col gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="h-4 w-40 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-base)' }} />
              <div className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-base)' }} />
              <div className="h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-base)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
