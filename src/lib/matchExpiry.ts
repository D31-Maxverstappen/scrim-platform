import { createClient } from '@supabase/supabase-js'

// 유예가 지나도 진행되지 않은 예정 매치를 '미진행'으로 자동 취소.
// 수락형 스크림(scrim_post_id 있음)은 약속시간 기준 6h, 자동매칭 즉시 매치(scrim_post_id 없음)는
// 매칭시각 기준 2h — '지금 바로' 성격이라 죽은 매치를 빨리 정리한다.
const SCHEDULED_GRACE_HOURS = 6
const INSTANT_GRACE_HOURS = 2

// 조회 시 만료(lazy): 주요 페이지 로드 시 호출. service_role로 본인 소유 무관 일괄 정리(멱등).
// 베스트에포트 — 실패해도 페이지 렌더는 계속되도록 throw하지 않음.
export async function expireStaleMatches(): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return
    const admin = createClient(url, key)
    const now = Date.now()
    const scheduledCutoff = new Date(now - SCHEDULED_GRACE_HOURS * 60 * 60 * 1000).toISOString()
    const instantCutoff = new Date(now - INSTANT_GRACE_HOURS * 60 * 60 * 1000).toISOString()
    await Promise.all([
      // 수락형 스크림: 약속시간 + 6h
      admin
        .from('matches')
        .update({ status: 'cancelled', cancel_reason: 'expired' })
        .eq('status', 'scheduled')
        .not('scrim_post_id', 'is', null)
        .lt('match_date', scheduledCutoff),
      // 자동매칭 즉시 매치: 매칭시각 + 2h
      admin
        .from('matches')
        .update({ status: 'cancelled', cancel_reason: 'expired_instant' })
        .eq('status', 'scheduled')
        .is('scrim_post_id', null)
        .lt('match_date', instantCutoff),
    ])
  } catch {
    // 무시: 만료 정리는 베스트에포트
  }
}

// 취소 사유 표시용 라벨
export const CANCEL_REASON_LABEL: Record<string, string> = {
  expired: '약속한 시간에 매치가 진행되지 않았어요',
  expired_instant: '즉시 매치가 제때 시작되지 않았어요',
  captain_cancelled: '상대 팀 캡틴이 매치를 취소했어요',
}

export const CANCEL_REASON_BADGE: Record<string, string> = {
  expired: '미진행',
  expired_instant: '미진행',
  captain_cancelled: '취소됨',
}
