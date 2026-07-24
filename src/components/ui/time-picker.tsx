import * as React from 'react'
import { Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatTimeKey, parseTimeKey, toTimeKey, usesTwelveHourClock } from '@/lib/dates'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/**
 * Two scroll columns — hours, then minutes — instead of the browser's own
 * time control, which no stylesheet can reach.
 *
 * Minutes are listed on a coarse grid (every five by default) because that is
 * the precision anyone actually reports a feed or a nap in. A value that sits
 * off the grid still appears in the list rather than being rounded away.
 */

export interface TimeLabels {
  hours: string
  minutes: string
  now: string
  pickTime: string
}

const defaultLabels: TimeLabels = {
  hours: 'Hours',
  minutes: 'Minutes',
  now: 'Now',
  pickTime: 'Pick a time',
}

export interface TimeColumnsProps {
  /** Selected time as `HH:MM`. */
  value?: string | null
  onValueChange?: (value: string) => void
  /** Spacing of the minute list. */
  minuteStep?: number
  locale?: string
  labels?: Partial<TimeLabels>
  /** Hides the Now footer. */
  hideQuickPick?: boolean
  className?: string
}

/** One scrollable column of options with a roving tab stop. */
function Column({
  label,
  options,
  value,
  onSelect,
  format,
}: {
  label: string
  options: number[]
  value: number
  onSelect: (n: number) => void
  format: (n: number) => string
}) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const moveFocus = React.useRef(false)

  // Centre the selection without `scrollIntoView`, which would scroll the whole
  // page while the popover portal is still waiting to be positioned.
  React.useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[data-selected="true"]')
    if (!list || !active) return
    list.scrollTop = active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2
    // Only on mount: later selections come from a click, which needs no scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-value="${value}"]`)
      ?.focus({ preventScroll: true })
  }, [value])

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const index = options.indexOf(value)
    let next = index
    if (e.key === 'ArrowDown') next = Math.min(options.length - 1, index + 1)
    else if (e.key === 'ArrowUp') next = Math.max(0, index - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = options.length - 1
    else return
    e.preventDefault()
    moveFocus.current = true
    onSelect(options[next])
  }

  return (
    <div className="flex w-20 shrink-0 flex-col">
      <p className="mb-1.5 px-1 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </p>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="h-40 overflow-y-auto overscroll-contain rounded-lg border border-border p-1 sm:h-52"
      >
        {options.map((n) => {
          const selected = n === value
          return (
            <button
              key={n}
              type="button"
              role="option"
              aria-selected={selected}
              data-value={n}
              data-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(n)}
              className={cn(
                'w-full rounded-md px-3 py-1.5 text-sm tabular-nums transition-colors',
                'hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                selected && 'bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              )}
            >
              {format(n)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TimeColumns({
  value,
  onValueChange,
  minuteStep = 5,
  locale,
  labels: labelOverrides,
  hideQuickPick,
  className,
}: TimeColumnsProps) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const [hour, minute] = parseTimeKey(value) ?? parseTimeKey(nowTime()) ?? [0, 0]

  const hourLabel = React.useMemo(() => {
    if (!usesTwelveHourClock(locale)) return (h: number) => String(h).padStart(2, '0')
    const format = new Intl.DateTimeFormat(locale, { hour: 'numeric' })
    return (h: number) => format.format(new Date(2000, 0, 1, h))
  }, [locale])

  const minutes = React.useMemo(() => {
    const grid = []
    for (let m = 0; m < 60; m += minuteStep) grid.push(m)
    // Keep an off-grid selection visible instead of silently rounding it.
    if (!grid.includes(minute)) grid.push(minute)
    return grid.sort((a, b) => a - b)
  }, [minuteStep, minute])

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, h) => h), [])

  return (
    <div data-slot="time-columns" className={cn('flex w-fit flex-col', className)}>
      <div className="flex gap-2">
        <Column
          label={labels.hours}
          options={hours}
          value={hour}
          onSelect={(h) => onValueChange?.(toTimeKey(h, minute))}
          format={hourLabel}
        />
        <Column
          label={labels.minutes}
          options={minutes}
          value={minute}
          onSelect={(m) => onValueChange?.(toTimeKey(hour, m))}
          format={(m) => String(m).padStart(2, '0')}
        />
      </div>
      {!hideQuickPick && (
        <div className="mt-2.5 flex justify-center border-t border-border pt-2.5">
          <button
            type="button"
            onClick={() => onValueChange?.(nowTime())}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {labels.now}
          </button>
        </div>
      )}
    </div>
  )
}

function nowTime(): string {
  const now = new Date()
  return toTimeKey(now.getHours(), now.getMinutes())
}

const sizes = {
  sm: 'h-8 text-sm',
  default: 'h-9 text-base md:text-sm',
  lg: 'h-11 text-base',
} as const

export interface TimePickerProps extends Omit<TimeColumnsProps, 'className'> {
  placeholder?: string
  size?: keyof typeof sizes
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

function TimePicker({
  value,
  onValueChange,
  minuteStep,
  locale,
  labels: labelOverrides,
  hideQuickPick,
  placeholder,
  size = 'default',
  id,
  name,
  disabled,
  invalid,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const labels = { ...defaultLabels, ...labelOverrides }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        data-slot="time-picker-trigger"
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
          {value ? formatTimeKey(value, locale) : (placeholder ?? labels.pickTime)}
        </span>
        <Clock className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <TimeColumns
          value={value}
          onValueChange={onValueChange}
          minuteStep={minuteStep}
          locale={locale}
          labels={labelOverrides}
          hideQuickPick={hideQuickPick}
        />
      </PopoverContent>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
    </Popover>
  )
}

export { TimeColumns, TimePicker }
