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
