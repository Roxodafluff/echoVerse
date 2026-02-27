-- 011_profile_banner_badge.sql
-- Add banner_color and show_staff_badge columns to profiles table

alter table public.profiles
  add column if not exists banner_color text default '#5865F2',
  add column if not exists show_staff_badge boolean default true;

-- Update the handle_new_user function to include defaults for new columns
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, banner_color, show_staff_badge)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', 'User'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null),
    '#5865F2',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
