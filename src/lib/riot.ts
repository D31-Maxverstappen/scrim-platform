const RIOT_API_KEY = process.env.RIOT_API_KEY!

export type RiotAccount = {
  puuid: string
  gameName: string
  tagLine: string
}

export type SummonerTier = {
  tier: string
  rank: string
  lp: number
  wins: number
  losses: number
}

// 라이엇 ID(이름#태그)로 계정 조회
export async function getRiotAccount(gameName: string, tagLine: string): Promise<RiotAccount | null> {
  const res = await fetch(
    `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers: { 'X-Riot-Token': RIOT_API_KEY } }
  )
  if (!res.ok) return null
  return res.json()
}

// LoL 티어 조회 (puuid → summonerId → tier)
export async function getLolTier(puuid: string): Promise<SummonerTier | { error: string } | null> {
  const summonerRes = await fetch(
    `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    { headers: { 'X-Riot-Token': RIOT_API_KEY } }
  )
  if (!summonerRes.ok) {
    const body = await summonerRes.text()
    return { error: `소환사 조회 실패 (${summonerRes.status}): ${body}` }
  }
  const summoner = await summonerRes.json()

  const rankRes = await fetch(
    `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
    { headers: { 'X-Riot-Token': RIOT_API_KEY } }
  )
  if (!rankRes.ok) {
    const body = await rankRes.text()
    return { error: `랭크 조회 실패 (${rankRes.status}): ${body}` }
  }
  const ranks: { queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number }[] = await rankRes.json()
  const solo = ranks.find((r) => r.queueType === 'RANKED_SOLO_5x5')
  if (!solo) return { error: `솔로랭크 기록 없음 (전체 큐: ${ranks.map(r => r.queueType).join(', ') || '없음'})` }

  return { tier: solo.tier, rank: solo.rank, lp: solo.leaguePoints, wins: solo.wins, losses: solo.losses }
}

// 발로란트 티어 조회
export async function getValorantTier(puuid: string): Promise<SummonerTier | null> {
  const res = await fetch(
    `https://kr.api.riotgames.com/val/ranked/v1/leaderboards/by-act/TODO?size=1&startIndex=0`,
    { headers: { 'X-Riot-Token': RIOT_API_KEY } }
  )
  // 발로란트 개인 랭크 API는 별도 승인 필요 - 일단 null 반환
  return null
}

export function formatTier(tier: string, rank: string): string {
  const tierKo: Record<string, string> = {
    IRON: '아이언', BRONZE: '브론즈', SILVER: '실버', GOLD: '골드',
    PLATINUM: '플래티넘', EMERALD: '에메랄드', DIAMOND: '다이아몬드',
    MASTER: '마스터', GRANDMASTER: '그랜드마스터', CHALLENGER: '챌린저',
  }
  return `${tierKo[tier] ?? tier} ${rank}`
}
