// 기능 토글. 라이엇 API 정책 검토 등으로 일시 비활성화가 필요한 기능을 한 곳에서 끈다.

// 매너 평가/점수 시스템. 라이엇 일반정책의 "다른 플레이어를 평가하는 대체 채널 제공 금지"·
// "metric 기반 shame 금지"에 걸릴 소지가 있어, 프로덕션 키 신청 전 비활성화.
// 라이엇에 App Note로 문의해 허용 확인되면 true로 되돌린다. (입력·표시 모두 이 값으로 제어)
export const MANNER_ENABLED = false

// 전략 노트 작전판(맵 드로잉, Pro 후보). MVP 개발 중 — 룩·기능 확정 전까지 OFF(라이브 미노출).
export const STRATEGY_BOARD_ENABLED = false

// 트레이닝(연습실 — 반응속도·시가전 미션, Pro 후보). 라이브 공개(단, 좌측 nav엔 미노출=URL 아는 사람만).
export const TRAINING_ENABLED = true
