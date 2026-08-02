# Test plan

End-to-end coverage for the app, in Playwright. `npm test` runs it; `npm run
test:ui` opens the watch UI; `npm run test:report` shows the last HTML report.

## How it is set up

- **Two projects.** `chromium` at 1440×900 and `mobile` on a Pixel 7. These are
  not the same product: the shell swaps navigations at `xl` (desktop rail vs.
  top bar + bottom tab bar), the schedule row restacks, and the Day dashboard
  stops filling the viewport. A desktop-only suite would miss all of it.
- **Locale and timezone are pinned** (`en-GB`, `Europe/Athens`). The app forces
  a 24-hour clock in both languages; a runner in a 12-hour locale would fail
  assertions that are correct in the product.
- **State is seeded before boot** via `addInitScript` (`tests/helpers.ts`).
  Everything persistent lives in one zustand key; writing it after navigation
  would race hydration and be read back as the default.
- **The network is stubbed, never called.** Open-Meteo is fulfilled with a fixed
  reading. A test that hit the real service would be testing someone else's
  uptime and would report a different temperature every run.
- **Signed out by default.** With no Supabase configured, the local-first paths
  are what run — which is also the state a new user is in. The one exception is
  `signed-in.spec.ts`, which needs the local stack and skips itself without it
  (see below).

## What is covered, and why that thing

### `smoke.spec.ts` — the app loads
Every route renders its `h1`, and **logs no console errors**. That second half is
the point: this is a client-rendered SPA, so a thrown render error still returns
HTTP 200 with a blank page. Also asserts an unknown route redirects home, and
that the `h1` left edge is identical across routes — `PageFrame` exists because
titles used to jump by up to 256px between pages.

One more covers what happens when that does go wrong: a persisted activity kind
nobody wrote makes the timeline throw, and the `ErrorBoundary` above the router
has to show a screen that says the logged data is safe, offers both ways out,
**and still writes the crash to the console** — otherwise the boundary would be
somewhere the nine assertions above go to be hidden.

### `weather.spec.ts` — the header reading
The reading appears once location is allowed; the settings switch removes it and
clears the stored coordinates while leaving the rest of the band intact;
switching back on restores it **without a reload** (the per-load ask guard made
the toggle look dead until you refreshed — the bug the feature exists for); a
browser refusal is explained rather than silently swallowed, and switching on
clears the recorded refusal. A failing weather service must not take the header
down with it.

### `logs.spec.ts` — correcting a logged entry
Both editors used to hold the entry's calendar day fixed and rewrite only the
clock time, so an entry stamped on the wrong day was uncorrectable. Covers: the
feed editor offers a full date **and** time; a feed moves to another day keeping
its time and amount, and leaves today's list (that is the edit succeeding); a
future date is refused; a tummy session takes **one** date for both timestamps,
so start and stop cannot drift onto different days; a stop at or before the
start is refused with a visible reason and a disabled Save.

### `export.spec.ts` — the printable report
Preview content and cover figures; the document is a light sheet while the app
around it stays dark. Then the assertions that are invisible on screen and were
each broken at some point:
- printing hides **the whole app** and un-hides only `#report-document`, so new
  chrome cannot leak onto paper by omission;
- the printed sheet is white — the first version printed black text on black;
- day groups carry `break-inside: avoid` and table headers repeat per page;
- transitions are off in print (`visibility` is a *discrete transition*, so
  controls stayed painted until their animation finished);
- a real PDF is generated and checked for its magic bytes and size.
Empty-state and signed-out growth messaging are covered too, plus **another
child's rows staying out of this child's report** — the report fetched both logs
with no baby filter at all, which signed in meant "rows belonging to nobody" and
signed out pooled two children onto one sheet.

### `schedule.spec.ts` — the day editor
The combined What field (one control, not the old Type-pills-plus-Title pair);
all eight activities offered; changing the activity renames a title the app
wrote but never a hand-typed one; a moment links to the tool that logs it and
only when one exists. Presets add a fully-formed moment in one tap, filing
themselves by the time they carry; a blueprint replaces the day.

**Clock time is the only ordering.** A day given out of order comes back in
order, the small hours sort to the *end* of the day rather than above the
morning wake (the cycle starts at the 06:00 anchor, not at midnight), a moment
that runs into the next one is flagged but never blocked, and the drag handle
and ↑↓ buttons are asserted **absent** — they were the second, disagreeing copy
of the ordering. Driving the `TimePicker` popover itself is deliberately not
covered here: it is a button plus a portal, `fill()` does not reach it, and the
guarantee under test is the ordering, not the picker.

Edits **save themselves** and survive switching programs — the old explicit Save
meant switching discarded unsaved rows silently — and a `pagehide` flush keeps
the last 400 ms of typing when the tab is closed, reloaded or frozen, where no
React cleanup runs at all. That test fires `pagehide` directly rather than
calling `page.reload()`: `seedStore` uses `addInitScript`, which **re-runs on
every load**, so a reload re-seeds the store and any assertion about surviving
one is really measuring the harness. (Checked separately with a seed-once
script: a real reload does preserve the edit.)

Age programs: all nine can be created, any one can be opened and edited
**without touching another**, the effective day resolves by age, deleting one
falls back rather than emptying the editor, a schedule saved before programs
existed is migrated rather than lost, and nine segments **never widen the page
on a phone** (the axis scrolls inside itself; the shell must not).

### `design.spec.ts` — design-system invariants
The eight activity hues are distinct and no two are closer than 25° in OKLCH
hue (`care` and `feed` once sat 22° apart and read as one colour at 16px); those
hues do **not** change with the palette, because an activity's colour is a fixed
meaning; all four theme × palette combinations render with foreground and
background distinct; controls in a row share one height (the scale exists
because a row was once 36/44/44 on a phone); every tab icon resolves 200 and the
base path is applied once, not twice.

`SegmentedGroup` gets three of its own: it is a `radiogroup` with a roving
tabindex and working arrow keys rather than a row of pressed buttons; its
**track** carries the control height, so it matches the stepper it stands beside
on `/feed` (sizing the items instead left it 40px against 32); and the in-use
badge is held at its own height, so stepping along the age axis does not move
the panel under it. The last one measures the heading row, not the whole panel —
the summary below wraps to different line counts per program on a phone, which
is content changing height rather than layout jitter.

Three more cover the tummy console. It reads the day program, so it names how
many sessions the program plans and how many have been logged against them, as
well as the age-derived target those two can disagree with. `/tracker` and the
`/daily` dashboard must render the *same* console — they had drifted into two
different instruments once already. And minutes pour across the planned blocks
in order rather than one block per session, which is asserted off the
`data-solid` attributes because fill widths are invisible to a text-based test. A fourth keeps its two readings of the day from contradicting each other — the
big figure printed a rounded total while "to go" came off the raw one, so a day
24 seconds short read "30 / 30 min" and "1 MIN TO GO" on one line. A fifth
measures **composited** contrast for every label on the day timeline in both
themes: the Wiki chip took the activity's 500 as its text colour behind an 8%
tint of the same hue, which is 1.82:1 for play and 4.05:1 for sleep — all eight
failing on 13px text. Naive contrast checks report 1.00 there, against the
element's own translucent background, so the test flattens the whole stack.

Two in `logs.spec.ts` cover hand-logged sessions:
one lands in History, and a stop time in the future is refused — the date picker
only ever capped the *day*, so "today 45 / 60 min" could describe the next two
hours. Two more: the plan governs the console (one scale is
named, and it is the plan's) while the age guidance judges the plan on
`/schedule`; and another baby's sessions are not counted as this one's.

### `i18n.spec.ts` — Greek is first-class
`Messages = typeof en` makes the two structurally identical at compile time, so
what is left to test is runtime: every page actually renders Greek rather than
falling back to English, the report and the schedule editor are translated
including table headers, both languages stay on a 24-hour clock (CLDR resolves
`el` to π.μ./μ.μ., which the app deliberately overrides), and no imperial unit
appears in either language.

Two more cover the ways structural parity cannot help. A **saved day program**
stores its moments as text, so it used to keep whatever language it was authored
in — a day written in English staying English inside a Greek app, beside a
built-in day that did translate; app-written moments now carry their i18n key and
re-resolve, while a row the caregiver named stays exactly as typed, *including*
one named in the other language. And **no destination in the expanded sidebar is
cut off**: the rail's expanded state exists only to name where each link goes,
and in Greek three of eight did not fit.

### `signed-in.spec.ts` — the server half

The only spec that needs a database. Run it with **`./scripts/dev-stack.sh
test`**, which brings up Docker and a local Supabase seeded by
`supabase/seed.sql`; without a local stack it skips itself. The gate is *"is the
URL localhost"*, not *"is Supabase configured"* — pointed at the hosted project
these would either fail loudly or, far worse, quietly pass by reading a real
family's data.

The fixture is two parents sharing one household and two children **straddling
the first birthday** (Iris at 4 months, Theo at 16), because twelve months is
where the app changes what it measures. Every worst bug this app has had was
invisible with one child: reads that ignored `baby_id` while writes carried it,
so a second child's sessions counted as the first's.

Covers: a session survives a reload (the storage adapter routes tokens to local-
or sessionStorage, and getting it wrong reads as "the app forgot my data"); both
children are on file with their own growth history; **their totals differ**, so
the wrong child's data is a visible number rather than a subtle one; the older
child's page logs *active play* and the younger's *tummy time*; a session
started and stopped in the browser comes back from the server after a reload;
the feed log renders all three row shapes; the family page lists the household,
both parents and the open invite; the **invited co-parent sees the same two
children** — the `owner OR member` half of the RLS policy that the owner's own
session never exercises — and the **printable report carries the selected
child's own logs**, which only a real database can catch: signed out, the filter
and its absence look identical, because local rows written before children
existed are the legacy bucket the report is right to keep.

Two things this spec has to do that the local-first ones do not. Waits on server
data use `NET` (20s) rather than Playwright's five-second default, because
signing in, listing children and loading sessions are three real round trips run
seven workers wide beside a Docker VM — at the default they fail as "this child
has no sessions", which is an alarming sentence for a slow machine. And because
all of it shares **one** database, the writing test runs in a single project and
every tracker test calls `ensureStopped` first: one aborted run left a session
running, and every later test then read a `mm:ss` clock where it expected a
day's total.

## Deliberately not covered

- **Sign-up and password reset.** They are GoTrue's, they send mail, and the
  fixtures exist precisely so nothing has to create an account to run.
- **The hosted project.** Nothing in this suite ever touches it — see the gate
  on `signed-in.spec.ts`.
- **Push notifications.** Permission and delivery are the browser's, and the
  app's own half is a stored flag already asserted through the settings panel.
- **The service worker.** Its caching is what made a stale build run for a week;
  testing it properly needs a production build and two sequential loads, which
  belongs in a separate, slower job.
- **Visual regression.** No screenshot baselines — they are noisy across
  platforms, and the invariants worth protecting (hue separation, control
  heights, print isolation, frame alignment) are asserted numerically instead.

## Adding a test

Seed with `seedStore` / `seedFeeds` / `seedSessions` **before** `page.goto`. Call
`hideOverlays(page)` when the install banner or bottom tab bar would swallow a
click — they are real UI, but a schedule test should fail on the schedule.
Use `openSettings(page)` rather than clicking the trigger directly: both
navigations are in the DOM at every width and only one is visible.

For a signed-in test, use `signIn` / `selectBaby` / `ensureStopped` and the
`FIXTURES` constants from `helpers.ts`, and put it in `signed-in.spec.ts` so it
inherits the local-stack gate. Never hard-code a fixture id or a count that the
seed could change — assert on what the screen says.
