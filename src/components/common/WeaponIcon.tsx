import { weaponIcon } from '@/lib/valorantWeapons'

// 무기 아이콘(가로형) — 무기 매핑되면 공식 displayIcon, 아니면 아무것도 안 그림.
// 크기는 className으로(예: 'h-4 w-auto').
export default function WeaponIcon({
  weapon,
  className = '',
}: {
  weapon: string | null | undefined
  className?: string
}) {
  const src = weaponIcon(weapon)
  if (!src) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={weapon ?? ''} className={`object-contain shrink-0 ${className}`} />
}
