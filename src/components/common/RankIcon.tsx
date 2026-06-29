import { rankIcon } from '@/lib/valorantRanks'

// 랭크 엠블럼 — 티어 매핑되면 공식 아이콘, 아니면 아무것도 안 그림.
export default function RankIcon({
  tier,
  size = 16,
  className = '',
}: {
  tier: string | null | undefined
  size?: number
  className?: string
}) {
  const src = rankIcon(tier)
  if (!src) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={tier ?? ''} width={size} height={size} className={`inline-block object-contain shrink-0 ${className}`} />
}
