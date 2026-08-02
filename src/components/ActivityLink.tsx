import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dayActivityMeta } from './dayActivity'
import type { DayActivity } from '../data'

/**
 * A link out of a moment, in that moment's own colour.
 *
 * **One chip, three places.** The day timeline's "Read about Sleep" was a
 * bordered chip in the activity's hue; the dashboard's "Open feed log" and "Open
 * tummy log" — links out of the *same* moment, one card over — were underlined
 * primary text. So the two halves of one screen offered the same kind of
 * departure in two different shapes, and the tool links belonged to the app's
 * accent rather than to the activity the card was about.
 *
 * The hue comes from `dayActivityMeta`, and from the pair the design system
 * tunes for text (`text`, 700 light / 400 dark) rather than the 500 the rails
 * and edges are drawn in — behind its own 8% tint the 500 measures as low as
 * 1.82:1. The border and fill do take the 500, because a line is a line.
 *
 * `touch` is the difference between the two uses: the dashboard links stand on
 * their own and take the 44px minimum on phones, while the timeline's sits in a
 * fixed-height cell and must stay at its own 28px.
 */
export function ActivityLink({
  to,
  activity,
  icon,
  touch = false,
  className,
  children,
}: {
  to: string
  activity: DayActivity
  /** Leading glyph — the destination's own, not a generic one. */
  icon?: ReactNode
  /** Take the 44px touch minimum on phones. For a link that stands alone. */
  touch?: boolean
  className?: string
  children: ReactNode
}) {
  const meta = dayActivityMeta[activity]
  return (
    <Link
      to={to}
      style={{ borderColor: `${meta.accent}59`, backgroundColor: `${meta.accent}14` }}
      className={cn(
        // `w-fit`, because both callers put it in a `flex-col` whose default
        // `stretch` would run the chip the whole width of the card — a chip is
        // the width of what it says. `max-w-full` is the other half, so a long
        // topic name truncates instead of pushing the card out of its column.
        'group/link flex w-fit max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[13px] font-semibold transition-shadow hover:shadow-sm',
        touch && 'min-h-11 px-3 text-sm sm:min-h-0 sm:py-1.5',
        meta.text,
        className,
      )}
    >
      {icon}
      {/* The label truncates, the chip does not. `truncate` on the chip itself
          does nothing — it is a flex container, so its text is an anonymous flex
          item that overflow cannot clip — and `min-w-0` is the other half, since
          a flex item's automatic minimum is its content. */}
      <span className="min-w-0 truncate">{children}</span>
      <ArrowRight className="size-3 shrink-0 transition-transform group-hover/link:translate-x-0.5" />
    </Link>
  )
}
