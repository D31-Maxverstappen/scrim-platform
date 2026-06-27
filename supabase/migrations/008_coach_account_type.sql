-- 2026-06-28: 코치/선수 계정 유형 도입
--
-- [목적] 회원가입(온보딩) 시 '선수' 또는 '코치'를 선택하게 한다.
--        - 선수(player): 기존과 동일. 라이엇 ID + 티어 입력, 1인 1팀.
--        - 코치(coach): 라이엇 ID(신원확인)만, 티어 없음. 여러 팀에 코치로 가입 가능.
--        계정 유형은 가입 시 고정(이후 변경 불가) — 전환 로직 없음.
--
-- [조치] users.account_type 컬럼 추가(기본 'player' → 기존 유저 전원 자동 백필).
--        005 보안 패치로 users는 컬럼 화이트리스트 SELECT라, account_type을 공개 컬럼에 합류시킨다.
--        (코치/선수 구분은 민감정보 아님 + 팀 페이지 표시에 필요)
--
-- 적용: 서울 프로젝트(ap-northeast-2) SQL Editor에서 실행.

-- 1) 컬럼 추가 (NOT NULL DEFAULT 'player' → 기존 행 자동 백필)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'player';

-- 2) 허용값 제약 (멱등: 이미 있으면 건너뜀)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_account_type_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_account_type_check
      CHECK (account_type IN ('player', 'coach'));
  END IF;
END $$;

-- 3) 공개 컬럼 화이트리스트에 account_type 합류 (005 GRANT 보강)
GRANT SELECT (account_type) ON public.users TO anon, authenticated;
