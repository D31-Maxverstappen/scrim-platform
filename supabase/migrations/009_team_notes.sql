-- ============================================================
-- 009_team_notes
-- 팀 전략 노트 (Phase 2). 한 테이블로 두 가지를 커버:
--   - match_id 값 있음 → 해당 스크림 매치 전용 전략/피드백 노트
--   - match_id NULL    → 팀 상시 플레이북(맵별 전략 등)
--
-- 보안 핵심: 읽기는 본인이 소속된 팀원만(상대 팀엔 절대 안 보임).
--            작성은 팀 전원(코치+캡틴+선수), 수정/삭제는 본인 글만.
--            RLS로 DB 레벨 격리 → API 직접 호출로도 상대 팀 노트 못 읽음.
-- 재실행해도 안전(idempotent).
-- ============================================================

create table if not exists public.team_notes (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  match_id    uuid references public.matches(id) on delete cascade,
  author_id   uuid references public.users(id) on delete set null,
  content     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_team_notes_team_match
  on public.team_notes(team_id, match_id, created_at desc);

alter table public.team_notes enable row level security;

-- 읽기: 본인이 소속된 팀의 노트만 (상대 팀 격리)
drop policy if exists team_notes_select_member on public.team_notes;
create policy team_notes_select_member on public.team_notes
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_notes.team_id and tm.user_id = auth.uid()
    )
  );

-- 작성: 본인 명의로, 본인이 소속된 팀에만
drop policy if exists team_notes_insert_member on public.team_notes;
create policy team_notes_insert_member on public.team_notes
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.team_members tm
      where tm.team_id = team_notes.team_id and tm.user_id = auth.uid()
    )
  );

-- 수정: 본인 글만
drop policy if exists team_notes_update_own on public.team_notes;
create policy team_notes_update_own on public.team_notes
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

-- 삭제: 본인 글만
drop policy if exists team_notes_delete_own on public.team_notes;
create policy team_notes_delete_own on public.team_notes
  for delete using (author_id = auth.uid());
