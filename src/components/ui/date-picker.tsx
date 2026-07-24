import * as React from 'react'
import { CalendarDays } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatDateKey } from '@/lib/dates'
import { Calendar, type CalendarLabels } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/**
 * A field-shaped trigger that opens the `Calendar` in a popover — the
 * replacement for `<input type="date">`, whose control the browser owns and
 * refuses to theme.
 *
 * The trigger shows the date the way the locale writes it, not the ISO key
 * underneath, and the popover closes as soon as a day is picked.
 */

/**  Matches `Input`'s mobile-first sizing: a real touch target on phones,
   the compact desktop height from `sm` up.
 */
const sizes = {
  sm: 'h-9 text-sm sm:h-7',
  default: 'h-11 text-base sm:h-8 md:text-sm',
  lg: 'h-12 text-base sm:h-10',
} as const

export interface DatePickerProps {
  /** Selected day as a `YYYY-MM-DD` key. */
  value?: string | null
  onValueChange?: (value: string) => void
  min?: string
  max?: string
  /** BCP-47 tag for the trigger text and the calendar. */
  locale?: string
  /** Shown when nothing is selected yet. */
  placeholder?: string
  labels?: Partial<CalendarLabels>
  size?: keyof typeof sizes
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

function DatePicker({
  value,
  onValueChange,
  min,
  max,
  locale,
  placeholder = 'Pick a date',
  labels,
  size = 'default',
  id,
  name,
  disabled,
  invalid,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        data-slot="date-picker-trigger"
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
        <span className={cn('truncate tabular-nums', !value && 'text-muted-foreground')}>
          {value ? formatDateKey(value, locale) : placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <Calendar
          autoFocus
          value={value}
          onValueChange={(next) => {
            onValueChange?.(next)
            setOpen(false)
          }}
          min={min}
          max={max}
          locale={locale}
          labels={labels}
        />
      </PopoverContent>
      {/* Keeps the value submittable when the picker sits inside a real form. */}
      {name && <input type="hidden" name={name} value={value ?? ''} />}
    </Popover>
  )
}

export { DatePicker }
