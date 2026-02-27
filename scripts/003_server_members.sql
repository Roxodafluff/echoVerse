-- 003_server_members.sql
-- Server membership

create table if not exists public.server_members (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(server_id, user_id)
);

alter table public.server_members enable row level security;

-- Members of a server can see other members
create policy "server_members_select"
  on public.server_members for select
  to authenticated
  using (
    exists (
      select 1 from public.server_members sm
      where sm.server_id = server_members.server_id
        and sm.user_id = auth.uid()
    )
  );

-- Users can join servers (insert themselves)
create policy "server_members_insert_self"
  on public.server_members for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can leave servers (delete themselves)
create policy "server_members_delete_self"
  on public.server_members for delete
  to authenticated
  using (auth.uid() = user_id);

-- Auto-add owner as first member when server is created
create or replace function public.handle_new_server()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.server_members (server_id, user_id)
  values (new.id, new.owner_id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_server_created_add_owner on public.servers;

create trigger on_server_created_add_owner
  after insert on public.servers
  for each row
  execute function public.handle_new_server();
