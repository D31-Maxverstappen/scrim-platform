// 날짜/시간 표시·입력을 항상 KST(Asia/Seoul)로 고정한다.
// 서버 컴포넌트는 Vercel(UTC)에서 렌더되므로 timeZone을 명시하지 않으면
// 한국 사용자에게 9시간 어긋난 값이 보인다. 도메인이 한국 전용이라 KST로 못박는다.
const KST = 'Asia/Seoul'

// 날짜/시간 표시 — 기존 toLocaleString 옵션을 그대로 받되 KST를 강제 주입한다.
// null/undefined는 빈 문자열(호출부의 삼항 fallback과 호환).
export function formatKST(
  dt: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  if (!dt) return ''
  return new Date(dt).toLocaleString('ko-KR', { ...options, timeZone: KST })
}

// <input type="date"> 값(YYYY-MM-DD) — KST 기준. 인자 없으면 "오늘"(KST).
// toISOString().split('T')[0]은 UTC라 KST 0~9시에 하루 어긋나므로 이걸 쓴다.
export function toDateInputValue(dt: string | Date = new Date()): string {
  return new Date(dt).toLocaleDateString('en-CA', { timeZone: KST }) // en-CA = YYYY-MM-DD
}
