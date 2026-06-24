-- ============================================================
-- 004_bookmarks
-- 즐겨찾기(북마크) 기능: 스크림 글 / 팀을 하나의 범용 테이블로 관리.
-- 본인 것만 보고·추가·삭제할 수 있도록 RLS 적용.
-- 재실행해도 안전(idempotent).
-- ============================================================

create table if not exists public.bookmarks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  target_type  text not null check (target_type in ('scrim_post', 'team')),
  target_id    uuid not null,
  created_at   timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

-- RLS: 본인 북마크만 접근
alter table public.bookmarks enable row level security;

drop policy if exists bookmarks_select_own on public.bookmarks;
create policy bookmarks_select_own on public.bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists bookmarks_insert_own on public.bookmarks;
create policy bookmarks_insert_own on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists bookmarks_delete_own on public.bookmarks;
create policy bookmarks_delete_own on public.bookmarks
  for delete using (auth.uid() = user_id);
