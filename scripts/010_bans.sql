-- 010_bans.sql
-- Global and server bans

create table if not exists public.global_bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  banned_by uuid not null references public.profiles(id) on delete cascade,
  reason text default '',
  created_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.server_bans (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  banned_by uuid not null references public.profiles(id) on delete cascade,
  reason text default '',
  created_at timestamptz not null default now(),
  unique(server_id, user_id)
);

alter table public.global_bans enable row level security;
alter table public.server_bans enable row level security;

-- Staff can read global bans
create policy "global_bans_select"
  on public.global_bans for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.global_role in ('owner', 'admin', 'moderator')
    )
  );

-- Staff can create global bans
create policy "global_bans_insert"
  on public.global_bans for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.global_role in ('owner', 'admin')
    )
  );

-- Staff can remove global bans
create policy "global_bans_delete"
  on public.global_bans for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.global_role in ('owner', 'admin')
    )
  );

-- Server members can see server bans
create policy "server_bans_select"
  on public.server_bans for select
  to authenticated
  using (
    exists (
      select 1 from public.server_members sm
      where sm.server_id = server_bans.server_id
        and sm.user_id = auth.uid()
    )
  );

-- Server owner can create server bans
create policy "server_bans_insert"
  on public.server_bans for insert
  to authenticated
  with check (
    exists (
      select 1 from public.servers s
      where s.id = server_bans.server_id
        and s.owner_id = auth.uid()
    )
  );

-- Server owner can remove server bans
create policy "server_bans_delete"
  on public.server_bans for delete
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = server_bans.server_id
        and s.owner_id = auth.uid()
    )
  );
