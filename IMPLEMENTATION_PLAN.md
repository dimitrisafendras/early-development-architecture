# Interactive Features + Supabase — Implementation Plan

Prioritized plan for adding live interactive functionality to the app and wiring
Supabase as the backend. The app stays a static
Vite SPA on GitHub Pages — Supabase provides ALL server capability (Postgres,
Auth, Realtime, Edge Functions). Anon/publishable key is public by design;
**RLS is the security boundary on every table.**

**Project:** `early-development` — ref `fmmztrxenoiwhiwxkzzn`, personal org
`dimitrisafendras's Org` (Free tier). URL `https://fmmztrxenoiwhiwxkzzn.supabase.co`.
Uses the new publishable key format (`sb_publishable_…`), not the legacy JWT anon.
The Supabase MCP has no permission on this project (personal org) → migrations
run via the dashboard SQL editor (browser), kept as files in `supabase/migrations/`.

**Status legend:** ✅ done · 🔜 next · ⬜ not started

---

## P0 — Supabase wiring (foundation, blocks everything else) ✅ DONE

**0.1 Project + credentials** ✅
- Project + publishable key captured. `.env.local` written; GitHub Actions repo
  secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` set (2026-07-24).
  `.env*` gitignored. Never the `service_role` / `sb_secret_…` key.

**0.2 Client + auth scaffolding** ✅
- `@supabase/supabase-js@^2.110` installed.
- `src/lib/supabase.ts` — env-driven singleton, `null` when env absent (app
  degrades gracefully). `src/lib/use-session.ts` hydrates the live session.
- Auth: **email + password** (commit c122366 deliberately replaced the earlier
  magic-link/Google approach — kept per decision 2026-07-24; the plan's original
  anonymous+magic-link is NOT used). `AccountControl` in the GlassNav renders the
  sign-in popover / signed-in identity, nothing when Supabase is unconfigured.
- Redirect allow-list still to confirm for prod:
  `https://dimitrisafendras.github.io/early-development-architecture/`.
- NOTE: `src/store.ts` has no `session` slice — session lives in `use-session.ts`
  (hook-local). Add a store slice only if P1 needs session outside React tree.

**0.3 Base schema + RLS** ✅ — `supabase/migrations/0001_base_schema.sql`, run in
  the dashboard. `profiles` + `babies` created, RLS enabled, owner-only policies,
  `handle_new_user` trigger auto-creates a profile on signup.
  ⚠️ The pre-existing signed-in user predates the trigger → has no `profiles`
  row yet (app doesn't read profiles yet, so harmless).

**Verified 2026-07-24 (local, Chrome):** app runs with env; real session active;
`babies` insert `201` + read `200` via live session token; RLS enforces
`owner = auth.uid()`; test row deleted. Acceptance met.

**Original 0.3 SQL** (reference — actual applied version is in the migration file):
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

## P1 — Core interactive features ✅ DONE (2026-07-24, branch `feat/p1-interactive-features`)

Migrations `0002_tracker_and_checklist.sql` + `0003_baby_measurements.sql` applied
in the dashboard. Verified locally in Chrome (signed in): tummy start/stop/delete
synced; live routine highlights the current block; checklist streak + cross-device
sync; baby profile + measurement + growth charts. Every table owner-scoped + RLS.

**1.1 Tummy-time session timer** (the flagship "schedule timer") ✅
- `/tracker` route (nav link; opaque DS cards). `ProgressRing` toward the
  age-derived daily target; live mm:ss clock. localStorage active-session resume
  + stale (>3h) auto-discard; open `tummy_sessions` row when signed in. Today
  list (delete), cumulative vs target, last-7-days bar chart w/ target line.
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

**1.2 Live daily routine ("what's now")** ✅ — Module-5 cards upgraded to a live
timeline: "right now" banner, up-next countdown, pulsing NOW badge + ring on the
active block. Pure client-side (`src/lib/schedule.ts`), re-evaluates every 30s.
- Upgrade the Module-5 schedule cards into a live timeline: highlight the
  current block, countdown to the next, "now" marker; purely client-side
  (no backend), driven by the existing `scheduleBlocks` data + `Date`.
- Per-family customization (P1.5, optional): `routine_blocks` table overriding
  the defaults (time ranges editable in a Sheet form).

**1.3 Synced daily checklist** ✅ — checklist is per-day (`checklist_entries`,
unique `(owner, day, item_id)`, upsert on toggle). Local-first via the zustand
`checklistHistory` map (persisted); pulls the server's today-set on sign-in.
Streak counter ("N day streak") + "all done" state.
- Make the Module-7 checklist per-day: `checklist_entries(owner, baby_id, day date, item_id text, checked bool)`,
  unique `(owner, baby_id, day, item_id)`; upsert on toggle.
- Local-first: zustand stays the source of truth offline; background upsert
  when a session exists; pull on load. Streak counter ("5 days all-green").

**Acceptance:** timer runs/resumes across reloads and devices; sessions appear
in the DB; checklist state follows the signed-in user across two browsers;
everything still AA in all 4 theme×palette combos; `npm run build` green.

---

## P2 — Depth

- **2.1 Baby profiles & growth monitoring** — ✅ PARTIAL (2026-07-24): `/baby`
  route with a create-profile form (name, birth date, palette), a baby switcher,
  and a growth monitor — weight / height / head measurements (`baby_measurements`
  table + RLS) with add form, per-metric line charts, and latest-value stat tiles.
  Age drives the tummy target. ⬜ Still to do: age-banded milestone checklist,
  optional photo via Storage. Original 2.1 scope below:
- **2.1 (original)** — onboarding Sheet (name, birth
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

- **3.1 Household sharing** — ✅ DONE (2026-07-24, migration 0004). `households`,
  `household_members`, `household_invites`; membership RLS via SECURITY DEFINER
  `is_member()`; `accept_invite()` RPC; `household_id` on babies/measurements/
  tummy_sessions with owner-OR-member policies. `/family` page: create family,
  invite by email + accept, members list, share babies, leave. (Email is stored,
  not sent — the invitee accepts from their own Family page after signing in.)
- **Extra:** hub cards are drag-reorderable within each theme group; order
  persists per browser (`cardOrder` in the zustand store).
- **3.2 Reminders / notifications** — ✅ PARTIAL (2026-07-31). One model, two
  surfaces. `src/lib/notifications.ts` is pure: it takes a snapshot of live state
  and returns today's notifications, each naming exactly one destination —
  the moment happening now (`/`), a feed likely due or none logged yet (`/feed`),
  floor time still owed (`/tracker`), a household invite waiting (`/family`),
  the rotating topic of the day (`/wiki/:slug`), plus two ambient in-app-only
  ones (checklist progress, "add your baby"). Ids are `kind:YYYY-MM-DD:detail`,
  so read/dismissed/already-fired state expires at midnight by itself and
  re-arms within the day (a new slot, another feed logged).
  - In-app: `NotificationBell` (unread count + popover of link rows, dismiss,
    mark-all-read) in the desktop rail and the mobile bar; state lives once in
    `NotificationsProvider` (mounted in `Layout`) so the two bells share one set
    of tracker/feed/baby subscriptions. `GlassNav` gained an `inlineActions` slot
    for controls that must stay visible at every breakpoint.
  - OS notifications: opt-in toggle in `SettingsMenu`, delivered via
    `registration.showNotification` (`src/lib/push.ts`); `notificationclick` in
    `public/sw.js` focuses an open tab and posts it the route, or opens a window
    on it. `notifSeen` / `notifDismissed` / `notifPush` persist in the store.

  ⬜ **Still to do — real background Web Push.** Delivery today is *local*: it
  only fires while the app is running (background tab or minimised installed PWA
  count; fully closed does not). Closing that gap needs a push server:
  1. Generate a VAPID keypair; public key in `VITE_` env, private key as an Edge
     Function secret (never in the repo).
  2. `pushManager.subscribe({ applicationServerKey })` on opt-in; store the
     subscription in a `push_subscriptions` table (owner + endpoint + keys,
     RLS owner-only, unique on endpoint, prune on 404/410).
  3. Supabase Edge Function on a cron (`pg_cron` or scheduled function) that
     re-derives the same notification set server-side and pushes to each
     subscription. **This means the rules in `notifications.ts` have to exist in
     two places** — either port them to the function, or move the schedule/target
     logic into Postgres and have both read it. Decide that before starting.
  4. `push` event handler in `sw.js` (`event.data.json()` → `showNotification`
     with the same `data.path` contract the click handler already reads).
  5. Quiet hours + a per-kind opt-out, which local delivery didn't need because
     the app being open was itself the filter.

  ⬜ **Tune the routine cadence.** The "happening now" notification fires once
  per schedule slot — ~12–14 a day on a newborn day. Correct for a routine
  reminder and it is opt-in, but if it reads as too much: gate it to slots the
  caregiver marks as reminder-worthy, or flip its `push` flag to in-app only
  (one-line change in `buildNotifications`).
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

**P0 unblocked & complete** (2026-07-24). Next: P1.2 (client-only, no deps) or
P1.1 (needs `tummy_sessions` migration first). Migrations run via the dashboard
SQL editor since the MCP can't reach this personal-org project.
