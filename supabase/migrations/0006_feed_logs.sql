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
