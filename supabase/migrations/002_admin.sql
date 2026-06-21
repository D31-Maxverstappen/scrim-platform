-- 유저 테이블 관리자/정지 컬럼 추가
alter table users
  add column if not exists is_admin boolean not null default false,
  add column if not exists suspended boolean not null default false,
  add column if not exists suspended_at timestamptz;

-- 신고 테이블
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id) on delete cascade,
  target_type text not null check (target_type in ('user', 'team')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  action text,
  created_at timestamptz not null default now()
);

alter table reports enable row level security;

-- 신고는 본인이 넣은 것만 조회 가능, 어드민은 service role로 접근
create policy "reports_insert_auth" on reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "reports_select_own" on reports for select to authenticated using (reporter_id = auth.uid());
