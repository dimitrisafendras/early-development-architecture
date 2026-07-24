import * as React from 'react'
import { CalendarClock } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  formatDateTimeKey,
  joinDateTimeKey,
  nowDateTimeKey,
  shiftDateTimeKey,
  splitDateTimeKey,
} from '@/lib/dates'
import { Calendar, type CalendarLabels } from '@/components/ui/calendar'
import { TimeColumns, type TimeLabels } from '@/components/ui/time-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/**
 * One field for a moment in time, replacing `<input type="datetime-local">`.
 *
 * The offsets come first because they answer the question almost every entry
 * asks — this happened now, or a little while ago — without touching the
 * calendar or the columns at all. Those stay below for the entry you are
 * writing up hours later.
 *
 * Values are `YYYY-MM-DDTHH:MM`, the shape the native input produced, so the
 * surrounding form keeps working unchanged.
 */

export interface DateTimeLabels extends CalendarLabels, TimeLabels {
  /** Relative offsets, with `{n}` standing in for the amount. */
  minutesAgo: string
  hourAgo: string
  pickDateTime: string
}

const defaultLabels: Pick<DateTimeLabels, 'minutesAgo' | 'hourAgo' | 'pickDateTime'> = {
  minutesAgo: '−{n} min',
  hourAgo: '−1 h',
  pickDateTime: 'Pick a date and time',
}

const sizes = {
  sm: 'h-8 text-sm',
  default: 'h-9 text-base md:text-sm',
  lg: 'h-11 text-base',
} as const

export interface DateTimePickerProps {
  /** Selected moment as `YYYY-MM-DDTHH:MM`. */
  value?: string | null
  onValueChange?: (value: string) => void
  /** Latest selectable day as a `YYYY-MM-DD` key. */
  maxDate?: string
  minDate?: string
  minuteStep?: number
  locale?: string
  labels?: Partial<DateTimeLabels>
  placeholder?: string
  size?: keyof typeof sizes
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

function DateTimePicker({
  value,
  onValueChange,
  maxDate,
  minDate,
  minuteStep,
  locale,
  labels: labelOverrides,
  placeholder,
  size = 'default',
  id,
  name,
  disabled,
  invalid,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const labels = { ...defaultLabels, ...labelOverrides }
  const parts = splitDateTimeKey(value)

  /** Offsets are measured from now, not from the current value. */
  const offsets: { label: string; minutes: number }[] = [
    { label: labels.now ?? 'Now', minutes: 0 },
    { label: labels.minutesAgo.replace('{n}', '15'), minutes: -15 },
    { label: labels.minutesAgo.replace('{n}', '30'), minutes: -30 },
    { label: labels.hourAgo, minutes: -60 },
  ]

  function commitOffset(minutes: number) {
    const from = nowDateTimeKey()
    onValueChange?.(minutes === 0 ? from : shiftDateTimeKey(from, minutes))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        data-slot="date-time-picker-trigger"
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left transition-colors',
          'hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:bg-input/50 disabled:opacity-50',
          'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
          'dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          sizes[size],
          className,
        )}
      >
        <span className={cn('truncate tabular-nums', !parts && 'text-muted-foreground')}>
          {parts
            ? formatDateTimeKey(value, locale, labels.today)
            : (placeholder ?? labels.pickDateTime)}
        </span>
        <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1.5rem)] p-3">
        <div className="flex flex-wrap gap-1.5">
          {offsets.map((o) => (
            <button
              key={o.minutes}
              type="button"
              onClick={() => commitOffset(o.minutes)}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-start gap-4 border-t border-border pt-3">
          {/* No Today / Yesterday here — the offsets above already cover it. */}
          <Calendar
            hideQuickPicks
            value={parts?.date}
            onValueChange={(date) =>
              onValueChange?.(joinDateTimeKey(date, parts?.time ?? nowDateTimeKey().split('T')[1]))
            }
            min={minDate}
            max={maxDate}
            locale={locale}
            labels={labelOverrides}
          />
          <TimeColumns
            hideQuickPick
            value={parts?.time}
            onValueChange={(time) =>
              onValueChange?.(joinDateTimeKey(parts?.date ?? nowDateTimeKey().split('T')[0], time))
            }
            minuteStep={minuteStep}
            locale={locale}
            labels={labelOverrides}
          />
        </div>
      </PopoverContent>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
    </Popover>
  )
}

export { DateTimePicker }
