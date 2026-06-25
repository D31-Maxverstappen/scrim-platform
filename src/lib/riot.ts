const RIOT_API_KEY = process.env.RIOT_API_KEY!

export type RiotAccount = {
  puuid: string
  gameName: string
  tagLine: string
}

// 라이엇 ID(이름#태그)로 계정 조회 (Account-V1)
export async function getRiotAccount(gameName: string, tagLine: string): Promise<RiotAccount | null> {
  const res = await fetch(
    `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers: { 'X-Riot-Token': RIOT_API_KEY } }
  )
  if (!res.ok) return null
  return res.json()
}
