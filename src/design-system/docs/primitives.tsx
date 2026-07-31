import * as React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** A documentation section with an anchor and a consistent heading block. */
export function DocSection({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id: string
  eyebrow: string
  title: string
  intro?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    // No width, gutter or centring here: the page renders inside `PageFrame`
    // like every other route, and the frame owns those. `scroll-mt` keeps a
    // hash-linked section clear of the floating nav below `xl`.
    <section id={id} className={cn('w-full scroll-mt-24 py-6 sm:py-8', className)}>
      <header className="mb-10 max-w-2xl">
        {/* 0.16em — the app-wide eyebrow tracking. This doc page was itself one of
            the twelve places that disagreed, at 0.18em. */}
        <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">{eyebrow}</p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>}
      </header>
      {children}
    </section>
  )
}

/** A small labelled sub-group inside a section. */
export function DocBlock({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-12 last:mb-0', className)}>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

/**
 * Opaque content card — the correct surface for prose/data (never glass).
 *
 * This is the app's real `Card`, not a look-alike. It used to be a hand-rolled
 * `rounded-2xl border border-border bg-card p-6`, which meant the page
 * documenting the design system showed an 18px-radius, bordered, 24px-padded
 * surface while every card in the actual app was 14px, ringed and 16px-padded.
 * Living documentation that contradicts the thing it documents is worse than
 * none, so `Panel` now *is* the component — it only adds the doc-specific
 * elevation and a slightly roomier interior via the Card's own spacing token.
 *
 * `p-0` still works for a table that must bleed to the panel's edge: `cn` lets
 * the caller's padding win over `CardContent`'s.
 */
export function Panel({
  children,
  className,
  flush,
  contentClassName,
}: {
  children: React.ReactNode
  /** Goes on the Card — grid spans, overflow, hover treatments. */
  className?: string
  /** Drop the interior padding, for a table or list that bleeds to the edge. */
  flush?: boolean
  /** Goes on the content wrapper — the layout of the children (flex, divide-y). */
  contentClassName?: string
}) {
  return (
    <Card
      className={cn(
        '[--card-spacing:--spacing(6)] shadow-[0_1px_2px_rgb(0_0_0/0.05),0_8px_24px_rgb(0_0_0/0.04)]',
        flush && 'py-0',
        className
      )}
    >
      <CardContent className={cn(flush && 'px-0', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

/** Do / Don't guidance pair. */
export function DoDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <span aria-hidden>✓</span> Do
        </p>
        <ul className="space-y-2 text-sm text-foreground/80">
          {dos.map((d) => (
            <li key={d} className="flex gap-2">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              {d}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
          <span aria-hidden>✕</span> Don't
        </p>
        <ul className="space-y-2 text-sm text-foreground/80">
          {donts.map((d) => (
            <li key={d} className="flex gap-2">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-500" />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Reads a live CSS custom property value off `:root` for display.
 *
 * It watches `<html>` for the attribute changes that can alter the value rather
 * than taking a caller-supplied dependency list. A dep list looked like it
 * worked and didn't: `App` applies `.dark` / `data-theme` / `data-palette` in
 * its own effect, and React runs child effects before parent ones, so a
 * theme-keyed dep re-ran this read *before* the class it was keyed to had been
 * applied — every card showed the previous theme's value until the next
 * unrelated render. Observing the attribute means the read happens after the
 * change lands, whatever caused it. `getComputedStyle` forces a style recalc,
 * so the value is current by the time it is read.
 */
export function useCssVar(cssVar: string) {
  const [value, setValue] = React.useState('')
  React.useEffect(() => {
    const root = document.documentElement
    const read = () => setValue(getComputedStyle(root).getPropertyValue(cssVar).trim())
    read()
    const observer = new MutationObserver(read)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-palette'],
    })
    return () => observer.disconnect()
  }, [cssVar])
  return value
}
