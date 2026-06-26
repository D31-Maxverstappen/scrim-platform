const RIOT_API_KEY = process.env.RIOT_API_KEY!

export type RiotAccount = {
  puuid: string
  gameName: string
  tagLine: string
}

// 계정 조회 인메모리 캐시 — 동일 라이엇 ID 중복 호출 방지 (PUUID는 안정적이라 캐싱 안전)
const ACCOUNT_TTL_MS = 60 * 60 * 1000 // 1시간
const accountCache = new Map<string, { data: RiotAccount; expires: number }>()

// 라이엇 ID(이름#태그)로 계정 조회 (Account-V1)
export async function getRiotAccount(gameName: string, tagLine: string): Promise<RiotAccount | null> {
  const key = `${gameName.toLowerCase()}#${tagLine.toLowerCase()}`
  const cached = accountCache.get(key)
  if (cached && cached.expires > Date.now()) return cached.data

  let res: Response
  try {
    res = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    )
  } catch {
    return null // 네트워크 오류
  }

  if (res.status === 429) {
    console.warn('[riot] rate limited (429) on account lookup')
    return null
  }
  if (!res.ok) return null // 404(미존재) 등

  const data = (await res.json()) as RiotAccount
  if (accountCache.size > 500) accountCache.clear() // 무한 증식 방지
  accountCache.set(key, { data, expires: Date.now() + ACCOUNT_TTL_MS })
  return data
}
