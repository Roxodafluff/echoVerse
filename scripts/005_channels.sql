-- 005_channels.sql
-- Channel categories and channels

create table if not exists public.channel_categories (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  category_id uuid references public.channel_categories(id) on delete set null,
  name text not null,
  type text not null default 'text' check (type in ('text', 'voice')),
  topic text default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.channel_categories enable row level security;
alter table public.channels enable row level security;

-- Server members can read categories
create policy "channel_categories_select"
  on public.channel_categories for select
  to authenticated
  using (
    exists (
      select 1 from public.server_members sm
      where sm.server_id = channel_categories.server_id
        and sm.user_id = auth.uid()
    )
  );

-- Server owner can manage categories
create policy "channel_categories_insert"
  on public.channel_categories for insert
  to authenticated
  with check (
    exists (
      select 1 from public.servers s
      where s.id = channel_categories.server_id
        and s.owner_id = auth.uid()
    )
  );

create policy "channel_categories_update"
  on public.channel_categories for update
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = channel_categories.server_id
        and s.owner_id = auth.uid()
    )
  );

create policy "channel_categories_delete"
  on public.channel_categories for delete
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = channel_categories.server_id
        and s.owner_id = auth.uid()
    )
  );

-- Server members can read channels
create policy "channels_select"
  on public.channels for select
  to authenticated
  using (
    exists (
      select 1 from public.server_members sm
      where sm.server_id = channels.server_id
        and sm.user_id = auth.uid()
    )
  );

-- Server owner can manage channels
create policy "channels_insert"
  on public.channels for insert
  to authenticated
  with check (
    exists (
      select 1 from public.servers s
      where s.id = channels.server_id
        and s.owner_id = auth.uid()
    )
  );

create policy "channels_update"
  on public.channels for update
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = channels.server_id
        and s.owner_id = auth.uid()
    )
  );

create policy "channels_delete"
  on public.channels for delete
  to authenticated
  using (
    exists (
      select 1 from public.servers s
      where s.id = channels.server_id
        and s.owner_id = auth.uid()
    )
  );

-- Auto-create default category and general channel
create or replace function public.handle_new_server_channels()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cat_id uuid;
begin
  insert into public.channel_categories (id, server_id, name, position)
  values (gen_random_uuid(), new.id, 'Text Channels', 0)
  returning id into cat_id;

  insert into public.channels (server_id, category_id, name, type, position)
  values (new.id, cat_id, 'general', 'text', 0);

  return new;
end;
$$;

drop trigger if exists on_server_created_add_channels on public.servers;

create trigger on_server_created_add_channels
  after insert on public.servers
  for each row
  execute function public.handle_new_server_channels();
