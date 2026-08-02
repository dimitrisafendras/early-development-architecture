---
name: dev-stack
description: Use when running this repo's tests, seeding or resetting local data, working on anything signed-in (auth, babies, households, sync), or when Playwright failures look like timeouts rather than assertions. Brings up Docker + local Supabase with fixture data, then runs the suite and tells load flakes apart from real regressions.
---

# Local dev stack

Everything runs through one script — `./scripts/dev-stack.sh`. Read it before
working around it; it already handles the cases below.

| Command | What it does |
|---|---|
| `./scripts/dev-stack.sh up` | Docker + Supabase, seeded if empty. Idempotent — safe to run every time. |
| `./scripts/dev-stack.sh test [args]` | `up`, then the Playwright suite against the local stack. Extra args pass through (`test tests/logs.spec.ts`). |
| `./scripts/dev-stack.sh dev` | `up`, then `npm run dev` pointed at the local stack. |
| `./scripts/dev-stack.sh reset` | Wipe the database, re-apply migrations + `supabase/seed.sql`. |
| `./scripts/dev-stack.sh status` | What is running, plus the fixture accounts. |
| `./scripts/dev-stack.sh down` | Stop Supabase. Docker stays up. |

## What you get

Two accounts, both password `devpassword`, both local-only:

- `parent@example.test` — owns the household and both children
- `partner@example.test` — an accepted co-parent, sees exactly the same data
  through household RLS

Two children, deliberately straddling the first birthday, because twelve months
is where the app changes what it measures — tummy time becomes active play, the
target moves from the AAP ramp to the WHO's 180 minutes, and the day program
switches template:

- **Iris**, 4 months — 21 days of tummy sessions, 14 days of bottle/breast feeds
- **Theo**, 16 months — the same shape in active play and solids

Plus growth measurements since birth, ten days of checklist entries, and one
open household invite. Ages are offsets from `current_date`, so the fixture
keeps describing the same two children a year from now.

## Rules

**Never point `.env.local` at the local stack.** It holds the hosted project's
credentials. The script exports `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
inline for the child process only — Vite gives inline vars priority over
`.env.local` — so nothing on disk changes and nothing survives the process.

**Never apply `supabase/seed.sql` to a remote database.** It writes directly
into `auth.users`, which the hosted project owns.

**The ports are 544xx, not the Supabase defaults.** Another local Supabase
project on this machine holds 5432x and `supabase start` refuses to share them.
The offsets live in `supabase/config.toml`; read them back with
`supabase status -o env` rather than hard-coding them anywhere new.

## When the suite fails

Check whether the failures are timeouts before reading them as regressions.

This machine runs two browser projects across seven workers beside a Docker VM.
Under load — a Docker VM pegging a core, a macOS Spotlight or Contacts reindex —
the suite goes from ~30 seconds to 45 minutes and fails 9–28 tests on a
**different set every run**, always with `page.goto`, `locator.click` or
`browserType.launch` timeouts rather than failed assertions.

`dev-stack.sh test` already does the triage: on any failure it re-runs just the
failures with `--workers=2`. If they pass, they were load flakes and it says so;
if they fail again, they are real and it exits non-zero. Do not report a suite
as broken without that second pass, and do not report it as green if the second
pass is what saved it — say which.

Three tells that it is the host and not the code:

1. The failing set changes between runs.
2. Every error is a timeout; no assertion actually disagrees with a value.
3. `uptime` shows a load average well above the core count.

If it is the host, `npx playwright test --workers=2` for the whole suite is
usually enough to get a clean signal — or wait for the machine to settle.
