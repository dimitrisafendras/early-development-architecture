# CLAUDE.md

Guidance for Claude Code sessions working in this repo.

## Project

**The Architecture of Early Development** — a React SPA:

- `/` — landing hub: a card grid linking to the seven infographic topics
- `/` — landing hub, split into **Your Day** (a prominent card → `/daily`) and **Learn** (the themed topic grid)
- `/daily` — the combined "Your Day" dashboard: live "what's now" routine + tummy-time widget + today's checklist + links to Full Day / routine
- `/learn/:group` — a whole theme group on one page (topics stacked + "on this page" jump nav + prev/next group pager). The hub's Learn area links here. Groups: `foundations`, `connection`, `rhythm` (see `learnGroups`)
- `/topic/:slug` — a single Learn topic on its own page (still used by deep links, the `/daily` links, and the topic pager)
- `/tracker` — full tummy-time session tracker (local-first, syncs to Supabase when signed in)
- `/baby` — baby profile (create/edit/delete) + weight/height/head growth monitoring
- `/family` — household sharing: create a family, invite parents, share babies
- `/export` — the printable care report: range + section controls over a live preview, exported via `window.print()`
- `/design-system` — a Liquid Glass design system documentation page

The Learn topics are defined once in `src/sections/registry.tsx` (slug, module, `group`, icon, i18n label/blurb getters, section component). That registry drives the hub grid (grouped by theme via `group` / `groupOrder`), the routes, the nav links, and the pager. Topic content/data lives in `src/data.ts` + `src/i18n.ts` (en + el must stay in sync — `Messages = typeof en`).

### Day programs (`/schedule`)

A **program** is a saved day that applies from a start age in months until the next program begins, so the effective day follows the child as they grow (`scheduleForAge`). The nine built-in sample days live in `dayTemplates` (`src/data.ts`), one per age band birth to three years and beyond; their boundaries are the ages at which the day actually changes shape (a nap is dropped, solids start, a wake window crosses into the next published range), and each is built to the AASM/AAP sleep totals, the age's wake-window range and the WHO movement targets.

Two invariants that are easy to break:

- **Slot text is keyed, not positional — and the key survives being saved.** A template slot carries a `moment: MomentKey`, resolved against `fullDay.moments` in i18n. It used to be an array paired by index, so inserting one slot silently re-labelled every moment after it. Add a moment by adding a key, never by lining up two arrays. A *saved* program keeps the key too, and `localizeSlot` re-resolves it on every read: `title`/`detail` are stored as text, which is right for "Dad's turn" and wrong for "Long midday sleep", so a day authored in English used to stay English inside a Greek app for ever. Renaming a row clears its key — from then on the words are the caregiver's. Programs saved before the key existed are recognised by title against **both** catalogues; a title nobody's catalogue claims is left alone.
- **Adding a moment asks when, then what.** The add form opens on `firstFreeTime` — the first real gap in the day, not the end of the array (which on a clock-sorted day is the 02:00 night feed). Presets take that time rather than the one they were written with. Because a new moment files itself into the middle of a twenty-odd row list, every add ends by scrolling to the new row, focusing its name and lighting it briefly; don't add an insert path that skips that.
- **Clock time is the only ordering.** `/schedule` sorts by `sortByClock`, whose day cycle starts at the 06:00 anchor in `src/lib/schedule.ts` — so a 02:00 night feed files at the *end* of the day, not above the morning wake. There is deliberately no drag handle and no ↑↓: a second, hand-maintained order is what let the list and the times disagree. Moving a moment means changing its time. Edits autosave.

**The day program governs the tracker.** `/tracker`'s console is scaled by the sessions the caregiver's own day plans (`useSchedule()` — `tummy` slots, or `active` from twelve months): "done" means the plan filled, the bar's blocks are the plan's sessions, and the readout counts to the plan's total. The age-derived target (`activityTargetForAge` — the AAP ramp under a year, the WHO's 180 min after) governs only when the day plans nothing of that kind, and it still governs the tiles, the week chart and the streak. It judges *the plan* on `/schedule`, next to the day being authored — which is the only place the plan can still be changed. Scaling the console by both was what made the newborn day announce the target met with two of its three planned blocks still empty.

**Logs are scoped to one baby.** Reads used to ignore `baby_id` while writes carried it, so a second child's sessions and feeds counted as the first's. `listSessionsSince` / `findOpenSession` / `listFeedsSince` all take a baby now, and the local lists filter the same way — **including `useReportData`**, which omitted it longest: with no id the server query means *rows belonging to nobody*, so every signed-in household's `/export` report stated zero feeds and zero tummy time on the one page meant to be handed to a doctor. Rows with no `baby_id` are a legacy bucket that drains, since every new row is stamped. Both hooks ignore stale responses — `babyId` arrives asynchronously, so an unscoped load is always in flight beside the scoped one and used to win.

The tracker reads the day program too. `/tracker`'s target is age-derived (`activityTargetForAge` — the AAP ramp under a year, the WHO's 180 min from the first birthday), but the sessions the caregiver's own day *plans* come from `useSchedule()` — the `tummy` slots, or `active` from twelve months. The console's bar is drawn in *sessions*, not minutes: one section per planned session, each as wide as that session is long, filled as you log them and outlined while still to come. It states both totals, because they can disagree — the newborn sample day plans 15 min against a 5 min target, and while the two lived on separate pages nothing said so.

**A widget that appears on both a page and the dashboard is one component, not two.** `/feed` and `/daily` share `FeedProgress` + `AddFeedForm`; `/tracker` and `/daily` share `TummyConsole`. Each takes a `compact` prop for the dashboard, and that prop is a *density* switch only — smaller type, a shorter caption. If the two screens would say different things, that belongs in the caller. The tummy pair spent a while as two different instruments (a session bar on the page, a progress ring with its own clock and labels on the dashboard), which is exactly the drift this rule exists to stop.

Shared daily logic is hook-first: `useDailyChecklist` (checklist + streak + sync), `useTummyTracker`, `useBabies`, `useHousehold`, `useBabyAge` (age-band highlighting). Both the `/daily` widgets and the standalone sections/pages reuse these — don't duplicate the state.

## Stack

- **Vite + React 18 + TypeScript** (strict mode; `noUnusedLocals` / `noUnusedParameters` are on — unused imports fail `npm run build`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — CSS-first config lives in `src/index.css`; there is no `tailwind.config.*` file
- **shadcn/ui** (style `base-nova`, base-ui primitives) — components are vendored source in `src/components/ui/`, configured by `components.json`, added with `npx shadcn@latest add <name>`
  - `cn()` utility: `src/lib/utils.ts`
  - Path alias `@/` → `src/` (see `vite.config.ts` and the tsconfig files)
- **`@dimitrisafendras/liquid-glass`** — the Liquid Glass material, an **external package** pinned to a git tag (see "Liquid Glass" below). Not editable from here
- **shadcn MCP server** configured in `.mcp.json` — use it to browse/search/install registry components
- **zustand** — single global store at `src/store.ts`
- **react-router-dom** — routing; `src/App.tsx` holds the `<Routes>`, pages live in `src/pages/`
- **chart.js + react-chartjs-2** — all charts go through `src/components/charts.tsx`
- **lucide-react** — all icons

## Structure

| Path | Purpose |
|---|---|
| `src/pages/` | Route components (`Day.tsx` = home split view, `Wiki.tsx` / `WikiTopic.tsx`, `Tracker.tsx`, `FeedLog.tsx`, `Baby.tsx`, `Family.tsx`, `Export.tsx`, `Auth.tsx`, `DesignSystem.tsx`) |
| `src/components/report/` | `ReportDocument` — the `/export` document. It is **both** the on-screen preview and the printed page; never add a second print-only layout. It carries its own light tokens (`.report-document` in `index.css`) and pins its charts with `scheme="light"`, because chart.js paints from JS values a print stylesheet cannot reach. Printing is isolated by the `@media print` block in `index.css`, which hides the whole page and un-hides `#report-document` alone — so new app chrome never leaks onto paper and needs no `print:hidden` annotation |
| `src/components/` | Shared app components — `Layout` (app shell), `SideNav` (desktop rail) / `NavBar` (mobile bar) / `BottomNav`, `SettingsMenu`, `AuroraBackground`, `PageFrame`, `WidgetPage`, `SectionHeader`, `StatTile`, `AgeBadge`, `ProgressRing`, `ErrorBoundary` (mounted above the router in `main.tsx` — an SPA render error otherwise leaves a blank page that still returns 200), `dayActivity`, `charts.tsx` |
| `src/components/ui/` | Vendored shadcn primitives. These are **owned source, not a dependency** — edit them directly to extend variants/behavior |
| `src/sections/` | The infographic topic sections (registry-driven, rendered on the Wiki topic pages) |
| `src/design-system/docs/` | Sections rendered by the `/design-system` route. These document *this app* — its shell, its widget-page rhythm, its control scale — as much as the glass material, which is why they stayed when the material left (see "Liquid Glass") |
| `src/data.ts` | All infographic content/data |
| `src/store.ts` | zustand store — `dark` / `toggleTheme`, `palette` (`'blue' | 'red'`) / `setPalette`, `navCollapsed` / `toggleNav` (sidebar), latency simulator state, checklist state |

## Liquid Glass (external design system)

The glass material lives in its own public repo — **[dimitrisafendras/liquid-glass](https://github.com/dimitrisafendras/liquid-glass)** — and is consumed here as a git dependency pinned to a tag:

```json
"@dimitrisafendras/liquid-glass": "github:dimitrisafendras/liquid-glass#v0.2.0"
```

It ships TypeScript source and builds itself on `npm install` (a `prepare` script), so there is no committed `dist` to go stale — and no `--ignore-scripts` anywhere in CI, or the package arrives unbuilt.

**Nothing the package owns is duplicated here.** If you find yourself writing a glass component, a `cn`, or a palette value in this repo, it already exists over there:

| The app has | Because |
|---|---|
| `src/lib/utils.ts` | A one-line re-export of the package's `cn`. The path must stay — `components.json` names it as the `utils` alias, so every primitive `npx shadcn add` generates imports from it |
| No `[data-palette]` blocks | They come from `palettes.css` (below). `src/index.css` keeps only the neutral base |
| No chart hex table | `charts.tsx` reads the ramps off `palettes` in the package's tokens; chart.js needs literal colors, so it looks up a ramp *step*, never a copied hex |

- **Import from the package**, never from a local path: `import { GlassSurface, GlassNav, GlassButton, GlassToggleGroup, GlassScrollArea } from '@dimitrisafendras/liquid-glass'`. Design tokens are on the `/tokens` subpath.
- **Two stylesheets, imported once each in `src/main.tsx`** — `styles.css` (the material) and `palettes.css` (the accent roles per theme × palette). Never re-import either per component.
- **Tailwind must be told the package exists.** `src/index.css` carries `@source "../node_modules/@dimitrisafendras/liquid-glass/dist"`. Tailwind v4 skips git-ignored directories when it scans for sources, so without that line the package's utility classes are silently never generated and the whole nav layer renders unstyled. Don't remove it.
- **The neutral base is still this app's** — `--background`, `--foreground`, `--card`, `--popover`, `--border`, `--muted`, `--destructive`, `--success`, `--warning` live in `src/index.css`. `palettes.css` deliberately overrides only the five accent roles, so the two compose rather than fight.
- **To change a glass component or a palette value, change it in the other repo**, tag a release, and bump the `#v…` ref here. Editing anything under `node_modules/` is not a fix.

## Theming

Theming is a **dual axis**: theme (light/dark) × palette (soft blue "boy" / soft red "girl").

- `App.tsx` has an effect that reads the store and sets `data-theme`, the `.dark` class, and `data-palette` on `<html>`
- the neutral shadcn CSS variables live in `src/index.css`
- the `[data-palette='blue']` / `[data-palette='red']` blocks that override `--primary`, `--accent`, `--ring` (each with light and dark values) come from `@dimitrisafendras/liquid-glass/palettes.css` — **not** from `src/index.css`. Change a palette in that repo and release it
- Tailwind's `dark:` variant is a custom variant (defined in `src/index.css`) that matches both `.dark` and `[data-theme='dark']`

When adding UI, always test both palettes × both themes (4 combinations).

## App shell & page frame

- `Layout` is the shell. Navigation has **two forms, one per breakpoint**: the `SideNav` glass rail from `xl` up (slim icon rail by default, expandable to labelled rows — the choice persists via `navCollapsed` in the store), and the floating `NavBar` (collapsed to a hamburger) + `BottomNav` tab bar below `xl`. There is no footer.
- **The height model and the navigation switch at different breakpoints, deliberately.** From **`lg`** the shell is exactly **one viewport tall and never scrolls itself** (`lg:h-svh lg:overflow-hidden`); the content column scrolls (`#app-scroll`, see `APP_SCROLL_ID`). A page that fills the column (the Day dashboard) therefore keeps a stable height and scrolls **inside its cards**; long documents scroll the column. Below `lg` the document scrolls normally. Anything that resets or measures scroll must handle the column, not just `window`.
- The height model must not drift back to `xl`: the Day dashboard switches to its two-column, fills-the-height layout at `lg` and uncaps its inner scroll areas there. When the shell only fixed the height at `xl`, every landscape tablet (1024–1279px) laid out for a height nothing provided — the cards grew to full content and the page ran to ~4 viewports. If you change one breakpoint, change both.
- `AuroraBackground` is mounted **once** in `Layout`: a fixed, palette-tinted, slowly drifting aurora behind everything. Pages must not add their own background glow, and nothing in the shell may create a containing block for `position: fixed` (no `transform`/`filter`/`contain` on an ancestor).
- **`PageFrame` is the one page frame** — `max-w-6xl`, `page-px`, `py-10`, `gap-8`, plus the canonical header row (`SectionHeader` + optional `aside`) and an optional full-width `toolbar` under it. Every route uses it (`WidgetPage` is built on top of it); `/signin` is the only sanctioned width exception (`className="max-w-md"`). Never hand-roll a `<main>` frame in a page — that is what made titles and card edges jump by up to 256px between routes.

## Widget page pattern (glance → input → detail)

**Every logging page is a widget page** — any page whose job is "check one thing, then record one thing": `/tracker`, `/feed`, `/baby`, and any new one. (`/daily` and `/routine` are dashboards, not widget pages.) A widget page always reads top-to-bottom in three tiers:

1. **glance — the four quick tiles, nothing else.** Where am I right now, in one glance: a `WidgetStatGrid` of `StatTile`s. Read-only; no hero visuals, no forms, history or charts — the input is the page's most important thing, so the tiles are all that may stand above it.
2. **input — the one thing you came to do.** Start the timer, log the feed, add the measurement. Sits directly under the tiles. The tier's eyebrow names the action, so the card inside carries **no title of its own**; a hero visual that belongs with the action (the tracker's session bar) lives *inside* this card, with its control.
3. **detail — extensive info.** History lists, charts, guidance, profile editing and destructive actions. Everything you read rather than answer.

Build it with `WidgetPage` (`src/components/WidgetPage.tsx`), which takes the tiers as **slot props** (`glance` / `input` / `detail`) so the order can't be got wrong, adds the tier eyebrows and divider, and delegates the page frame itself to `PageFrame`. Never hand-roll that frame in a page.

- `toolbar` — full-width context switcher under the header (e.g. which baby).
- `aside` — small trailing header content (e.g. `AgeBadge`).
- `children` — **only** for states that precede the rhythm: loading skeletons, sign-in gating, first-run forms.
- Inside a tier: `WidgetStatGrid` (stat row), `WidgetCard` (titled block, optional `icon` / `meta` / `footer`), `WidgetSplit` (a list beside its chart).
- Tiers are opaque content surfaces (shadcn `Card`) — never the glass material.

Documented on `/design-system` under **Patterns** (`src/design-system/docs/PatternsSection.tsx`) — update that section when the pattern changes.

## When to use which technology

- **Design system first (respect the DS)** — always reach for an existing shared component before writing markup: shadcn primitives in `src/components/ui/*`, the Liquid Glass components from `@dimitrisafendras/liquid-glass`, and the shared app components in `src/components/*` (`PageFrame`, `WidgetPage`, `SectionHeader`, `StatTile`, `AgeBadge`, `ProgressRing`, `GlassScrollArea`, charts, …). If a component almost fits but lacks a variant or behavior, **extend that component** (it's owned source) rather than hand-rolling a one-off. If a pattern is used on more than one screen (stat tiles, scroll regions, page headers, empty states), **extract it into a shared component** instead of duplicating it per page. Never reintroduce a bespoke version of something the DS already provides.
- **shadcn primitives (`src/components/ui/*`)** — default for all standard UI: buttons, cards, form controls, overlays, etc. Never hand-roll a raw `<button>` or `<input>` when a primitive already exists.
- **Control sizes — one scale, one size per row.** Every control (`Button`, `Input`, `NumberInput`, `DatePicker`, `TimePicker`, `DateTimePicker`, `Toggle`/`ToggleGroup`/`ChoiceGroup`/`SegmentedGroup`) takes the same three sizes — `sm` / `md` / `lg` — and at a given size they are **exactly the same height**. The scale is defined once in **`src/components/ui/control-size.ts`** (`sm` 36→28px, `md` 44→32px, `lg` 48→40px; mobile-first, so `md` meets the 44px touch minimum on phones). Rules: give every control standing side by side in a row the **same** size; make one stand out with its **`variant`**, never by being taller; never patch a height with a `className` (`h-10`, `sm:h-9`) — if a size is wrong, fix the scale. `default` is the legacy alias of `md` (~60 call sites); new code says `md`. **The corner is part of the scale too** — every control takes its radius from `controlSizes[size].radius`, so a `SegmentedGroup` track, an `Input` and a `Button` standing in a row share one shape; `SegmentedGroup`'s thumb and items take the concentric inner radius (`rounded-sm` = the track's radius less its own padding), and its items reclaim that padding as tap area with an `after` layer, because the scale puts the 44px touch height on the *track*. There are no capsule controls left in a field row — `Toggle`'s `pill` variant is a fill, not a shape. `Button`'s `xs`/`icon-xs` are deliberately off-scale dense chips — never put one in a row beside a field. The Liquid Glass nav layer (`GlassButton`, `GlassToggleGroup`) keeps its own chunkier scale; it never shares a row with a field.
- **Liquid Glass material (`GlassSurface` / `GlassNav` / `GlassButton` / `GlassToggleGroup`, from `@dimitrisafendras/liquid-glass`)** — only for the floating navigation/control layer (nav bars, floating toolbars, capsule controls), per Liquid Glass guidance. Never use the glass *material* for content surfaces, and never stack glass on glass. (`GlassScrollArea` is a content utility — a scroll viewport with edge fades + a frosted self-hiding scrollbar — not a glass material surface; use it for any in-card scroll region.)
- **Plain Tailwind + semantic HTML** — layout, typography, one-off decorative elements only. If it's reusable, promote it to a shared component (see "Design system first").
- **Color** — always use shadcn token classes (`bg-background`, `text-muted-foreground`, `bg-primary`, `border-border`, ...) so both themes and both palettes work correctly. Raw Tailwind palette classes (e.g. `bg-red-500`) are only for semantically fixed colors like success/warning/danger.
- **State** — zustand for anything shared across components/routes (theme, palette, checklist, simulator). Local `useState` for everything component-local. Don't add a new state library.
- **Charts** — chart.js via `react-chartjs-2` for any chart; pull theme-aware colors from the store's `dark` flag via `useChartColors` in `src/components/charts.tsx`.
- **Icons** — lucide-react only.
- **Units — SI only, no exceptions.** Every quantity the app shows or stores is metric: **ml** (volume), **g / kg** (mass), **cm** (length), **°C** (temperature), **min / h** (time). Never add an imperial unit — not as the primary value, not as a parenthetical conversion, not "for US readers". That means no `oz`, `fl oz`, `lb`, `inch`/`"`, `ft`, `°F`. This applies to i18n strings in **both** locales, `src/data.ts`, chart axes, input labels/placeholders, and `unit` props. There is no unit-preference setting and none should be added.
- **New dependencies** — check the shadcn registry for an existing component before adding a new npm UI package.

## Commands

```
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build — this is the verification gate; run it after any non-trivial change
npm run preview   # preview the production build
npm test          # Playwright end-to-end suite (chromium + mobile); starts the dev server itself
npm run test:ui   # the same suite in Playwright's watch UI

./scripts/dev-stack.sh up     # Docker + local Supabase, seeded (idempotent)
./scripts/dev-stack.sh test   # the same, then the whole suite incl. the signed-in specs
./scripts/dev-stack.sh reset  # wipe the local database, re-apply migrations + seed
```

Tests live in `tests/`; **`tests/README.md` is the test plan** — what each spec
covers, what is deliberately not covered, and the conventions for adding one
(seed state before `goto`, `hideOverlays` for the fixed banners, `openSettings`
because both navigations are in the DOM at every width).

### The local stack

`npm test` runs signed out, which is most of the app but not the half where its
worst bugs have lived. `tests/signed-in.spec.ts` covers that half and needs a
database: **`./scripts/dev-stack.sh test`** brings up Docker and a local
Supabase seeded from `supabase/seed.sql`, and points the dev server at it by
exporting `VITE_*` inline — Vite gives inline vars priority over `.env.local`,
so the hosted credentials on disk are never touched or overwritten. Without a
local stack those specs skip themselves, and the gate is *"is the URL
localhost"* rather than *"is Supabase configured"*, so they can never run
against the hosted project.

The fixture is two parents sharing a household and two children straddling the
first birthday — the age where the app changes what it measures. The stack
listens on **544xx**, not the Supabase defaults, because another local project
on this machine holds those; the offsets live in `supabase/config.toml` and are
read back with `supabase status -o env`, never re-typed.

`.claude/skills/dev-stack/SKILL.md` documents the rest, including how to tell a
load flake from a regression — this machine turns a 30-second suite into 45
minutes under load and fails a *different* handful of tests every run, always on
timeouts rather than assertions. `dev-stack.sh test` re-runs failures serially
and says which of the two it was.

## Deployment

- Hosted on **GitHub Pages** at `https://dimitrisafendras.github.io/early-development-architecture/`.
- Deploys automatically on every push to `main` via `.github/workflows/deploy.yml` (build → upload → deploy-pages).
- `vite.config.ts` sets `base: '/early-development-architecture/'` and the router gets `basename={import.meta.env.BASE_URL}` in `src/main.tsx` — keep both in sync if the repo is ever renamed.
- SPA deep links (e.g. `/design-system`) work via the `404.html` fallback the workflow copies from `index.html`.
