# Interactive Features + Supabase — Implementation Plan

Prioritized plan for adding live interactive functionality to the app and wiring
Supabase (org `trmfffzkmabmanjwhcmh`) as the backend. The app stays a static
Vite SPA on GitHub Pages — Supabase provides ALL server capability (Postgres,
Auth, Realtime, Edge Functions). Anon key is public by design; **RLS is the
security boundary on every table.**

---

## P0 — Supabase wiring (foundation, blocks everything else)

**0.1 Project + credentials**
- Create (or pick) a project in the org; grab `Project URL` + `anon` key
  (Dashboard → Project Settings → API). ⚠️ Needed from Dimitris — the dashboard
  is auth-only. Only these two values; never the `service_role` key.
- Local dev: `.env.local` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  (gitignore `.env*`). CI: same two values as GitHub Actions repo secrets,
  passed as `env:` to the build step in `.github/workflows/deploy.yml`.

**0.2 Client + auth scaffolding**
- `npm i @supabase/supabase-js`
- `src/lib/supabase.ts` — singleton client (env-driven; app must still fully
  work with NO env set → all sync features hidden, infographic untouched).
- Auth: **anonymous sign-in enabled** (zero-friction start) + email OTP/magic
  link to "claim" the account later (`linkIdentity`). Redirect URL allow-list
  must include `https://dimitrisafendras.github.io/early-development-architecture/`
  (and `http://localhost:5173`/`5174` for dev).
- `src/store.ts`: add `session` slice (user, status) hydrated from
  `supabase.auth.onAuthStateChange`.
- UI: small account chip in the GlassNav (sign in / signed-in state) built from
  existing DS components.

**0.3 Base schema + RLS** (SQL migration, run via dashboard SQL editor or CLI)
```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  locale text default 'en',
  created_at timestamptz default now()
);
create table babies (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users on delete cascade,
  name text not null,
  birth_date date not null,
  palette text default 'red',
  created_at timestamptz default now()
);
-- every feature table below carries owner uuid + the same RLS shape
alter table profiles enable row level security;
alter table babies enable row level security;
create policy "own rows" on babies for all
  using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own profile" on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());
```

**Acceptance:** app builds/deploys with and without env; anonymous session
created on first visit; a `babies` row can be created and read back; RLS
verified (second account sees nothing).

---

## P1 — Core interactive features

**1.1 Tummy-time session timer** (the flagship "schedule timer")
- New route `/tracker` (router + GlassNav link; content cards opaque per DS).
- Start/stop timer with a large palette-tinted progress ring toward the
  age-appropriate daily target (derived from `babies.birth_date` and the
  existing 5→60 min progression data in `src/data.ts`).
- Survives reload/close: active session persisted as `started_at` in
  localStorage AND a `tummy_sessions` row with `ended_at is null`; on load,
  resume or auto-close stale sessions.
- Schema: `tummy_sessions(id, owner, baby_id, started_at, ended_at)` + RLS.
- Today view: sessions list, cumulative minutes, target %, delete-mistake.
- Reuse: chart.js weekly bar (existing `useChartColors`), DS Card/GlassButton.

**1.2 Live daily routine ("what's now")**
- Upgrade the Module-5 schedule cards into a live timeline: highlight the
  current block, countdown to the next, "now" marker; purely client-side
  (no backend), driven by the existing `scheduleBlocks` data + `Date`.
- Per-family customization (P1.5, optional): `routine_blocks` table overriding
  the defaults (time ranges editable in a Sheet form).

**1.3 Synced daily checklist**
- Make the Module-7 checklist per-day: `checklist_entries(owner, baby_id, day date, item_id text, checked bool)`,
  unique `(owner, baby_id, day, item_id)`; upsert on toggle.
- Local-first: zustand stays the source of truth offline; background upsert
  when a session exists; pull on load. Streak counter ("5 days all-green").

**Acceptance:** timer runs/resumes across reloads and devices; sessions appear
in the DB; checklist state follows the signed-in user across two browsers;
everything still AA in all 4 theme×palette combos; `npm run build` green.

---

## P2 — Depth

- **2.1 Baby profiles & progress monitoring** — onboarding Sheet (name, birth
  date, palette; optional photo via Supabase Storage later). All targets
  (tummy-time minutes, milestone windows) derive from the baby's age; profile
  switcher when multiple babies. Progress model per baby: age-banded milestone
  checklist (0–3/3–6/6–9/9–12 months: head control, rolling, sitting, first
  words...), tummy-time progression vs. the age target, daily-checklist
  adherence — each stored per baby (`milestones(owner, baby_id, milestone_id,
  achieved_on)`), each RLS-guarded.
- **2.2 Stats dashboard** — a per-baby `/stats` view (or a Stats tab on
  `/tracker`): weekly/monthly tummy-time bar charts vs. target line, checklist
  streaks + adherence %, milestone timeline (achieved vs. typical window),
  totals and trends — all via the existing palette-aware chart.js setup and DS
  cards; empty/loading/error states with Skeleton/Alert. Queries aggregate in
  Postgres (views or `rpc`) so the client stays thin.
- **2.3 Serve & Return response trainer** — playful reaction-window exercise
  using the existing latency simulator content (educational mini-game, local
  only; log attempts to `sr_attempts` if signed in).
- **2.4 Realtime cross-device sync** — Supabase Realtime channel on
  `tummy_sessions`/`checklist_entries` so a phone-started timer shows on desktop.

---

## P3 — Later

- **3.1 Household sharing** — `households`, `household_members`, invite by
  email; RLS switches from `owner = auth.uid()` to membership subquery.
- **3.2 Reminders** — in-app scheduled toasts while open (simple); real Web
  Push needs a push server → Supabase Edge Function + VAPID (evaluate then).
- **3.3 Offline write queue** — SW/IndexedDB outbox replaying mutations
  (currently: localStorage-first covers the common case).
- **3.4 el/en content for new features** — new strings go through the same
  locale mechanism the app now has (`locale` in store).

---

## Execution notes

- Order: 0.1 → 0.2 → 0.3 → 1.1 → 1.2 → 1.3, each its own commit; deploy after
  every P-level (Pages auto-deploys on push).
- Delegation: schema/SQL + client wiring (Sonnet-level agent); `/tracker` UI
  and live-routine UI (frontend-web-expert, Opus); contrast re-audit only on
  the new screens.
- Guardrails: no service_role in the repo ever; every new table gets RLS in the
  same migration that creates it; app must degrade gracefully without env/session.

**Blocker to start P0:** the Supabase Project URL + anon key (or log in
`supabase` CLI locally and I take it from there).
