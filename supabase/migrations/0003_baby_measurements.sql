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
