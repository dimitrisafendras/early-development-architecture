-- P0.3 — Base schema + RLS
-- Tables: profiles, babies. Every table is RLS-guarded to the owning user.
-- The anon/publishable key is public by design; RLS is the security boundary.

-- profiles: one row per auth user (auto-created on signup by trigger below).
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  locale text default 'en',
  created_at timestamptz default now()
);

-- babies: a user's tracked children. All feature tables hang off baby_id + owner.
create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  name text not null,
  birth_date date not null,
  palette text default 'red',
  created_at timestamptz default now()
);

create index if not exists babies_owner_idx on public.babies (owner);

alter table public.profiles enable row level security;
alter table public.babies enable row level security;

-- Owner-only access. `with check` blocks inserting/updating rows for another user.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own babies" on public.babies;
create policy "own babies" on public.babies for all
  using (owner = auth.uid()) with check (owner = auth.uid());

-- Auto-create a profile row when a new auth user is confirmed.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
