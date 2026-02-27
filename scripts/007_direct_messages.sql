-- 007_direct_messages.sql
-- DM conversations, participants, and messages

create table if not exists public.dm_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.dm_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  unique(conversation_id, user_id)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_direct_messages_conv_created
  on public.direct_messages (conversation_id, created_at desc);

alter table public.dm_conversations enable row level security;
alter table public.dm_participants enable row level security;
alter table public.direct_messages enable row level security;

-- Only participants can see their conversations
create policy "dm_conversations_select"
  on public.dm_conversations for select
  to authenticated
  using (
    exists (
      select 1 from public.dm_participants dp
      where dp.conversation_id = dm_conversations.id
        and dp.user_id = auth.uid()
    )
  );

-- Authenticated users can create conversations
create policy "dm_conversations_insert"
  on public.dm_conversations for insert
  to authenticated
  with check (true);

-- Participants can see other participants
create policy "dm_participants_select"
  on public.dm_participants for select
  to authenticated
  using (
    exists (
      select 1 from public.dm_participants dp
      where dp.conversation_id = dm_participants.conversation_id
        and dp.user_id = auth.uid()
    )
  );

-- Authenticated users can add participants
create policy "dm_participants_insert"
  on public.dm_participants for insert
  to authenticated
  with check (true);

-- Only participants can read DMs
create policy "direct_messages_select"
  on public.direct_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.dm_participants dp
      where dp.conversation_id = direct_messages.conversation_id
        and dp.user_id = auth.uid()
    )
  );

-- Only participants can send DMs
create policy "direct_messages_insert"
  on public.direct_messages for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.dm_participants dp
      where dp.conversation_id = direct_messages.conversation_id
        and dp.user_id = auth.uid()
    )
  );

-- Enable realtime for DMs
alter publication supabase_realtime add table public.direct_messages;
