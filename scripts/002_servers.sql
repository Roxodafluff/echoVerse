-- 002_servers.sql
-- Servers table

create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_url text,
  description text default '',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.servers enable row level security;

-- Authenticated users can read all servers
create policy "servers_select_all"
  on public.servers for select
  to authenticated
  using (true);

-- Authenticated users can create servers
create policy "servers_insert_auth"
  on public.servers for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- Only owner can update their server
create policy "servers_update_owner"
  on public.servers for update
  to authenticated
  using (auth.uid() = owner_id);

-- Only owner can delete their server
create policy "servers_delete_owner"
  on public.servers for delete
  to authenticated
  using (auth.uid() = owner_id);
