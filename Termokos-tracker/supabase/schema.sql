create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  lead_name text,
  lead_id uuid unique references auth.users(id) on delete set null
);
create table workers (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create table reports (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  status text not null default 'draft' check (status in ('draft','closed')),
  prepared_by text, checked_by text, approved_by text,
  share_token uuid not null unique default gen_random_uuid(),
  closed_at timestamptz,
  snapshot jsonb,
  unique (team_id, year, month)
);
create table entries (
  report_id uuid not null references reports(id) on delete cascade,
  worker_id uuid not null references workers(id) on delete cascade,
  day int not null check (day between 1 and 31),
  hours numeric not null check (hours >= 0 and hours <= 24),
  primary key (report_id, worker_id, day)
);

-- Is the logged-in user the lead of this team?
create function is_my_team(tid uuid) returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from teams where id = tid and lead_id = auth.uid()) $$;

alter table teams enable row level security;
alter table workers enable row level security;
alter table reports enable row level security;
alter table entries enable row level security;

create policy teams_read on teams for select using (lead_id = auth.uid());
create policy workers_all on workers for all using (is_my_team(team_id)) with check (is_my_team(team_id));
create policy reports_all on reports for all using (is_my_team(team_id)) with check (is_my_team(team_id));
create policy entries_read on entries for select
  using (exists (select 1 from reports r where r.id = report_id and is_my_team(r.team_id)));
-- Closed months are locked: writes only while the report is a draft.
create policy entries_write on entries for all
  using (exists (select 1 from reports r where r.id = report_id and is_my_team(r.team_id) and r.status = 'draft'))
  with check (exists (select 1 from reports r where r.id = report_id and is_my_team(r.team_id) and r.status = 'draft'));

-- Public read-only access: only through this function, by secret token.
create function get_shared_report(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r reports; t teams;
begin
  select * into r from reports where share_token = p_token;
  if not found then return null; end if;
  select * into t from teams where id = r.team_id;
  return jsonb_build_object(
    'team', t.name, 'department', t.department, 'year', r.year, 'month', r.month,
    'status', r.status, 'prepared_by', r.prepared_by, 'checked_by', r.checked_by, 'approved_by', r.approved_by,
    'workers', coalesce(r.snapshot->'workers',
      (select coalesce(jsonb_agg(jsonb_build_object('id', w.id, 'name', w.name) order by w.sort, w.created_at), '[]'::jsonb)
       from workers w where w.team_id = r.team_id and w.active)),
    'entries', (select coalesce(jsonb_agg(jsonb_build_object('worker_id', e.worker_id, 'day', e.day, 'hours', e.hours)), '[]'::jsonb)
       from entries e where e.report_id = r.id));
end $$;
grant execute on function get_shared_report(uuid) to anon, authenticated;

