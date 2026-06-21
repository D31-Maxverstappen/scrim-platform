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

const VALID: Lang[] = ['ko', 'en', 'ja', 'zh', 'th', 'pt', 'es']

function readLangCookie(): Lang {
  const match = document.cookie.split(';').find(c => c.trim().startsWith('lang='))
  const val = match?.split('=')[1] as Lang | undefined
  return val && VALID.includes(val) ? val : 'ko'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko')

  useEffect(() => {
    setLangState(readLangCookie())
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    document.cookie = `lang=${l};path=/;max-age=31536000`
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
