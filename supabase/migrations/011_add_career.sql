-- 2026-06-29 선수/코치 경력(career) 필드 추가
--
-- 공개 프로필(/users/[id])과 본인 프로필(/profile)에 자유 텍스트 경력/이력을 표시한다.
-- 005_secure_users_columns 에서 users SELECT를 컬럼 화이트리스트로 제한했으므로,
-- 신규 career 컬럼도 공개 허용 목록에 추가해야 앱(authenticated/anon)이 읽을 수 있다.
-- (이게 빠지면 service_role(서버)만 보이고 클라이언트 조회에서 누락됨.)

alter table public.users add column if not exists career text;

grant select (career) on public.users to anon, authenticated;
