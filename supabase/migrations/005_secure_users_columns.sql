-- 2026-06-25 보안 패치: users 테이블 민감 컬럼 노출 차단
--
-- [문제] users RLS가 `users_read_all USING (true)`(전체 공개) + 테이블 전체 SELECT 권한이라,
--        anon 키(클라이언트에 공개됨)만 있으면 누구나 아래 요청으로 전 유저의
--        민감정보를 긁어갈 수 있었음:
--          GET /rest/v1/users?select=discord_access_token,riot_puuid,discord_id
--
-- [조치] 테이블 단위 SELECT 권한을 회수하고, 공개해도 안전한 컬럼만 화이트리스트로 재허용.
--        민감 3컬럼(discord_access_token, riot_puuid, discord_id)은 service_role(서버)만 접근.
--        ※ 이 컬럼들은 코드상 전부 서버(service_role)/관리자에서만 사용 → 기능 영향 없음.
--
-- 적용: 서울 프로젝트(ap-northeast-2)에 2026-06-25 적용·검증 완료.

REVOKE SELECT ON public.users FROM anon, authenticated;

GRANT SELECT (
  id, avatar_url, country, created_at, updated_at, game_type,
  is_admin, is_banned, suspended, suspended_at,
  manner_score, rank, tier,
  riot_gamename, riot_tagline, val_gamename, val_tagline, val_tier,
  lol_gamename, lol_tagline, lol_tier, summoner_name
) ON public.users TO anon, authenticated;
