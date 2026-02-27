-- 004_roles.sql
-- Server roles and member-role assignments

create table if not exists public.server_roles (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  name text not null,
  color text not null default '#99aab5',
  position integer not null default 0,
  permissions jsonb not null default '{
    "manage_channels": false,
    "manage_roles": false,
    "kick_members": false,
    "ban_members": false,
    "manage_messages": false,
    "view_logs": false,
    "administrator": false
  }'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.member_roles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.server_members(id) on delete cascade,
  role_id uuid not null references public.server_roles(id) on delete cascade,
  unique(member_id, role_id)
);

alter table public.server_roles enable row level security;
alter table public.member_roles enable row level security;

-- Server members can read roles
create policy "server_roles_select"
  on public.server_roles for select
  to authenticated
  using (
    exists (
      select 1 from public.server_members sm
      where sm.server_id = server_roles.server_id
        and sm.user_id = auth.uid()
    )
  );

-- Server owner or admin can manage roles
create policy "server_roles_insert"
  on public.server_roles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.servers s
      where s.id = server_roles.server_id
        and s.owner_id = auth.uid()
    )
  );

create policy "server_roles_update"
  on public.server_roles for update
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = server_roles.server_id
        and s.owner_id = auth.uid()
    )
  );

create policy "server_roles_delete"
  on public.server_roles for delete
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = server_roles.server_id
        and s.owner_id = auth.uid()
    )
  );

-- Member roles: members of the server can read
create policy "member_roles_select"
  on public.member_roles for select
  to authenticated
  using (
    exists (
      select 1 from public.server_members sm
      join public.server_roles sr on sr.server_id = sm.server_id
      where sm.user_id = auth.uid()
        and sr.id = member_roles.role_id
    )
  );

-- Server owner can assign/remove roles
create policy "member_roles_insert"
  on public.member_roles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.server_roles sr
      join public.servers s on s.id = sr.server_id
      where sr.id = member_roles.role_id
        and s.owner_id = auth.uid()
    )
  );

create policy "member_roles_delete"
  on public.member_roles for delete
  to authenticated
  using (
    exists (
      select 1 from public.server_roles sr
      join public.servers s on s.id = sr.server_id
      where sr.id = member_roles.role_id
        and s.owner_id = auth.uid()
    )
  );

-- Auto-create default roles when server is created
create or replace function public.handle_new_server_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role_id uuid;
  owner_member_id uuid;
begin
  -- Create default roles
  insert into public.server_roles (id, server_id, name, color, position, permissions)
  values
    (gen_random_uuid(), new.id, 'Owner', '#e74c3c', 4, '{"manage_channels":true,"manage_roles":true,"kick_members":true,"ban_members":true,"manage_messages":true,"view_logs":true,"administrator":true}'::jsonb),
    (gen_random_uuid(), new.id, 'Admin', '#e67e22', 3, '{"manage_channels":true,"manage_roles":true,"kick_members":true,"ban_members":true,"manage_messages":true,"view_logs":true,"administrator":false}'::jsonb),
    (gen_random_uuid(), new.id, 'Moderator', '#2ecc71', 2, '{"manage_channels":false,"manage_roles":false,"kick_members":true,"ban_members":false,"manage_messages":true,"view_logs":true,"administrator":false}'::jsonb),
    (gen_random_uuid(), new.id, 'Member', '#99aab5', 1, '{"manage_channels":false,"manage_roles":false,"kick_members":false,"ban_members":false,"manage_messages":false,"view_logs":false,"administrator":false}'::jsonb);

  -- Get the owner role id
  select id into owner_role_id from public.server_roles
    where server_id = new.id and name = 'Owner' limit 1;

  -- Get the owner's member id
  select id into owner_member_id from public.server_members
    where server_id = new.id and user_id = new.owner_id limit 1;

  -- Assign owner role to the server owner
  if owner_member_id is not null and owner_role_id is not null then
    insert into public.member_roles (member_id, role_id)
    values (owner_member_id, owner_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_server_created_add_roles on public.servers;

create trigger on_server_created_add_roles
  after insert on public.servers
  for each row
  execute function public.handle_new_server_roles();
