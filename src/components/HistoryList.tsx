import type { ReactNode } from 'react'
import { GlassScrollArea } from '@dimitrisafendras/liquid-glass'
import { cn } from '@/lib/utils'
import { Eyebrow } from './Eyebrow'
import { todayKey } from '../lib/schedule'
import { formatDateKey, useDateLocale } from '../lib/dates'
import { useT } from '../i18n'

/**
 * **The one history list.**
 *
 * Every logging page ends in the same thing: what you have recorded, newest
 * first, grouped by day and capped so the card does not grow with the log. The
 * three pages had three answers to that. The tracker grouped by day and scrolled
 * inside a fixed height; the sleep log and the feed log each showed *today only*
 * and grew with it — so a night logged at 06:00 vanished from the page the
 * moment the date rolled over, and a newborn's eight feeds pushed the chart and
 * the guidance off the bottom of a phone.
 *
 * Today first, then yesterday, then the date. The day heading is the label that
 * makes a bare `09:15` mean something once the list runs past midnight, which is
 * exactly where both of the other two stopped.
 *
 * **The rows stay the caller's.** A tummy session, a sleep and a feed are three
 * different facts with three different edit forms; what they share is the shape
 * of the list around them, and that is all this owns.
 */
export function HistoryList<T>({
  id,
  items,
  at,
  row,
  empty,
  className,
}: {
  /** Anchor for tests and deep links; goes on the scrolling content. */
  id?: string
  items: T[]
  /**
   * The instant that decides which day a row files under.
   *
   * For a sleep this is the *start*: a night running 21:00–06:30 belongs to the
   * day it began, or every family would read as sleeping half as much as they
   * do, twice. See `useSleepLog`.
   */
  at: (item: T) => string
  /** One `<li>` per item. */
  row: (item: T) => ReactNode
  /** Shown instead of the list when there is nothing yet. */
  empty: string
  /** Overrides the height cap. Reach for this only with a reason. */
  className?: string
}) {
  const t = useT()
  const locale = useDateLocale()

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>
  }

  // Grouped in one pass over a newest-first sort, so the days come out newest
  // first too without a second comparison.
  const days: [string, T[]][] = []
  for (const item of [...items].sort((a, b) => at(b).localeCompare(at(a)))) {
    const key = todayKey(new Date(at(item)))
    const group = days.find(([k]) => k === key)
    if (group) group[1].push(item)
    else days.push([key, [item]])
  }

  const today = todayKey()
  const yesterday = todayKey(new Date(Date.now() - 86_400_000))
  const dayLabel = (key: string) =>
    key === today
      ? t.common.today
      : key === yesterday
        ? t.common.yesterday
        : formatDateKey(key, locale, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    // Capped and scrolled rather than grown: the history is the last tier of a
    // widget page, and a card that grows with the log pushes everything under it
    // — the chart, the guidance — off the bottom of a phone. `GlassScrollArea`
    // because it is this app's scroll region: edge fades that say there is more,
    // and a scrollbar that hides itself.
    <GlassScrollArea className={cn('max-h-[18rem]', className)}>
      <div id={id} className="space-y-4 pr-1">
        {days.map(([key, list]) => (
          <div key={key}>
            <Eyebrow as="p" tone="muted" className="mb-1">
              {dayLabel(key)}
            </Eyebrow>
            <ul className="divide-y divide-border">{list.map(row)}</ul>
          </div>
        ))}
      </div>
    </GlassScrollArea>
  )
}
