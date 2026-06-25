-- 2026-06-25 보안 패치: 미사용 discord_access_token 컬럼 제거
--
-- [배경] 로그인 콜백(auth/callback)에서 저장만 하고 코드 어디서도 읽지 않던
--        Discord OAuth 액세스 토큰. 탈취 시 Discord 계정 접근까지 번질 수 있는
--        고위험 자산을 "안 쓰면서" 보관 중 → 개인정보보호법 최소수집·보관 원칙 위반 소지.
--        ※ 마이그레이션 005에서 anon 접근은 이미 차단됨(service_role 전용).
--
-- [조치] 코드에서 저장을 먼저 중단(auth/callback에서 discord_access_token 쓰기 제거)한 뒤,
--        users.discord_access_token 컬럼 자체를 드롭하여 잔존 토큰을 영구 파기.
--
-- ⚠️ 파괴적 변경: 컬럼과 기존 토큰 데이터가 영구 삭제됩니다(복구 불가).
--    적용 전 대표님 승인 + 백업 확인 후 실행할 것.
--    적용 후: `database.types.ts` 재생성 권장.

ALTER TABLE public.users DROP COLUMN IF EXISTS discord_access_token;
