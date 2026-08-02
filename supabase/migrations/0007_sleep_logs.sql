-- Sleep log: one row per sleep, with a start and an end. Owner-or-member RLS
-- like the other shared tables, so both parents see the same nights.
--
-- `ended_at` is nullable on purpose and means exactly one thing: the child is
-- asleep right now. That is the same shape `tummy_sessions` uses for a running
-- timer, and it is what lets the page be started at bedtime and stopped in the
-- morning rather than reconstructed afterwards.

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  household_id uuid references public.households on delete set null,
  baby_id uuid references public.babies on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,                   -- null = still asleep
  note text,
  created_at timestamptz default now()
);
-- The two questions asked of this table are "what has this child slept since X"
-- and "is anything still running", both scoped to one owner.
create index if not exists sleep_logs_idx on public.sleep_logs (owner, started_at);

alter table public.sleep_logs enable row level security;
drop policy if exists "own or shared sleep_logs" on public.sleep_logs;
create policy "own or shared sleep_logs" on public.sleep_logs for all
  using (owner = auth.uid() or (household_id is not null and public.is_member(household_id)))
  with check (owner = auth.uid() or (household_id is not null and public.is_member(household_id)));
