'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'th' | 'pt' | 'es'

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

const LanguageContext = createContext<{
  lang: Lang
  setLang: (lang: Lang) => void
}>({ lang: 'ko', setLang: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
