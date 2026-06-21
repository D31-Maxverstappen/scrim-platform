'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'th' | 'pt' | 'es'

export const LANGUAGES: { code: Lang; label: string; fi: string }[] = [
  { code: 'ko', label: '한국어', fi: 'kr' },
  { code: 'en', label: 'English', fi: 'us' },
  { code: 'ja', label: '日本語', fi: 'jp' },
  { code: 'zh', label: '中文', fi: 'cn' },
  { code: 'th', label: 'ภาษาไทย', fi: 'th' },
  { code: 'pt', label: 'Português', fi: 'br' },
  { code: 'es', label: 'Español', fi: 'es' },
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
