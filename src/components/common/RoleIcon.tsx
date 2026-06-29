import { roleIcon } from '@/lib/valorantRoles'

// 역할 아이콘 — 역할 매핑되면 공식 아이콘, 아니면 아무것도 안 그림.
export default function RoleIcon({
  role,
  size = 14,
  className = '',
}: {
  role: string | null | undefined
  size?: number
  className?: string
}) {
  const src = roleIcon(role)
  if (!src) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={role ?? ''} width={size} height={size} className={`inline-block object-contain shrink-0 ${className}`} />
}
