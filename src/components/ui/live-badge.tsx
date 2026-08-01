import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

/**
 * A dot that reads as *live* rather than as a bullet.
 *
 * Two stacked circles: a solid core, and a halo that expands and fades out of
 * it. The halo is what carries the meaning — a static dot is punctuation, a
 * dot with an echo is a signal arriving. It is `aria-hidden` because it says
 * nothing a screen reader cannot get from the label beside it.
 *
 * Colour comes from `currentColor` by default, so the dot inherits whatever
 * text colour it sits in and needs no variant of its own; pass `color` when the
 * dot must take a value the surrounding text does not (an activity accent, say).
 *
 * The halo is dropped entirely under `prefers-reduced-motion` — a ping that
 * cannot animate is a stationary translucent ring around the dot, which just
 * looks like a rendering fault.
 */
export function LiveDot({
  color,
  className,
}: {
  /** Any CSS colour. Defaults to the inherited text colour. */
  color?: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      style={color ? { color } : undefined}
      className={cn('relative flex size-1.5 shrink-0', className)}
    >
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:hidden" />
      <span className="relative inline-flex size-full rounded-full bg-current" />
    </span>
  )
}

/**
 * "This is the one that is live, right now."
 *
 * A plain `<Badge>` saying *In use now* is a label: the same shape the app uses
 * for counts, tags and states, so the one pill on the page that reports a
 * *live* fact looked like every static one. This is the same pill with the
 * state made visible — a pulsing dot, an inset ring so it reads as lit from
 * within, and an optional trailing `detail` for the value the claim rests on
 * (the child's age, the elapsed time), set in tabular numerals at reduced
 * emphasis so it never competes with the label.
 *
 * Reach for it only where the fact really is live — one per view, at most.
 * Its whole power is that nothing else on the screen moves; a second one and
 * both stop meaning anything.
 */
export function LiveBadge({
  children,
  detail,
  color,
  className,
}: {
  children: ReactNode
  /** The value behind the claim — an age, a duration. Set in tabular numerals. */
  detail?: ReactNode
  /** Overrides the dot colour only; the pill keeps its primary tint. */
  color?: string
  className?: string
}) {
  return (
    <Badge
      variant="soft"
      className={cn(
        'gap-2 py-1 pl-2 text-[11px] font-semibold tracking-wider uppercase',
        'ring-1 ring-primary/20 ring-inset',
        className,
      )}
    >
      <LiveDot color={color} />
      {children}
      {detail != null && (
        <span className="font-medium tracking-normal normal-case opacity-70 tabular-nums">
          {detail}
        </span>
      )}
    </Badge>
  )
}
