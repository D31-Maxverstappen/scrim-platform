import { mapIcon } from '@/lib/valorantMaps'

// 맵 썸네일 — 맵 매핑되면 공식 listViewIcon, 아니면 아무것도 안 그림.
// 크기·모서리는 className으로(예: 'w-9 h-9 rounded').
export default function MapIcon({
  map,
  className = '',
}: {
  map: string | null | undefined
  className?: string
}) {
  const src = mapIcon(map)
  if (!src) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={map ?? ''} className={`object-cover shrink-0 ${className}`} />
}
