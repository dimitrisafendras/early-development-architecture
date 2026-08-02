-- Development seed — LOCAL SUPABASE ONLY.
--
-- Runs automatically on `supabase db reset` (see `[db.seed]` in config.toml).
-- It creates two signed-in-able accounts and a household with two children of
-- deliberately different ages, plus enough history that every screen has
-- something real to draw.
--
-- ## Why fixture accounts, and why it is safe to commit
--
-- The passwords below are dev-only literals for a stack that listens on
-- 127.0.0.1 and is thrown away by the next `db reset`. They are not credentials
-- for any hosted project — never point `.env.local` at production and run this.
-- The one rule: this file must never be applied to a remote database. It writes
-- directly into `auth.users`, which the hosted project owns.
--
-- ## Why two children, and these two ages
--
-- Almost every scoping bug this app has had was invisible with one child: reads
-- that ignored `baby_id` while writes carried it looked perfectly correct until
-- a second child's sessions started counting as the first's. So the seed always
-- has two — and it straddles the first birthday, because twelve months is where
-- the app changes what it is measuring: tummy time becomes active play, the
-- daily target switches from the AAP ramp to the WHO's 180 minutes, and the day
-- program moves to a different template. One child on each side of that line
-- means the switch is exercised by simply signing in.
--
-- ## Why the data is relative to `current_date`
--
-- Fixed birth dates rot: a seed written today describes a four-month-old and a
-- toddler, and six months later describes a ten-month-old and a two-year-old,
-- silently moving both children into different age bands and different day
-- programs. Everything here is offset from `current_date`, so the fixture keeps
-- describing the same two children for ever.

-- Deterministic ids, so tests can address rows without a lookup round-trip.
-- (These are ordinary v4-shaped uuids; the readable prefixes are for humans
-- reading a failing assertion, not a format the app relies on.)
--   parent   11111111-…  Maya Test    (owner of the household)
--   partner  22222222-…  Alex Test    (invited parent, sees the same children)
--   baby A   aaaaaaaa-…  Iris          4 months  — tummy time, AAP ramp
--   baby B   bbbbbbbb-…  Theo         16 months  — active play, WHO 180 min

begin;

-- Idempotent: `db reset` starts from an empty database, but running the seed by
-- hand against a live local stack has to be safe too.
delete from auth.users where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
);

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

-- `email_confirmed_at` is set so the accounts can sign in without walking the
-- confirmation mail in Mailpit; `aud`/`role` are what GoTrue expects on a
-- password user, and the empty-string token columns are what it writes itself
-- (nulls there make some GoTrue versions error on the first refresh).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated', 'authenticated',
    'parent@example.test',
    crypt('devpassword', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Maya Test"}',
    now() - interval '120 days', now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated', 'authenticated',
    'partner@example.test',
    crypt('devpassword', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Alex Test"}',
    now() - interval '90 days', now(),
    '', '', '', ''
  );

-- GoTrue looks the user up through `auth.identities`, not `auth.users`, on a
-- password sign-in. Without these rows the accounts exist and cannot log in.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at,
  created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
);

-- The signup trigger fills `public.profiles`; name them properly anyway, since
-- a seed applied to an already-migrated database may have run before it.
insert into public.profiles (id, display_name, locale)
values
  ('11111111-1111-4111-8111-111111111111', 'Maya Test', 'en'),
  ('22222222-2222-4222-8222-222222222222', 'Alex Test', 'el')
on conflict (id) do update set display_name = excluded.display_name;

-- ---------------------------------------------------------------------------
-- Household — the sharing path, with a second parent already accepted
-- ---------------------------------------------------------------------------

-- `handle_new_household` adds the creator as owner, but it reads the *caller's*
-- JWT, and a seed has none. Insert both memberships explicitly.
insert into public.households (id, name, created_by)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Test Family', '11111111-1111-4111-8111-111111111111');

insert into public.household_members (household_id, user_id, email, role)
values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '11111111-1111-4111-8111-111111111111', 'parent@example.test', 'owner'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '22222222-2222-4222-8222-222222222222', 'partner@example.test', 'parent')
on conflict (household_id, user_id) do nothing;

-- One invite left open, so `/family` has a pending row to render and revoke.
insert into public.household_invites (household_id, email, invited_by)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'grandparent@example.test', '11111111-1111-4111-8111-111111111111')
on conflict (household_id, email) do nothing;

-- ---------------------------------------------------------------------------
-- The children
-- ---------------------------------------------------------------------------

insert into public.babies (id, owner, name, birth_date, palette, household_id)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Iris', (current_date - interval '4 months')::date, 'red',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '11111111-1111-4111-8111-111111111111',
    'Theo', (current_date - interval '16 months')::date, 'blue',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
  );

-- ---------------------------------------------------------------------------
-- Tummy / active sessions — 21 days of history
-- ---------------------------------------------------------------------------
--
-- Three a day for Iris and two longer ones for Theo, so `/tracker`'s bar has
-- blocks to fill rather than a flat total. Every seventh day is skipped for
-- each child, on different days, which is the point: the streak and the
-- on-target count are the two readings that only ever break on a *gap*, and a
-- seed with no gaps tests them at their easiest.
--
-- **Today is anchored to `now()`, earlier days to the wall clock.** Two traps
-- meet here. The database container runs in UTC while the app renders in the
-- reader's zone, so a session written as "today at 08:20" is 11:20 in Athens —
-- and a seed run at 09:00 local put its whole first day in the future, where
-- the `< now()` guard then dropped it and left today empty. And even in the
-- right zone, fixed clock times mean a seed run at 07:00 has nothing yet today.
-- Today's rows are therefore offsets from `now()`, which is correct in every
-- zone at every hour; the days behind it keep clock times, converted from the
-- app's zone, because a history that reads 03:00–04:00 every day looks wrong in
-- a way that matters when you are eyeballing the screens.

-- `Europe/Athens` matches the timezone Playwright pins in `playwright.config.ts`.
-- The date is taken in that zone too: `current_date` is UTC's idea of today,
-- which is the previous day for the first three hours of every local morning.

insert into public.tummy_sessions (owner, baby_id, household_id, started_at, ended_at)
select
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  start_at, start_at + make_interval(mins => len)
from (
  -- Today: always populated, whatever the hour.
  select now() - interval '4 hours' as start_at, 10 as len
  union all select now() - interval '2 hours', 10
  union all select now() - interval '35 minutes', 8
  -- The twenty days behind it.
  union all
  select
    ((((now() at time zone 'Europe/Athens')::date - d) + t.at) at time zone 'Europe/Athens'),
    t.len
  from generate_series(1, 20) as d
  cross join (values
    (time '08:20', 10),
    (time '10:45', 10),
    (time '13:35', 8)
  ) as t(at, len)
  where d % 7 <> 3          -- one missed day a week, to break the streak
) s
where start_at < now();     -- never seed a session that has not happened yet

insert into public.tummy_sessions (owner, baby_id, household_id, started_at, ended_at)
select
  '11111111-1111-4111-8111-111111111111',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  start_at, start_at + make_interval(mins => len)
from (
  -- Deliberately a different total from Iris's day: the scoping tests assert
  -- that the two children do not read the same, so the numbers must not be able
  -- to coincide by accident.
  select now() - interval '5 hours' as start_at, 45 as len
  union all select now() - interval '90 minutes', 60
  union all
  select
    ((((now() at time zone 'Europe/Athens')::date - d) + t.at) at time zone 'Europe/Athens'),
    t.len
  from generate_series(1, 20) as d
  cross join (values
    (time '09:30', 45),
    (time '16:00', 60)
  ) as t(at, len)
  where d % 7 <> 5
) s
where start_at < now();

-- ---------------------------------------------------------------------------
-- Feeds — 14 days
-- ---------------------------------------------------------------------------
--
-- Iris alternates bottle and breast (the two shapes of a feed row: one carries
-- `amount_ml`, the other `minutes`); Theo eats solids at the table plus a milk
-- feed, which is the row `/feed` renders with neither number.

insert into public.feed_logs (owner, baby_id, household_id, fed_at, method, amount_ml, minutes)
select
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  fed_at,
  f.method,
  case when f.method = 'bottle' then f.ml end,
  case when f.method = 'breast' then f.mins end
from (
  -- Today, anchored to `now()` for the same reason the sessions are. All three
  -- row shapes appear here, not only in the history: a bottle carrying
  -- `amount_ml`, a breastfeed carrying `minutes`, and (for Theo) a solid
  -- carrying neither.
  select now() - interval '5 hours' as fed_at, 'bottle' as method, 150 as ml, null::int as mins
  union all select now() - interval '3 hours', 'breast', null, 18
  union all select now() - interval '50 minutes', 'bottle', 160, null
  union all
  select
    ((((now() at time zone 'Europe/Athens')::date - d) + f.at) at time zone 'Europe/Athens'),
    f.method, f.ml, f.mins
  from generate_series(1, 13) as d
  cross join (values
    (time '06:30', 'bottle', 150, null),
    (time '09:15', 'breast', null, 18),
    (time '12:00', 'bottle', 160, null),
    (time '15:00', 'breast', null, 15),
    (time '18:30', 'bottle', 150, null),
    (time '21:45', 'breast', null, 20),
    (time '02:00', 'bottle', 120, null)
  ) as f(at, method, ml, mins)
) f
where fed_at < now();

insert into public.feed_logs (owner, baby_id, household_id, fed_at, method, amount_ml, minutes, note)
select
  '11111111-1111-4111-8111-111111111111',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  fed_at, f.method,
  case when f.method = 'bottle' then f.ml end,
  null,
  f.note
from (
  select now() - interval '4 hours' as fed_at, 'solid' as method, null::int as ml, 'Porridge and fruit' as note
  union all select now() - interval '80 minutes', 'bottle', 200, null
  union all
  select
    ((((now() at time zone 'Europe/Athens')::date - d) + f.at) at time zone 'Europe/Athens'),
    f.method, f.ml, f.note
  from generate_series(1, 13) as d
  cross join (values
    (time '07:30', 'solid',  null, 'Porridge and fruit'),
    (time '12:15', 'solid',  null, 'Family lunch'),
    (time '15:30', 'bottle', 200,  null),
    (time '18:15', 'solid',  null, 'Same food, same table')
  ) as f(at, method, ml, note)
) f
where fed_at < now();

-- ---------------------------------------------------------------------------
-- Growth — one measurement a month since birth
-- ---------------------------------------------------------------------------
--
-- Roughly WHO-median so the charts curve the way a real chart does; a straight
-- line would hide an axis that had silently gone linear-in-the-wrong-unit.

insert into public.baby_measurements (owner, baby_id, household_id, measured_on, weight_kg, height_cm, head_cm)
select
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  ((current_date - interval '4 months') + make_interval(months => m))::date,
  round((3.3 + m * 0.85)::numeric, 2),
  round((49.5 + m * 3.2)::numeric, 1),
  round((34.5 + m * 1.5)::numeric, 1)
from generate_series(0, 4) as m
where ((current_date - interval '4 months') + make_interval(months => m))::date <= current_date;

insert into public.baby_measurements (owner, baby_id, household_id, measured_on, weight_kg, height_cm, head_cm)
select
  '11111111-1111-4111-8111-111111111111',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  ((current_date - interval '16 months') + make_interval(months => m * 2))::date,
  round((3.4 + m * 2 * 0.55)::numeric, 2),
  round((50.0 + m * 2 * 2.1)::numeric, 1),
  round((34.8 + m * 2 * 0.9)::numeric, 1)
from generate_series(0, 8) as m
where ((current_date - interval '16 months') + make_interval(months => m * 2))::date <= current_date;

-- ---------------------------------------------------------------------------
-- Checklist — 10 days, deliberately imperfect
-- ---------------------------------------------------------------------------
--
-- `checklist_entries` is unique on (owner, day, item_id) — it is not scoped per
-- child — so this is the household's day, not a per-baby list. Two days are
-- left short of complete so the streak has an end to find.

insert into public.checklist_entries (owner, baby_id, day, item_id, checked)
select
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  (current_date - d)::date,
  item,
  true
from generate_series(0, 9) as d
cross join unnest(array['respond', 'parentese', 'tummy', 'music', 'screens', 'sleep']) as item
where not (d in (4, 7) and item in ('music', 'screens'))
on conflict (owner, day, item_id) do nothing;

commit;
