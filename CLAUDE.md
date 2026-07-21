# CLAUDE.md

Guidance for Claude Code sessions working in this repo.

## Project

**The Architecture of Early Development** — a React SPA with two routes:

- `/` — an evidence-based infant-development infographic
- `/design-system` — a Liquid Glass design system documentation page

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
| `src/pages/` | Route components (`Home.tsx`, `DesignSystem.tsx`) |
| `src/components/` | Shared app components — `Hero`, `NavBar`, `Footer`, `SectionHeader`, `charts.tsx` |
| `src/components/ui/` | Vendored shadcn primitives. These are **owned source, not a dependency** — edit them directly to extend variants/behavior |
| `src/sections/` | The 7 infographic sections rendered on `/` |
| `src/design-system/` | Design system: `tokens.ts` (typed design tokens), `components/` — `GlassSurface`, `GlassNav`, `GlassButton` (Liquid Glass material components) |
| `src/data.ts` | All infographic content/data |
| `src/store.ts` | zustand store — `dark` / `toggleTheme`, `palette` (`'blue' | 'red'`) / `setPalette`, latency simulator state, checklist state |

## Theming

Theming is a **dual axis**: theme (light/dark) × palette (soft blue "boy" / soft red "girl").

- `App.tsx` has an effect that reads the store and sets `data-theme`, the `.dark` class, and `data-palette` on `<html>`
- shadcn CSS variables live in `src/index.css`
- `[data-palette='blue']` / `[data-palette='red']` blocks in `src/index.css` override `--primary`, `--accent`, `--ring` per palette, each with light and dark values
- Tailwind's `dark:` variant is a custom variant (defined in `src/index.css`) that matches both `.dark` and `[data-theme='dark']`

When adding UI, always test both palettes × both themes (4 combinations).

## When to use which technology

- **shadcn primitives (`src/components/ui/*`)** — default for all standard UI: buttons, cards, form controls, overlays, etc. Never hand-roll a raw `<button>` or `<input>` when a primitive already exists.
- **Glass components (`src/design-system/components/*`)** — only for the floating navigation/control layer (nav bars, floating toolbars, capsule controls), per Liquid Glass guidance. Never use them for content surfaces, and never stack glass on glass.
- **Plain Tailwind + semantic HTML** — layout, typography, one-off decorative elements.
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

- Hosted on **Vercel**.
- `vercel.json` has a SPA fallback rewrite (`/(.*) → /index.html`), required for the `/design-system` deep link to work.
- Deploy via the Vercel MCP tool or the Vercel CLI. A production URL already exists for this project.
