import { cookies } from 'next/headers'
import type { Lang } from '@/contexts/LanguageContext'

const VALID: Lang[] = ['ko', 'en', 'ja', 'zh', 'th', 'pt', 'es']

export async function getLang(): Promise<Lang> {
  const jar = await cookies()
  const val = jar.get('lang')?.value as Lang | undefined
  return val && VALID.includes(val) ? val : 'ko'
}
