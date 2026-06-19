'use client'

import { usePathname } from 'next/navigation'

export default function GameSwitcher() {
  const pathname = usePathname()
  const isValorant = pathname.startsWith('/valorant')
  const isLol = pathname.startsWith('/lol')

  const getPath = (game: 'valorant' | 'lol') => {
    if (pathname.startsWith('/valorant')) return pathname.replace('/valorant', `/${game}`)
    if (pathname.startsWith('/lol')) return pathname.replace('/lol', `/${game}`)
    return `/${game}/scrims`
  }

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 shrink-0">
      <a
        href={getPath('valorant')}
        className={`px-3 py-1 rounded-full text-xs font-black transition ${
          isValorant ? 'bg-[#ff4655] text-white' : 'text-slate-500 hover:text-white'
        }`}
      >
        VALORANT
      </a>
      <a
        href={getPath('lol')}
        className={`px-3 py-1 rounded-full text-xs font-black transition ${
          isLol ? 'bg-[#c89b3c] text-white' : 'text-slate-500 hover:text-white'
        }`}
      >
        LoL
      </a>
    </div>
  )
}
