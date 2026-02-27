-- 009_reports.sql
-- Report system for moderation

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  server_id uuid references public.servers(id) on delete set null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Global staff can read all reports
create policy "reports_select_staff"
  on public.reports for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.global_role in ('owner', 'admin', 'moderator')
    )
  );

-- Any user can insert a report
create policy "reports_insert"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Staff can update reports (resolve/dismiss)
create policy "reports_update_staff"
  on public.reports for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.global_role in ('owner', 'admin', 'moderator')
    )
  );
