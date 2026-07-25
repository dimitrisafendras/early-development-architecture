import * as React from 'react'
import { NumberField } from '@base-ui/react/number-field'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A capsule stepper: a round decrement cap, the value, a round increment cap.
 * The caps are inset pills rather than flat cells, so the control reads as two
 * buttons around a number instead of an empty box. Built on Base UI's NumberField, so it gets
 * press-and-hold repeat, arrow-key stepping (alt = small step, shift = large),
 * locale-aware parsing and clamping for free — none of which the native
 * `type="number"` spinner offers.
 *
 * Digits are tabular so the value never jitters while stepping, and `unit`
 * renders the measure inline ("3.4 kg") instead of leaning on the label.
 */

/**  Matches `Input`'s mobile-first sizing: a real touch target on phones,
   the compact desktop height from `sm` up.

   The `min-w` is a floor, not a target. The caps are `shrink-0` and the value
   is `min-w-0`, so without it a narrow parent squeezes the number to nothing
   between the two caps while the caps themselves stay full size. Each floor is
   `2 × cap + ~2rem` of value room, capped at 7.5rem for the default size —
   which is exactly one column of the app's tightest real layout (a
   `grid-cols-2 gap-4` form inside a card, on a 320px viewport), so the floor
   never turns a squeeze into an overflow. Give the field a full row (or a
   `max-w-*`) when you want the value to be comfortable rather than merely
   readable.
 */
const sizes = {
  sm: { group: 'h-9 min-w-[7rem] sm:h-8', cap: 'size-7 sm:size-6', text: 'text-sm', icon: 'size-3.5' },
  default: {
    group: 'h-11 min-w-[8rem] sm:h-10',
    cap: 'size-9 sm:size-8',
    text: 'text-lg sm:text-base',
    icon: 'size-4',
  },
  lg: { group: 'h-13 min-w-[9rem]', cap: 'size-11', text: 'text-xl', icon: 'size-5' },
} as const

export interface NumberInputProps
  extends Omit<NumberField.Root.Props, 'onValueChange' | 'render' | 'className'> {
  /** Callback with the raw numeric value, or `null` once the field is cleared. */
  onValueChange?: (value: number | null) => void
  /** Inline unit shown after the value — "kg", "cm", "ml", "min". */
  unit?: React.ReactNode
  /**
   * Lower bound enforced in JS instead of through the native `min` attribute.
   * Setting `min` also switches on the browser's `stepMismatch` check, which
   * then rejects a legitimate 3.45 whenever `step` is 0.1 — and that rejection
   * silently blocks the surrounding form from submitting.
   */
  floor?: number
  size?: keyof typeof sizes
  placeholder?: string
  invalid?: boolean
  /** Accessible names for the stepper caps. */
  decrementLabel?: string
  incrementLabel?: string
  className?: string
  inputClassName?: string
}

function NumberInput({
  onValueChange,
  unit,
  floor,
  size = 'default',
  placeholder,
  invalid,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
  className,
  inputClassName,
  id,
  ...props
}: NumberInputProps) {
  const s = sizes[size]

  // Round, slightly raised caps inset in the capsule, so they read as two
  // physical buttons either side of the value rather than as flat table cells.
  const cap = cn(
    'grid shrink-0 place-items-center rounded-full bg-muted text-foreground shadow-xs select-none',
    'transition-[background-color,transform] active:scale-90',
    // `touch-manipulation`: no 300ms double-tap-zoom delay when tapping the caps
    // in quick succession.
    'touch-manipulation hover:bg-accent-foreground/10',
    'focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-35 data-disabled:pointer-events-none data-disabled:opacity-35',
    s.cap,
  )

  return (
    <NumberField.Root
      id={id}
      data-slot="number-input"
      onValueChange={
        onValueChange &&
        ((value) => onValueChange(value !== null && floor !== undefined ? Math.max(floor, value) : value))
      }
      {...props}
    >
      <NumberField.Group
        className={cn(
          'flex w-full items-center gap-1 rounded-full border border-input bg-transparent p-1 transition-colors',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          'has-[input:disabled]:bg-input/50 has-[input:disabled]:opacity-60 dark:bg-input/30 dark:has-[input:disabled]:bg-input/80',
          invalid && 'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
          s.group,
          className,
        )}
      >
        <NumberField.Decrement aria-label={decrementLabel} className={cap}>
          <Minus className={s.icon} />
        </NumberField.Decrement>

        {/* The value is the middle of the capsule: centred, semibold, tabular, with
            the unit riding just after it so the field never reads as empty. */}
        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
          <NumberField.Input
            placeholder={placeholder}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-center font-semibold tabular-nums outline-none',
              'placeholder:font-normal placeholder:text-muted-foreground/70',
              'disabled:cursor-not-allowed',
              s.text,
              inputClassName,
            )}
          />
          {unit && <span className="shrink-0 pr-0.5 text-xs font-medium text-muted-foreground">{unit}</span>}
        </div>

        <NumberField.Increment aria-label={incrementLabel} className={cap}>
          <Plus className={s.icon} />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  )
}

export { NumberInput }
