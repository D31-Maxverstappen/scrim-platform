-- ============================================================
-- 스크림 플랫폼 초기 스키마
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM 타입
-- ============================================================
create type game_type as enum ('valorant', 'lol');
create type match_status as enum ('scheduled', 'played', 'no_show', 'cancelled');
create type scrim_post_status as enum ('open', 'matched', 'done', 'cancelled');
create type member_role as enum ('captain', 'member');
create type manner_reason as enum ('no_show', 'toxic', 'gg', 'positive');
create type report_status as enum ('pending', 'confirmed', 'rejected');

-- ============================================================
-- TABLES
-- ============================================================

create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  summoner_name   text not null,
  riot_puuid      text unique,
  game_type       game_type not null default 'valorant',
  tier            text,
  rank            text,
  manner_score    int not null default 100,
  is_banned       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table teams (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null unique,
  game_type     game_type not null,
  captain_id    uuid not null references users(id) on delete restrict,
  logo_url      text,
  tier_avg      text,
  win_count     int not null default 0,
  loss_count    int not null default 0,
  created_at    timestamptz not null default now()
);

create table team_members (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid not null references teams(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  role        member_role not null default 'member',
  joined_at   timestamptz not null default now(),
  unique (team_id, user_id)
);

create table scrim_posts (
  id               uuid primary key default uuid_generate_v4(),
  team_id          uuid not null references teams(id) on delete cascade,
  game_type        game_type not null,
  preferred_date   timestamptz not null,
  tier_range_min   text,
  tier_range_max   text,
  note             text,
  status           scrim_post_status not null default 'open',
  created_at       timestamptz not null default now()
);

create table scrim_matches (
  id               uuid primary key default uuid_generate_v4(),
  post_id          uuid references scrim_posts(id) on delete set null,
  home_team_id     uuid not null references teams(id) on delete restrict,
  away_team_id     uuid not null references teams(id) on delete restrict,
  game_type        game_type not null,
  scheduled_at     timestamptz not null,
  status           match_status not null default 'scheduled',
  home_confirmed   boolean not null default false,
  away_confirmed   boolean not null default false,
  created_at       timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);

create table match_results (
  id               uuid primary key default uuid_generate_v4(),
  match_id         uuid not null unique references scrim_matches(id) on delete cascade,
  winner_team_id   uuid not null references teams(id) on delete restrict,
  score_home       int not null default 0,
  score_away       int not null default 0,
  submitted_by     uuid not null references users(id),
  confirmed_by     uuid references users(id),
  confirmed_at     timestamptz,
  created_at       timestamptz not null default now()
);

create table manner_logs (
  id            uuid primary key default uuid_generate_v4(),
  match_id      uuid not null references scrim_matches(id) on delete cascade,
  from_user_id  uuid not null references users(id) on delete cascade,
  to_user_id    uuid not null references users(id) on delete cascade,
  delta         int not null,
  reason        manner_reason not null,
  created_at    timestamptz not null default now(),
  unique (match_id, from_user_id, to_user_id)
);

create table no_show_reports (
  id                  uuid primary key default uuid_generate_v4(),
  match_id            uuid not null references scrim_matches(id) on delete cascade,
  reporter_team_id    uuid not null references teams(id),
  reported_team_id    uuid not null references teams(id),
  status              report_status not null default 'pending',
  admin_note          text,
  created_at          timestamptz not null default now(),
  unique (match_id, reporter_team_id)
);

-- ============================================================
-- 인덱스
-- ============================================================
create index idx_scrim_posts_status      on scrim_posts(status, game_type);
create index idx_scrim_posts_date        on scrim_posts(preferred_date);
create index idx_scrim_matches_status    on scrim_matches(status);
create index idx_scrim_matches_scheduled on scrim_matches(scheduled_at);
create index idx_team_members_user       on team_members(user_id);
create index idx_manner_logs_to_user     on manner_logs(to_user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on users
  for each row execute function update_updated_at();

create or replace function sync_manner_score()
returns trigger language plpgsql security definer as $$
declare
  target_id uuid;
  new_score  int;
begin
  if tg_op = 'DELETE' then
    target_id := old.to_user_id;
  else
    target_id := new.to_user_id;
  end if;

  select greatest(0, least(200, 100 + coalesce(sum(delta), 0)))
  into new_score
  from manner_logs
  where to_user_id = target_id;

  update users set manner_score = new_score where id = target_id;
  return coalesce(new, old);
end;
$$;

create trigger trg_sync_manner_score
  after insert or update or delete on manner_logs
  for each row execute function sync_manner_score();

create or replace function finalize_match_on_confirm()
returns trigger language plpgsql security definer as $$
begin
  if new.home_confirmed = true and new.away_confirmed = true then
    update scrim_matches set status = 'played' where id = new.id;

    update teams set win_count = win_count + 1
    where id = (select winner_team_id from match_results where match_id = new.id);

    update teams set loss_count = loss_count + 1
    where id = (
      select case
        when home_team_id = (select winner_team_id from match_results where match_id = new.id)
          then away_team_id
        else home_team_id
      end
      from scrim_matches where id = new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_finalize_match
  after update of home_confirmed, away_confirmed on scrim_matches
  for each row execute function finalize_match_on_confirm();

create or replace function apply_no_show_penalty()
returns trigger language plpgsql security definer as $$
declare
  cap_id uuid;
begin
  if new.status = 'confirmed' and old.status = 'pending' then
    select captain_id into cap_id
    from teams where id = new.reported_team_id;

    insert into manner_logs (match_id, from_user_id, to_user_id, delta, reason)
    values (new.match_id, cap_id, cap_id, -30, 'no_show')
    on conflict do nothing;

    update scrim_matches set status = 'no_show' where id = new.match_id;
  end if;
  return new;
end;
$$;

create trigger trg_no_show_penalty
  after update of status on no_show_reports
  for each row execute function apply_no_show_penalty();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table users           enable row level security;
alter table teams           enable row level security;
alter table team_members    enable row level security;
alter table scrim_posts     enable row level security;
alter table scrim_matches   enable row level security;
alter table match_results   enable row level security;
alter table manner_logs     enable row level security;
alter table no_show_reports enable row level security;

create policy "users_read_all"   on users for select using (true);
create policy "users_update_own" on users for update using (auth.uid() = id);
create policy "users_insert_own" on users for insert with check (auth.uid() = id);

create policy "teams_read_all"       on teams for select using (true);
create policy "teams_insert_auth"    on teams for insert with check (auth.uid() = captain_id);
create policy "teams_update_captain" on teams for update using (auth.uid() = captain_id);

create policy "members_read_all" on team_members for select using (true);
create policy "members_insert_captain" on team_members for insert
  with check (exists (select 1 from teams where id = team_id and captain_id = auth.uid()));
create policy "members_delete_captain" on team_members for delete
  using (
    exists (select 1 from teams where id = team_id and captain_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "posts_read_all" on scrim_posts for select using (true);
create policy "posts_insert_captain" on scrim_posts for insert
  with check (exists (select 1 from teams where id = team_id and captain_id = auth.uid()));
create policy "posts_update_captain" on scrim_posts for update
  using (exists (select 1 from teams where id = team_id and captain_id = auth.uid()));

create policy "matches_read_all" on scrim_matches for select using (true);
create policy "matches_insert_captain" on scrim_matches for insert
  with check (
    exists (select 1 from teams where id = home_team_id and captain_id = auth.uid())
    or exists (select 1 from teams where id = away_team_id and captain_id = auth.uid())
  );
create policy "matches_update_captain" on scrim_matches for update
  using (
    exists (select 1 from teams where id = home_team_id and captain_id = auth.uid())
    or exists (select 1 from teams where id = away_team_id and captain_id = auth.uid())
  );

create policy "results_read_all" on match_results for select using (true);
create policy "results_insert_captain" on match_results for insert
  with check (
    exists (
      select 1 from scrim_matches m
      join teams t on t.id in (m.home_team_id, m.away_team_id)
      where m.id = match_id and t.captain_id = auth.uid()
    )
  );
create policy "results_confirm_captain" on match_results for update
  using (
    exists (
      select 1 from scrim_matches m
      join teams t on t.id in (m.home_team_id, m.away_team_id)
      where m.id = match_id and t.captain_id = auth.uid()
    )
  );

create policy "manner_read_all" on manner_logs for select using (true);
create policy "manner_insert_participant" on manner_logs for insert
  with check (auth.uid() = from_user_id);

create policy "nsr_read_involved" on no_show_reports for select
  using (exists (select 1 from teams where id in (reporter_team_id, reported_team_id) and captain_id = auth.uid()));
create policy "nsr_insert_captain" on no_show_reports for insert
  with check (exists (select 1 from teams where id = reporter_team_id and captain_id = auth.uid()));
