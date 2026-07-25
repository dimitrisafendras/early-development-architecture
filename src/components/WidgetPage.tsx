import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SectionHeader } from './SectionHeader'
import { useT } from '../i18n'

/**
 * The widget-page shell. Every tool page (`/tracker`, `/feed`, `/baby`, …) is a
 * widget page, and a widget page always reads top-to-bottom in three tiers:
 *
 *   1. **glance**  — short info. The answer to "where am I right now?" in one
 *      screenful: a hero metric and/or a row of `StatTile`s. No forms here.
 *   2. **input**   — the one thing you came to do: start the timer, log the
 *      feed, add the measurement. Directly reachable without scrolling past
 *      reference material.
 *   3. **detail**  — extensive info. History lists, charts, guidance, profile
 *      editing and destructive actions. Everything you read rather than answer.
 *
 * The tiers are slots rather than children so the order can't be got wrong: you
 * cannot render the input above the glance. `children` is the escape hatch for
 * pre-tier states only (loading skeletons, sign-in gating, first-run forms).
 */
export function WidgetPage({
  title,
  description,
  aside,
  toolbar,
  glance,
  input,
  inputLabel,
  detail,
  detailLabel,
  children,
}: {
  title: string
  description: string
  /** Trailing header content — a badge or small status, beside the title. */
  aside?: ReactNode
  /** Full-width context switcher under the header (e.g. which baby). */
  toolbar?: ReactNode
  /** Tier 1 — short info. */
  glance?: ReactNode
  /** Tier 2 — the input. */
  input?: ReactNode
  /** Overrides the default "Log" eyebrow over the input tier. */
  inputLabel?: string
  /** Tier 3 — extensive info. */
  detail?: ReactNode
  /** Overrides the default "Details" eyebrow over the detail tier. */
  detailLabel?: string
  /** Loading / empty / gated states, rendered instead of the tiers. */
  children?: ReactNode
}) {
  const t = useT()

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 page-px py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-8 -z-10 mx-auto h-56 max-w-2xl rounded-full bg-primary/15 opacity-60 blur-3xl"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title={title} description={description} className="mb-0" />
        {aside}
      </div>

      {toolbar}
      {children}

      {glance && <div className="flex flex-col gap-4">{glance}</div>}

      {input && (
        <section className="flex flex-col gap-3">
          <TierLabel>{inputLabel ?? t.widget.input}</TierLabel>
          {input}
        </section>
      )}

      {detail && (
        <section className="flex flex-col gap-4 border-t border-border/70 pt-8">
          <TierLabel>{detailLabel ?? t.widget.detail}</TierLabel>
          {detail}
        </section>
      )}
    </main>
  )
}

/** The eyebrow that opens a tier. */
function TierLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">{children}</p>
  )
}

/**
 * The stat row of a glance tier: two tiles per row on a phone, four across from
 * `lg`. Always holds `StatTile`s — nothing else.
 */
export function WidgetStatGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>{children}</div>
}

/**
 * A titled content card — the standard block inside an input or detail tier.
 * Pass a bare lucide icon; the card sizes and tints it.
 */
export function WidgetCard({
  icon,
  title,
  meta,
  footer,
  children,
  className,
  contentClassName,
}: {
  icon?: ReactNode
  title: ReactNode
  /** Small right-aligned counter/status beside the title. */
  meta?: ReactNode
  /** Summary line below the body, above a hairline rule. */
  footer?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card className={className}>
      <CardContent className={contentClassName}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            {icon && (
              <span aria-hidden className="text-primary [&_svg]:size-4">
                {icon}
              </span>
            )}
            {title}
          </p>
          {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
        </div>
        {children}
        {footer && <div className="mt-4 border-t border-border pt-3 text-sm">{footer}</div>}
      </CardContent>
    </Card>
  )
}

/** Two equal columns from `lg` — the usual shape for a list beside its chart. */
export function WidgetSplit({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2', className)}>{children}</div>
}
