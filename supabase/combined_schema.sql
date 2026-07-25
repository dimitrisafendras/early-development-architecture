-- ============================================================================
-- Combined schema for the Early Development app (migrations 0001–0006).
-- Paste this whole file into the Supabase SQL Editor and Run.
-- Idempotent: safe to run more than once (create if not exists / or replace /
-- drop policy if exists).
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────
-- supabase/migrations/0001_base_schema.sql
-- ────────────────────────────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────────────────────────────
-- supabase/migrations/0002_tracker_and_checklist.sql
-- ────────────────────────────────────────────────────────────────────────
-- P1 — feature tables: tummy_sessions (1.1) + checklist_entries (1.3)
-- Same owner-scoped RLS shape as the base schema. baby_id is nullable for now
-- (baby profiles land in P2); a single implicit baby per user is assumed.

-- 1.1 Tummy-time sessions. An open session has ended_at is null.
create table if not exists public.tummy_sessions (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  baby_id uuid references public.babies on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists tummy_sessions_owner_idx on public.tummy_sessions (owner);
create index if not exists tummy_sessions_started_idx on public.tummy_sessions (owner, started_at);

alter table public.tummy_sessions enable row level security;
drop policy if exists "own tummy_sessions" on public.tummy_sessions;
create policy "own tummy_sessions" on public.tummy_sessions for all
  using (owner = auth.uid()) with check (owner = auth.uid());

-- 1.3 Per-day caregiver checklist. One row per (user, day, item).
create table if not exists public.checklist_entries (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  baby_id uuid references public.babies on delete cascade,
  day date not null,
  item_id text not null,
  checked boolean not null default true,
  updated_at timestamptz default now(),
  unique (owner, day, item_id)
);
create index if not exists checklist_entries_owner_day_idx on public.checklist_entries (owner, day);

alter table public.checklist_entries enable row level security;
drop policy if exists "own checklist_entries" on public.checklist_entries;
create policy "own checklist_entries" on public.checklist_entries for all
  using (owner = auth.uid()) with check (owner = auth.uid());

-- ────────────────────────────────────────────────────────────────────────
-- supabase/migrations/0003_baby_measurements.sql
-- ────────────────────────────────────────────────────────────────────────
-- P2.1 — baby growth monitoring: weight / height / head circumference over time.
-- Owner-scoped like every other table; also carries baby_id (required here).

create table if not exists public.baby_measurements (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  baby_id uuid not null references public.babies on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,2),
  height_cm numeric(5,1),
  head_cm numeric(5,1),
  note text,
  created_at timestamptz default now()
);
create index if not exists baby_measurements_idx on public.baby_measurements (owner, baby_id, measured_on);

alter table public.baby_measurements enable row level security;
drop policy if exists "own baby_measurements" on public.baby_measurements;
create policy "own baby_measurements" on public.baby_measurements for all
  using (owner = auth.uid()) with check (owner = auth.uid());

-- ────────────────────────────────────────────────────────────────────────
-- supabase/migrations/0004_households.sql
-- ────────────────────────────────────────────────────────────────────────
-- P3.1 — Household sharing. A family = a household with multiple member
-- parents; babies (and their measurements + tummy sessions) can be shared
-- across the household. RLS switches from owner-only to owner-OR-member.
-- Membership is checked through SECURITY DEFINER helpers so member-list
-- policies don't recurse.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  email text,
  role text not null default 'parent',
  created_at timestamptz default now(),
  unique (household_id, user_id)
);
create index if not exists household_members_user_idx on public.household_members (user_id);

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users on delete cascade,
  created_at timestamptz default now(),
  accepted_at timestamptz,
  unique (household_id, email)
);
create index if not exists household_invites_email_idx on public.household_invites (lower(email));

-- Is the current user a member of household hid? SECURITY DEFINER so the
-- internal read bypasses RLS and cannot recurse into member-select policies.
create or replace function public.is_member(hid uuid)
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hid and m.user_id = auth.uid()
  );
$$;

-- Auto-add the creator as the owning member.
create or replace function public.handle_new_household()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.household_members (household_id, user_id, email, role)
  values (new.id, new.created_by, lower(auth.jwt() ->> 'email'), 'owner')
  on conflict (household_id, user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_household_created on public.households;
create trigger on_household_created after insert on public.households
  for each row execute function public.handle_new_household();

-- Accept an invite addressed to the signed-in user's email.
create or replace function public.accept_invite(p_invite uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare inv public.household_invites;
declare uemail text := lower(auth.jwt() ->> 'email');
begin
  select * into inv from public.household_invites where id = p_invite;
  if inv.id is null then raise exception 'invite not found'; end if;
  if lower(inv.email) <> uemail then raise exception 'invite email mismatch'; end if;
  insert into public.household_members (household_id, user_id, email, role)
  values (inv.household_id, auth.uid(), uemail, 'parent')
  on conflict (household_id, user_id) do nothing;
  update public.household_invites set accepted_at = now() where id = p_invite;
  return inv.household_id;
end;
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;

drop policy if exists "member households" on public.households;
-- `created_by` is included so the INSERT ... RETURNING select succeeds before the
-- membership row (added by the AFTER trigger) becomes visible to is_member().
create policy "member households" on public.households for select using (created_by = auth.uid() or public.is_member(id));
drop policy if exists "create households" on public.households;
create policy "create households" on public.households for insert with check (created_by = auth.uid());
drop policy if exists "update households" on public.households;
create policy "update households" on public.households for update using (public.is_member(id)) with check (public.is_member(id));
drop policy if exists "delete households" on public.households;
create policy "delete households" on public.households for delete using (created_by = auth.uid());

-- Members can see their own memberships and everyone in their households.
-- Inserts go only through the trigger / accept_invite (both SECURITY DEFINER).
drop policy if exists "view members" on public.household_members;
create policy "view members" on public.household_members for select
  using (user_id = auth.uid() or public.is_member(household_id));
drop policy if exists "leave household" on public.household_members;
create policy "leave household" on public.household_members for delete
  using (user_id = auth.uid());

drop policy if exists "view invites" on public.household_invites;
create policy "view invites" on public.household_invites for select
  using (public.is_member(household_id) or lower(email) = lower(auth.jwt() ->> 'email'));
drop policy if exists "create invites" on public.household_invites;
create policy "create invites" on public.household_invites for insert
  with check (public.is_member(household_id) and invited_by = auth.uid());
drop policy if exists "delete invites" on public.household_invites;
create policy "delete invites" on public.household_invites for delete
  using (public.is_member(household_id));

-- Share the data tables across a household when household_id is set.
alter table public.babies add column if not exists household_id uuid references public.households on delete set null;
alter table public.baby_measurements add column if not exists household_id uuid references public.households on delete set null;
alter table public.tummy_sessions add column if not exists household_id uuid references public.households on delete set null;

drop policy if exists "own babies" on public.babies;
drop policy if exists "own or shared babies" on public.babies;
create policy "own or shared babies" on public.babies for all
  using (owner = auth.uid() or (household_id is not null and public.is_member(household_id)))
  with check (owner = auth.uid() or (household_id is not null and public.is_member(household_id)));

drop policy if exists "own baby_measurements" on public.baby_measurements;
drop policy if exists "own or shared baby_measurements" on public.baby_measurements;
create policy "own or shared baby_measurements" on public.baby_measurements for all
  using (owner = auth.uid() or (household_id is not null and public.is_member(household_id)))
  with check (owner = auth.uid() or (household_id is not null and public.is_member(household_id)));

drop policy if exists "own tummy_sessions" on public.tummy_sessions;
drop policy if exists "own or shared tummy_sessions" on public.tummy_sessions;
create policy "own or shared tummy_sessions" on public.tummy_sessions for all
  using (owner = auth.uid() or (household_id is not null and public.is_member(household_id)))
  with check (owner = auth.uid() or (household_id is not null and public.is_member(household_id)));

-- ────────────────────────────────────────────────────────────────────────
-- supabase/migrations/0005_household_edit.sql
-- ────────────────────────────────────────────────────────────────────────
-- P3.1 (edit) — let a household owner remove other members, not just self.
-- Rename uses the existing member UPDATE policy; delete uses the existing
-- created_by DELETE policy on households.

create or replace function public.is_household_owner(hid uuid)
returns boolean language sql security definer set search_path = '' stable as $fn$
  select exists (
    select 1 from public.households h where h.id = hid and h.created_by = auth.uid()
  );
$fn$;

drop policy if exists "leave household" on public.household_members;
drop policy if exists "leave or remove members" on public.household_members;
create policy "leave or remove members" on public.household_members for delete
  using (user_id = auth.uid() or public.is_household_owner(household_id));

-- ────────────────────────────────────────────────────────────────────────
-- supabase/migrations/0006_feed_logs.sql
-- ────────────────────────────────────────────────────────────────────────
-- Food monitor: log each feed (when, how much, method). Owner-or-member RLS
-- like the other shared tables so a family sees the same log.

create table if not exists public.feed_logs (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  household_id uuid references public.households on delete set null,
  baby_id uuid references public.babies on delete cascade,
  fed_at timestamptz not null default now(),
  method text not null default 'bottle', -- 'bottle' | 'breast' | 'solid'
  amount_ml numeric(6,1),                 -- bottle / expressed volume
  minutes integer,                        -- breastfeed duration (optional)
  note text,
  created_at timestamptz default now()
);
create index if not exists feed_logs_idx on public.feed_logs (owner, fed_at);

alter table public.feed_logs enable row level security;
drop policy if exists "own or shared feed_logs" on public.feed_logs;
create policy "own or shared feed_logs" on public.feed_logs for all
  using (owner = auth.uid() or (household_id is not null and public.is_member(household_id)))
  with check (owner = auth.uid() or (household_id is not null and public.is_member(household_id)));

