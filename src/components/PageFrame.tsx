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
 * one narrow card wide. Everything else (`max-w-6xl`, `page-px`, `py-10`,
 * `gap-8`) is the shared contract.
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
  compact,
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
  /** Give the page's content the room on a phone — see `SectionHeader`. */
  compact?: boolean
  /** Width override for a deliberate exception (e.g. the auth pages' single
   *  narrow card). `cn` lets the caller's `max-w-*` win over `max-w-6xl`. */
  className?: string
  children?: ReactNode
}) {
  return (
    <main
      className={cn(
        'relative mx-auto flex w-full max-w-6xl flex-col gap-8 page-px py-10',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title={title}
          description={description}
          compact={compact}
          className="mb-0"
        />
        {aside}
      </div>

      {toolbar}
      {children}
    </main>
  )
}
