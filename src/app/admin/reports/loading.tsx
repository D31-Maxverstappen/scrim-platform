export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-36 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="h-96 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
    </div>
  )
}
