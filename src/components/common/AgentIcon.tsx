import { agentIcon } from '@/lib/valorantAgents'

// 요원 초상화 — 매핑 있으면 공식 아이콘, 없으면 이름 첫 글자 폴백.
// className으로 박스 크기·모서리·테두리 지정. char로 폴백 글자 크기.
export default function AgentIcon({
  agent,
  className = '',
  char = 'text-xs',
  style,
}: {
  agent: string
  className?: string
  char?: string
  style?: React.CSSProperties
}) {
  const src = agentIcon(agent)
  return (
    <span className={`shrink-0 overflow-hidden bg-[#1a1a2e] flex items-center justify-center ${className}`} style={style}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={agent} className="w-full h-full object-cover" />
      ) : (
        <span className={`text-white font-black ${char}`}>{agent[0]}</span>
      )}
    </span>
  )
}
