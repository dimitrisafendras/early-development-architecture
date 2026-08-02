import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Eyebrow } from './Eyebrow'
import { IconChip } from './IconChip'

/**
 * A compact metric tile: a tinted icon chip, an eyebrow label, and a big value
 * with an optional unit. Shared across the tracker/feed/baby dashboards so every
 * stat reads as one system. Lifts and glows a touch on hover.
 *
 * Three things were fixed here during the alignment audit, all of them invisible
 * in the source and visible on screen:
 *
 * 1. `border-border/70` did nothing. `Card` has no `border` utility — its edge is
 *    `ring-1 ring-foreground/10` — and Tailwind v4 zeroes border-width, so the
 *    "lighter edge than a normal card" this intended never rendered. Dropped, so
 *    the tile now honestly shares the Card edge.
 * 2. `CardContent` carried `py-4`, which *adds* to the `py-4` `Card` already
 *    applies — 32px where every other surface has 16px. Dropped.
 * 3. The label was `text-xs uppercase tracking-wider` with no weight, i.e. the
 *    only `font-normal` eyebrow in the app. It is now the shared `Eyebrow`.
 *
 * The chip sizes its own icon, so call sites pass a bare lucide element: one
 * forgotten `className="size-4"` used to render a 24px icon in a 28px chip.
 */
export function StatTile({
  icon,
  label,
  value,
  unit,
  className,
}: {
  /** Bare lucide icon — the chip sizes it. */
  icon: ReactNode
  label: string
  value: string
  unit?: string
  className?: string
}) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden bg-gradient-to-br from-card to-muted/30 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-16px] hover:shadow-primary/40',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <CardContent className="relative">
        {/* **The label wraps; it does not truncate.** Four tiles across a 390px
            phone leave each one about 80px of label, which is enough for "TODAY"
            and nothing else — in Greek the whole glance tier read "ΣΥΝΟΛΟ ΣΉ…",
            "ΣΤΌΧΟ…", "ΣΕΡΊ…", four tiles saying nothing. A wrapped label costs a
            line of height that the grid gives to every tile equally; a clipped
            one costs the tile its meaning.

            Still `items-center`: two lines of this label are 30px against the
            chip's 28, so centred and top-aligned are the same thing when it
            wraps — and centred is the only right answer when it does not. */}
        <div className="flex items-center gap-2">
          <IconChip size="sm">{icon}</IconChip>
          <Eyebrow as="span" tone="muted" className="min-w-0 leading-tight text-balance">
            {label}
          </Eyebrow>
        </div>
        <div className="mt-2 truncate font-heading text-2xl font-semibold text-foreground">
          {value}
          {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
