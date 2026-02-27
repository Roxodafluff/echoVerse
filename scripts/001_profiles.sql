-- 001_profiles.sql
-- Profiles table: public user data linked to auth.users

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text default '',
  status text not null default 'offline' check (status in ('online', 'away', 'dnd', 'offline')),
  global_role text not null default 'user' check (global_role in ('owner', 'admin', 'moderator', 'support', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone authenticated can read profiles
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Users can only insert their own profile (trigger handles this, but just in case)
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', 'User'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
