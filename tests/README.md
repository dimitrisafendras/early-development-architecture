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
- **Signed out throughout.** Supabase is not configured in tests, so the
  local-first paths are what run — which is also the state a new user is in.

## What is covered, and why that thing

### `smoke.spec.ts` — the app loads
Every route renders its `h1`, and **logs no console errors**. That second half is
the point: this is a client-rendered SPA, so a thrown render error still returns
HTTP 200 with a blank page. Also asserts an unknown route redirects home, and
that the `h1` left edge is identical across routes — `PageFrame` exists because
titles used to jump by up to 256px between pages.

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
Empty-state and signed-out growth messaging are covered too.

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
`data-solid` attributes because fill widths are invisible to a text-based test. Two in `logs.spec.ts` cover hand-logged sessions:
one lands in History, and a stop time in the future is refused — the date picker
only ever capped the *day*, so "today 45 / 60 min" could describe the next two
hours.

### `i18n.spec.ts` — Greek is first-class
`Messages = typeof en` makes the two structurally identical at compile time, so
what is left to test is runtime: every page actually renders Greek rather than
falling back to English, the report and the schedule editor are translated
including table headers, both languages stay on a 24-hour clock (CLDR resolves
`el` to π.μ./μ.μ., which the app deliberately overrides), and no imperial unit
appears in either language.

## Deliberately not covered

- **Supabase-backed flows** (sign-in, households, growth measurements). They
  need a live project or a stubbed PostgREST; the local-first paths that every
  signed-out user hits are covered instead.
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
