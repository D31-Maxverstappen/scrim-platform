import Link from 'next/link'

export default function Pagination({
  page,
  total,
  pageSize,
  basePath,
  params = {},
}: {
  page: number
  total: number
  pageSize: number
  basePath: string
  params?: Record<string, string>
}) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const buildUrl = (p: number) => {
    const sp = new URLSearchParams({ ...params, page: String(p) })
    return `${basePath}?${sp.toString()}`
  }

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {page > 1 && (
        <Link href={buildUrl(page - 1)} className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded transition">←</Link>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`el-${i}`} className="px-2 py-2 text-xs text-slate-600">…</span>
        ) : (
          <Link key={p} href={buildUrl(p)}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition ${
              p === page ? 'bg-[#00D2BE] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={buildUrl(page + 1)} className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded transition">→</Link>
      )}
    </div>
  )
}
