export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
        ))}
      </div>
      <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
    </div>
  )
}
