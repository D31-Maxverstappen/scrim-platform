-- ============================================================
-- 010_recruit_lfc
-- 모집 게시판에 '코치 구함'(lfc) 유형 추가.
--   - lft: 팀 구함(선수/코치가 팀 찾기)
--   - lfp: 선수 구함(팀이 선수 모집)
--   - lfc: 코치 구함(팀이 코치 모집) ← 신규
-- recruitment_posts.type CHECK 제약이 lft/lfp만 허용했어서 lfc를 추가한다.
-- 재실행해도 안전(idempotent).
-- ============================================================

alter table public.recruitment_posts
  drop constraint if exists recruitment_posts_type_check;

alter table public.recruitment_posts
  add constraint recruitment_posts_type_check
  check (type in ('lft', 'lfp', 'lfc'));
