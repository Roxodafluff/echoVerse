-- 006_messages.sql
-- Channel messages and reactions

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique(message_id, user_id, emoji)
);

create index if not exists idx_messages_channel_created
  on public.messages (channel_id, created_at desc);

alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;

-- Server members can read messages in their server's channels
create policy "messages_select"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.channels c
      join public.server_members sm on sm.server_id = c.server_id
      where c.id = messages.channel_id
        and sm.user_id = auth.uid()
    )
  );

-- Server members can send messages
create policy "messages_insert"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.channels c
      join public.server_members sm on sm.server_id = c.server_id
      where c.id = messages.channel_id
        and sm.user_id = auth.uid()
    )
  );

-- Authors can edit their own messages
create policy "messages_update_own"
  on public.messages for update
  to authenticated
  using (auth.uid() = author_id);

-- Authors can delete their own messages
create policy "messages_delete_own"
  on public.messages for delete
  to authenticated
  using (auth.uid() = author_id);

-- Reactions: server members can read
create policy "message_reactions_select"
  on public.message_reactions for select
  to authenticated
  using (
    exists (
      select 1 from public.messages m
      join public.channels c on c.id = m.channel_id
      join public.server_members sm on sm.server_id = c.server_id
      where m.id = message_reactions.message_id
        and sm.user_id = auth.uid()
    )
  );

-- Server members can add reactions
create policy "message_reactions_insert"
  on public.message_reactions for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.messages m
      join public.channels c on c.id = m.channel_id
      join public.server_members sm on sm.server_id = c.server_id
      where m.id = message_reactions.message_id
        and sm.user_id = auth.uid()
    )
  );

-- Users can remove their own reactions
create policy "message_reactions_delete_own"
  on public.message_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.message_reactions;
