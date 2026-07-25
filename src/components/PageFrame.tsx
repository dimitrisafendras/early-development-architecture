import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SectionHeader } from './SectionHeader'

/**
 * The one canonical page frame. Every route renders exactly one `PageFrame` as
 * its `<main>` — it owns the max-width, the page gutter, the vertical padding,
 * the gap between blocks, and the header row (title + description + trailing
 * `aside`).
 *
 * **Why it exists.** An alignment audit found that every route hand-rolled its
 * own `<main>`: widths ranged from `max-w-3xl` to `max-w-7xl`, padding from
 * `py-10` to `py-12`, gaps from `gap-6` to `gap-10`, and half the pages wrote
 * their own `<h1>`/`<header>` instead of using `SectionHeader`. The left edge of
 * titles and cards therefore jumped by up to 256px as you moved between routes,
 * and no two page titles sat at the same Y. Centralising the frame here is the
 * structural fix: change the frame once and every route moves together.
 *
 * **No page may hand-roll the frame again.** If a page needs something the frame
 * doesn't do, add the capability here (this is owned source) rather than writing
 * a bespoke `<main>`. The only sanctioned per-page deviation is a width override
 * through `className` — used by `/signin` and `/signup`, which are deliberately
 * one narrow card wide. Everything else (`max-w-6xl`, `page-px`,
 * `py-6 sm:py-10`, `gap-6 sm:gap-8`) is the shared contract.
 *
 * There is deliberately **no aura/glow inside the frame**: `AuroraBackground` is
 * mounted once app-wide in `Layout`, and a per-page `blur-3xl` would double up
 * on it.
 *
 * Composed shells build on top of this rather than beside it — see `WidgetPage`,
 * which adds the glance/input/detail tiers and delegates the frame to here.
 */
export function PageFrame({
  title,
  description,
  aside,
  toolbar,
  fill,
  className,
  children,
}: {
  title: string
  description: string
  /** Trailing header content — a badge, chip or small status, beside the title. */
  aside?: ReactNode
  /** Full-width row directly under the header: a context switcher, a
   *  breadcrumb, a back-link. Anything that must not push the title down. */
  toolbar?: ReactNode
  /** For a dashboard that fills the scroll column instead of scrolling it: lets
   *  the frame take the column's height and its content shrink inside it, so a
   *  `flex-1 min-h-0` child can scroll internally (the Day page). Without this
   *  a page had to hand-roll its own `<main>` to get `min-h-0 flex-1` — which is
   *  exactly how the frame drift this component exists to prevent crept back in. */
  fill?: boolean
  /** Width override for a deliberate exception (e.g. the auth pages' single
   *  narrow card). `cn` lets the caller's `max-w-*` win over `max-w-6xl`. */
  className?: string
  children?: ReactNode
}) {
  return (
    <main
      className={cn(
        // Vertical rhythm steps down on a phone and is identical across routes at
        // both steps: 24px padding / 24px block gap below `sm`, 40px / 32px from
        // `sm` up. Day used to buy its mobile room with a private
        // `py-5 sm:py-10`, which is what put its title 20px above everyone else's.
        'relative mx-auto flex w-full max-w-6xl flex-col gap-6 page-px py-6 sm:gap-8 sm:py-10',
        fill && 'min-h-0 flex-1',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title={title} description={description} className="mb-0" />
        {aside}
      </div>

      {toolbar}
      {children}
    </main>
  )
}
