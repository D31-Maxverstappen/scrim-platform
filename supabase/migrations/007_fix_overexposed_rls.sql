-- 2026-06-26 보안 패치: RLS 과다공개 정책 2건 수정 (전반 감사에서 발견)
--
-- [배경] 전반 보안 감사 결과 RLS는 26개 테이블 전부 활성화돼 있었으나,
--        아래 2개 정책이 USING(true)로 과다 공개돼 데이터 유입 시 노출/조작 위험이 있었음.
--          1) manner_logs.manner_read_all  : SELECT USING(true) → 매너평가 raw로그 전체공개
--          2) matchmaking_queue.mq_all      : ALL USING(true)   → anon이 큐 조회·조작·삭제 가능(최악)
--
-- [조치]
--   - manner_logs: 전체공개 정책 제거. 본인 관련만 보는 manner_logs_select_own 정책이
--     코드(매치 상세에서 from_user_id=본인 조회)를 그대로 커버하므로 기능 영향 없음.
--   - matchmaking_queue: ALL+true 제거 후, 본인이 속한 팀의 큐만 SELECT/DELETE 허용
--     (status 조회·cancel 삭제·realtime 구독은 전부 본인 팀 team_id 기준이라 동작 유지).
--     INSERT/UPDATE는 서버(api/matchmaking/join, service_role)만 수행 → 클라 정책 불필요(자동 deny).
--
-- 적용: atmmt(서울) 프로덕션에 2026-06-26 적용·anon INSERT 42501 차단 + pg_policies 실증검증 완료.

-- 1) manner_logs: 전체공개 SELECT 정책 제거
DROP POLICY IF EXISTS "manner_read_all" ON public.manner_logs;

-- 2) matchmaking_queue: ALL+true 정책 제거 → 본인 팀 기준으로 재정의
DROP POLICY IF EXISTS "mq_all" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "mq_select_own_team" ON public.matchmaking_queue;
DROP POLICY IF EXISTS "mq_delete_own_team" ON public.matchmaking_queue;

CREATE POLICY "mq_select_own_team" ON public.matchmaking_queue FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = matchmaking_queue.team_id AND tm.user_id = auth.uid()
  ));

CREATE POLICY "mq_delete_own_team" ON public.matchmaking_queue FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = matchmaking_queue.team_id AND tm.user_id = auth.uid()
  ));
