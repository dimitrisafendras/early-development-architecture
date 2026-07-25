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
- `/design-system` — a Liquid Glass design system documentation page

The Learn topics are defined once in `src/sections/registry.tsx` (slug, module, `group`, icon, i18n label/blurb getters, section component). That registry drives the hub grid (grouped by theme via `group` / `groupOrder`), the routes, the nav links, and the pager. Topic content/data lives in `src/data.ts` + `src/i18n.ts` (en + el must stay in sync — `Messages = typeof en`).

Shared daily logic is hook-first: `useDailyChecklist` (checklist + streak + sync), `useTummyTracker`, `useBabies`, `useHousehold`, `useBabyAge` (age-band highlighting). Both the `/daily` widgets and the standalone sections/pages reuse these — don't duplicate the state.

## Stack

- **Vite + React 18 + TypeScript** (strict mode; `noUnusedLocals` / `noUnusedParameters` are on — unused imports fail `npm run build`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — CSS-first config lives in `src/index.css`; there is no `tailwind.config.*` file
- **shadcn/ui** (style `base-nova`, base-ui primitives) — components are vendored source in `src/components/ui/`, configured by `components.json`, added with `npx shadcn@latest add <name>`
  - `cn()` utility: `src/lib/utils.ts`
  - Path alias `@/` → `src/` (see `vite.config.ts` and the tsconfig files)
- **shadcn MCP server** configured in `.mcp.json` — use it to browse/search/install registry components
- **zustand** — single global store at `src/store.ts`
- **react-router-dom** — routing; `src/App.tsx` holds the `<Routes>`, pages live in `src/pages/`
- **chart.js + react-chartjs-2** — all charts go through `src/components/charts.tsx`
- **lucide-react** — all icons

## Structure

| Path | Purpose |
|---|---|
| `src/pages/` | Route components (`Day.tsx` = home split view, `Wiki.tsx` / `WikiTopic.tsx`, `Tracker.tsx`, `FeedLog.tsx`, `Baby.tsx`, `Family.tsx`, `Auth.tsx`, `DesignSystem.tsx`) |
| `src/components/` | Shared app components — `NavBar`, `Footer`, `SectionHeader`, `StatTile`, `AgeBadge`, `ProgressRing`, `WidgetPage`, `dayActivity`, `charts.tsx` |
| `src/components/ui/` | Vendored shadcn primitives. These are **owned source, not a dependency** — edit them directly to extend variants/behavior |
| `src/sections/` | The infographic topic sections (registry-driven, rendered on the Wiki topic pages) |
| `src/design-system/` | Design system: `tokens.ts` (typed design tokens), `ds.css` (glass material + `.ds-scroll-glass`), `components/` — `GlassSurface`, `GlassNav`, `GlassButton`, `GlassToggleGroup` (Liquid Glass material) and `GlassScrollArea` (content scroll utility) |
| `src/data.ts` | All infographic content/data |
| `src/store.ts` | zustand store — `dark` / `toggleTheme`, `palette` (`'blue' | 'red'`) / `setPalette`, latency simulator state, checklist state |

## Theming

Theming is a **dual axis**: theme (light/dark) × palette (soft blue "boy" / soft red "girl").

- `App.tsx` has an effect that reads the store and sets `data-theme`, the `.dark` class, and `data-palette` on `<html>`
- shadcn CSS variables live in `src/index.css`
- `[data-palette='blue']` / `[data-palette='red']` blocks in `src/index.css` override `--primary`, `--accent`, `--ring` per palette, each with light and dark values
- Tailwind's `dark:` variant is a custom variant (defined in `src/index.css`) that matches both `.dark` and `[data-theme='dark']`

When adding UI, always test both palettes × both themes (4 combinations).

## Widget page pattern (glance → input → detail)

**Every logging page is a widget page** — any page whose job is "check one thing, then record one thing": `/tracker`, `/feed`, `/baby`, and any new one. (`/daily` and `/routine` are dashboards, not widget pages.) A widget page always reads top-to-bottom in three tiers:

1. **glance — short info.** Where am I right now, in one screenful: a hero metric and/or a `WidgetStatGrid` of `StatTile`s. Read-only; no forms, history or charts.
2. **input — the one thing you came to do.** Start the timer, log the feed, add the measurement. Reachable without scrolling past reference material. The tier's eyebrow names the action, so the card inside carries **no title of its own**.
3. **detail — extensive info.** History lists, charts, guidance, profile editing and destructive actions. Everything you read rather than answer.

Build it with `WidgetPage` (`src/components/WidgetPage.tsx`), which takes the tiers as **slot props** (`glance` / `input` / `detail`) so the order can't be got wrong, and owns the shared page frame: max-width, aura glow, `SectionHeader`, tier eyebrows and divider. Never hand-roll that frame in a page.

- `toolbar` — full-width context switcher under the header (e.g. which baby).
- `aside` — small trailing header content (e.g. `AgeBadge`).
- `children` — **only** for states that precede the rhythm: loading skeletons, sign-in gating, first-run forms.
- Inside a tier: `WidgetStatGrid` (stat row), `WidgetCard` (titled block, optional `icon` / `meta` / `footer`), `WidgetSplit` (a list beside its chart).
- Tiers are opaque content surfaces (shadcn `Card`) — never the glass material.

Documented on `/design-system` under **Patterns** (`src/design-system/docs/PatternsSection.tsx`) — update that section when the pattern changes.

## When to use which technology

- **Design system first (respect the DS)** — always reach for an existing shared component before writing markup: shadcn primitives in `src/components/ui/*`, the Liquid Glass components in `src/design-system/components/*`, and the shared app components in `src/components/*` (`WidgetPage`, `SectionHeader`, `StatTile`, `AgeBadge`, `ProgressRing`, `GlassScrollArea`, charts, …). If a component almost fits but lacks a variant or behavior, **extend that component** (it's owned source) rather than hand-rolling a one-off. If a pattern is used on more than one screen (stat tiles, scroll regions, page headers, empty states), **extract it into a shared component** instead of duplicating it per page. Never reintroduce a bespoke version of something the DS already provides.
- **shadcn primitives (`src/components/ui/*`)** — default for all standard UI: buttons, cards, form controls, overlays, etc. Never hand-roll a raw `<button>` or `<input>` when a primitive already exists.
- **Liquid Glass material (`GlassSurface` / `GlassNav` / `GlassButton` / `GlassToggleGroup`)** — only for the floating navigation/control layer (nav bars, floating toolbars, capsule controls), per Liquid Glass guidance. Never use the glass *material* for content surfaces, and never stack glass on glass. (`GlassScrollArea` is a content utility — a scroll viewport with edge fades + a frosted self-hiding scrollbar — not a glass material surface; use it for any in-card scroll region.)
- **Plain Tailwind + semantic HTML** — layout, typography, one-off decorative elements only. If it's reusable, promote it to a shared component (see "Design system first").
- **Color** — always use shadcn token classes (`bg-background`, `text-muted-foreground`, `bg-primary`, `border-border`, ...) so both themes and both palettes work correctly. Raw Tailwind palette classes (e.g. `bg-red-500`) are only for semantically fixed colors like success/warning/danger.
- **State** — zustand for anything shared across components/routes (theme, palette, checklist, simulator). Local `useState` for everything component-local. Don't add a new state library.
- **Charts** — chart.js via `react-chartjs-2` for any chart; pull theme-aware colors from the store's `dark` flag via `useChartColors` in `src/components/charts.tsx`.
- **Icons** — lucide-react only.
- **New dependencies** — check the shadcn registry for an existing component before adding a new npm UI package.

## Commands

```
npm run dev      # Vite dev server
npm run build     # tsc -b && vite build — this is the verification gate; run it after any non-trivial change
npm run preview   # preview the production build
```

## Deployment

- Hosted on **GitHub Pages** at `https://dimitrisafendras.github.io/early-development-architecture/`.
- Deploys automatically on every push to `main` via `.github/workflows/deploy.yml` (build → upload → deploy-pages).
- `vite.config.ts` sets `base: '/early-development-architecture/'` and the router gets `basename={import.meta.env.BASE_URL}` in `src/main.tsx` — keep both in sync if the repo is ever renamed.
- SPA deep links (e.g. `/design-system`) work via the `404.html` fallback the workflow copies from `index.html`.
