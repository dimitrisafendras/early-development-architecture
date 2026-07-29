import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SectionHeader } from './SectionHeader'
import { HeaderStatus } from './HeaderStatus'

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
  aside,
  toolbar,
  fill,
  className,
  children,
}: {
  title: string
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
        'relative mx-auto flex w-full max-w-6xl flex-col gap-5 page-px py-4 sm:gap-6 sm:py-5',
        fill && 'min-h-0 flex-1',
        className,
      )}
    >
      {/* The header band: the title and the live readings on one row, closed by a
          hairline that fades out to the right. The rule is what turns a floating
          title into a header — it takes the palette accent at its left edge, so it
          re-tints with the theme, and it is drawn here rather than in
          `SectionHeader` because only the frame knows the page's width.
          `gap-1.5`: the rule belongs to the title row and sits 6px under it. The
          air above and below the band is the `<main>` padding, nothing else — the
          earlier version stacked a header gap on top of the h1's own line-height
          and the title's bottom margin, three sources of space for one gap, which
          is what made the band feel half-empty. */}
      <header className="flex flex-col gap-1.5">
        {/* Title and readings share one line, on one baseline. `items-baseline` is
            the alignment that actually holds here: the readings are inline
            label+value pairs (see `HeaderStatus`), so their text sits on the same
            baseline as the `h1` at any font size — `items-end` and `items-center`
            both left the title visibly off, because they align boxes rather than
            type. They stack only when the viewport is too narrow for both. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5">
          <SectionHeader title={title} className="mb-0" />
          {/* `items-baseline` here too: the readings and any trailing `aside` sit
              on the title's baseline rather than being centred against its box. */}
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <HeaderStatus />
            {aside}
          </div>
        </div>
        <div
          aria-hidden
          className="h-px w-full bg-gradient-to-r from-primary/45 via-border to-transparent"
        />
        {toolbar}
      </header>

      {children}
    </main>
  )
}
