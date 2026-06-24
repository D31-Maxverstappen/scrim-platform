-- ============================================================
-- 003_manner_rating
-- 매너 평가를 실제 사용 중인 matches 테이블에 연결하고,
-- 점수 자동 동기화 트리거를 (재)생성한다.
--
-- 배경: manner_logs / users.manner_score 는 존재하나,
--   manner_logs.match_id 가 레거시(미사용) scrim_matches 를 가리켜
--   실제 매치(matches)에는 평가를 남길 수 없는 상태였다.
--   manner_logs 는 현재 0행이므로 FK 재연결은 안전하다.
-- 모든 구문은 재실행해도 안전(idempotent)하도록 작성했다.
-- ============================================================

-- 1) manner_logs.match_id FK 를 matches 로 재연결
alter table public.manner_logs
  drop constraint if exists manner_logs_match_id_fkey;
alter table public.manner_logs
  add constraint manner_logs_match_id_fkey
  foreign key (match_id) references public.matches(id) on delete cascade;

-- 2) 매너 점수 자동 동기화: manner_logs 변경 시 users.manner_score 재계산
--    점수 = clamp(0, 200, 100 + sum(delta))
create or replace function public.sync_manner_score()
returns trigger language plpgsql security definer as $$
declare
  target_id uuid;
  new_score int;
begin
  target_id := coalesce(new.to_user_id, old.to_user_id);

  select greatest(0, least(200, 100 + coalesce(sum(delta), 0)))
    into new_score
  from public.manner_logs
  where to_user_id = target_id;

  update public.users set manner_score = new_score where id = target_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_manner_score on public.manner_logs;
create trigger trg_sync_manner_score
  after insert or update or delete on public.manner_logs
  for each row execute function public.sync_manner_score();

-- 3) RLS: 본인이 남기거나 받은 평가는 조회 가능(중복 평가 판별용).
--    실제 평가 삽입은 서버(서비스 롤)에서만 수행한다.
alter table public.manner_logs enable row level security;
drop policy if exists manner_logs_select_own on public.manner_logs;
create policy manner_logs_select_own on public.manner_logs
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);
