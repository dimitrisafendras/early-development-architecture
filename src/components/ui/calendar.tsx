import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { parseDateKey, shiftDateKey, toDateKey } from '@/lib/dates'

/**
 * Month-grid date picker.
 *
 * Values are `YYYY-MM-DD` keys, the same shape the rest of the app stores, so
 * nothing round-trips through a timezone. Month and weekday names come from
 * `Intl`, and the week starts on whichever day the locale says it does.
 *
 * The grid is always six weeks tall so the panel never changes height between
 * months, and the footer carries the two picks that cover almost every entry:
 * today and yesterday.
 */

export interface CalendarLabels {
  previousMonth: string
  nextMonth: string
  today: string
  yesterday: string
}

const defaultLabels: CalendarLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  today: 'Today',
  yesterday: 'Yesterday',
}

export interface CalendarProps {
  /** Selected day as a `YYYY-MM-DD` key. */
  value?: string | null
  onValueChange?: (value: string) => void
  /** Earliest and latest selectable day, also `YYYY-MM-DD`. */
  min?: string
  max?: string
  /** BCP-47 tag for month, weekday and day-name formatting. */
  locale?: string
  labels?: Partial<CalendarLabels>
  /** Hides the Today / Yesterday footer. */
  hideQuickPicks?: boolean
  /** Moves keyboard focus into the grid on mount. */
  autoFocus?: boolean
  className?: string
}

function clampKey(key: string, min?: string, max?: string) {
  if (min && key < min) return min
  if (max && key > max) return max
  return key
}

/** First day of the locale's week as a JS day index (0 = Sunday). */
function localeWeekStart(locale?: string): number {
  try {
    const LocaleCtor = (Intl as unknown as {
      Locale?: new (tag: string) => {
        getWeekInfo?: () => { firstDay: number }
        weekInfo?: { firstDay: number }
      }
    }).Locale
    if (!LocaleCtor) return 1
    const info = new LocaleCtor(locale ?? navigator.language)
    const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay
    // `Intl` counts Monday as 1 through Sunday as 7.
    if (typeof firstDay === 'number') return firstDay % 7
  } catch {
    /* Older engines: fall through to Monday. */
  }
  return 1
}

/** The six-week window covering `cursor`'s month, starting on `weekStart`. */
function monthGrid(cursor: Date, weekStart: number): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12)
  const start = new Date(first)
  start.setDate(first.getDate() - ((first.getDay() - weekStart + 7) % 7))
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

function Calendar({
  value,
  onValueChange,
  min,
  max,
  locale,
  labels: labelOverrides,
  hideQuickPicks,
  autoFocus,
  className,
}: CalendarProps) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const today = toDateKey(new Date())
  const gridRef = React.useRef<HTMLDivElement>(null)
  // Set whenever navigation came from the keyboard, so focus only moves when
  // the user is actually driving the grid with the arrow keys.
  const moveFocus = React.useRef(Boolean(autoFocus))

  // The browsing cursor doubles as the roving-tabindex target.
  const [cursor, setCursor] = React.useState(() => clampKey(value || today, min, max))
  const cursorDate = parseDateKey(cursor) ?? new Date()

  // Follow the selection when it changes from outside (a quick pick, a reset).
  React.useEffect(() => {
    if (value) setCursor(value)
  }, [value])

  React.useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    // `preventScroll` matters inside the popover: the portal renders at the top
    // of the document for a frame before the positioner places it, and a
    // scrolling focus would drag the whole page up with it.
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${cursor}"]`)
      ?.focus({ preventScroll: true })
  }, [cursor])

  const weekStart = React.useMemo(() => localeWeekStart(locale), [locale])
  const monthLabel = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(cursorDate),
    [locale, cursor], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const dayName = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    [locale],
  )
  const weekdays = React.useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    // 2024-01-01 was a Monday, so it anchors the weekday cycle.
    return Array.from({ length: 7 }, (_, i) =>
      format.format(new Date(2024, 0, 1 + ((i + weekStart + 6) % 7))),
    )
  }, [locale, weekStart])

  const days = React.useMemo(() => monthGrid(cursorDate, weekStart), [cursor, weekStart]) // eslint-disable-line react-hooks/exhaustive-deps
  const weeks = React.useMemo(
    () => Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7)),
    [days],
  )

  const outOfRange = (key: string) => Boolean((min && key < min) || (max && key > max))

  function goTo(key: string, fromKeyboard = false) {
    moveFocus.current = fromKeyboard
    setCursor(clampKey(key, min, max))
  }

  function select(key: string) {
    if (outOfRange(key)) return
    setCursor(key)
    onValueChange?.(key)
  }

  /** Same day-of-month in a neighbouring month, clamped to that month's length. */
  function shiftMonth(key: string, months: number) {
    const date = parseDateKey(key)
    if (!date) return key
    const target = new Date(date.getFullYear(), date.getMonth() + months, 1, 12)
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0, 12).getDate()
    target.setDate(Math.min(date.getDate(), lastDay))
    return toDateKey(target)
  }

  // A month is unreachable when every one of its days sits outside the range.
  const prevMonthKey = shiftMonth(cursor, -1)
  const nextMonthKey = shiftMonth(cursor, 1)
  const prevDisabled = Boolean(min && lastDayOfMonth(prevMonthKey) < min)
  const nextDisabled = Boolean(max && firstDayOfMonth(nextMonthKey) > max)

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }
    if (e.key in steps) {
      e.preventDefault()
      goTo(shiftDateKey(cursor, steps[e.key]), true)
      return
    }
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      goTo(shiftMonth(cursor, e.key === 'PageUp' ? -1 : 1), true)
      return
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const date = parseDateKey(cursor)
      if (!date) return
      const offset = (date.getDay() - weekStart + 7) % 7
      goTo(shiftDateKey(cursor, e.key === 'Home' ? -offset : 6 - offset), true)
    }
  }

  const navButton =
    'flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30'

  const quickPick =
    'rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40'

  const yesterday = shiftDateKey(today, -1)

  return (
    <div data-slot="calendar" className={cn('w-fit select-none', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={labels.previousMonth}
          disabled={prevDisabled}
          onClick={() => goTo(prevMonthKey)}
          className={navButton}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span aria-live="polite" className="font-heading text-sm font-semibold text-foreground capitalize">
          {monthLabel}
        </span>
        <button
          type="button"
          aria-label={labels.nextMonth}
          disabled={nextDisabled}
          onClick={() => goTo(nextMonthKey)}
          className={navButton}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div ref={gridRef} role="grid" aria-label={monthLabel} onKeyDown={onKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {weekdays.map((label) => (
            <div
              key={label}
              role="columnheader"
              aria-label={label}
              className="flex h-7 items-center justify-center text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
            >
              {label.slice(0, 2)}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div role="row" key={toDateKey(week[0])} className="grid grid-cols-7">
            {week.map((day) => {
              const key = toDateKey(day)
              const selected = key === value
              const disabled = outOfRange(key)
              return (
                <div role="gridcell" aria-selected={selected} key={key} className="flex justify-center p-0.5">
                  <button
                    type="button"
                    data-day={key}
                    tabIndex={key === cursor ? 0 : -1}
                    disabled={disabled}
                    aria-label={dayName.format(day)}
                    aria-current={key === today ? 'date' : undefined}
                    onClick={() => select(key)}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors',
                      'hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                      day.getMonth() !== cursorDate.getMonth() && 'text-muted-foreground/40',
                      key === today && !selected && 'font-semibold text-primary ring-1 ring-primary/45 ring-inset',
                      selected && 'bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground',
                      disabled && 'pointer-events-none opacity-30',
                    )}
                  >
                    {day.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {!hideQuickPicks && (
        <div className="mt-2 flex justify-center gap-2 border-t border-border pt-2.5">
          <button type="button" className={quickPick} disabled={outOfRange(today)} onClick={() => select(today)}>
            {labels.today}
          </button>
          <button type="button" className={quickPick} disabled={outOfRange(yesterday)} onClick={() => select(yesterday)}>
            {labels.yesterday}
          </button>
        </div>
      )}
    </div>
  )
}

function firstDayOfMonth(key: string) {
  return `${key.slice(0, 7)}-01`
}

function lastDayOfMonth(key: string) {
  const date = parseDateKey(key)
  if (!date) return key
  return toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0, 12))
}

export { Calendar }
