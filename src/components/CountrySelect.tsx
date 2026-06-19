'use client'

import { useState, useTransition } from 'react'
import { updateCountryAction } from '@/app/actions'

const COUNTRIES = [
  { code: 'KR', name: '대한민국', flag: '🇰🇷' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'TW', name: '대만', flag: '🇹🇼' },
  { code: 'HK', name: '홍콩', flag: '🇭🇰' },
  { code: 'SG', name: '싱가포르', flag: '🇸🇬' },
  { code: 'TH', name: '태국', flag: '🇹🇭' },
  { code: 'VN', name: '베트남', flag: '🇻🇳' },
  { code: 'PH', name: '필리핀', flag: '🇵🇭' },
  { code: 'ID', name: '인도네시아', flag: '🇮🇩' },
  { code: 'MY', name: '말레이시아', flag: '🇲🇾' },
  { code: 'AU', name: '호주', flag: '🇦🇺' },
  { code: 'GB', name: '영국', flag: '🇬🇧' },
  { code: 'DE', name: '독일', flag: '🇩🇪' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
  { code: 'BR', name: '브라질', flag: '🇧🇷' },
  { code: 'CA', name: '캐나다', flag: '🇨🇦' },
  { code: 'RU', name: '러시아', flag: '🇷🇺' },
  { code: 'MX', name: '멕시코', flag: '🇲🇽' },
]

export function getFlagUrl(code: string | null | undefined) {
  if (!code) return null
  return `https://flagcdn.com/w20/${code.toLowerCase()}.png`
}

export function FlagImg({ code, size = 20 }: { code: string | null | undefined; size?: number }) {
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/w${size}/${code.toLowerCase()}.png`}
      alt=""
      width={size}
      height={Math.round(size * 0.67)}
      style={{ imageRendering: 'pixelated', display: 'inline-block' }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

export default function CountrySelect({ initialCountry }: { initialCountry: string | null }) {
  const [country, setCountry] = useState(initialCountry ?? '')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleChange = (val: string) => {
    setCountry(val)
    setSaved(false)
    startTransition(async () => {
      await updateCountryAction(val)
      setSaved(true)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {country
        ? <FlagImg code={country} size={20} />
        : <span className="text-slate-600 text-xs">🌐</span>
      }
      <select
        value={country}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-[#1a1a2e] border border-white/10 text-white text-xs px-2 py-1 focus:outline-none focus:border-[#00D2BE] transition"
        style={{ colorScheme: 'dark' }}
      >
        <option value="">국가 선택</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
        ))}
      </select>
      {saved && <span className="text-[#00D2BE] text-xs">저장됨</span>}
      {isPending && <span className="text-slate-500 text-xs">저장 중...</span>}
    </div>
  )
}
