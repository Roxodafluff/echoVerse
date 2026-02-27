-- 008_friends.sql
-- Friend request system

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique(from_user_id, to_user_id)
);

alter table public.friend_requests enable row level security;

-- Users can see their own requests (sent or received)
create policy "friend_requests_select"
  on public.friend_requests for select
  to authenticated
  using (
    auth.uid() = from_user_id or auth.uid() = to_user_id
  );

-- Users can send friend requests
create policy "friend_requests_insert"
  on public.friend_requests for insert
  to authenticated
  with check (auth.uid() = from_user_id);

-- Recipient can update (accept/reject) requests
create policy "friend_requests_update"
  on public.friend_requests for update
  to authenticated
  using (auth.uid() = to_user_id);

-- Either party can delete (unfriend)
create policy "friend_requests_delete"
  on public.friend_requests for delete
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);
