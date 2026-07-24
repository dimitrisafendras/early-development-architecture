import * as React from 'react'
import { NumberField } from '@base-ui/react/number-field'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A segmented stepper: decrement cap · value · increment cap, inside one
 * capsule with hairline dividers. Built on Base UI's NumberField, so it gets
 * press-and-hold repeat, arrow-key stepping (alt = small step, shift = large),
 * locale-aware parsing and clamping for free — none of which the native
 * `type="number"` spinner offers.
 *
 * Digits are tabular so the value never jitters while stepping, and `unit`
 * renders the measure inline ("3.4 kg") instead of leaning on the label.
 */

/**  Matches `Input`'s mobile-first sizing: a real touch target on phones,
   the compact desktop height from `sm` up.
 */
const sizes = {
  sm: { group: 'h-9 sm:h-7', cap: 'w-9 sm:w-7', text: 'text-sm', icon: 'size-3.5' },
  default: { group: 'h-11 sm:h-8', cap: 'w-11 sm:w-8', text: 'text-base md:text-sm', icon: 'size-4' },
  lg: { group: 'h-12 sm:h-10', cap: 'w-12 sm:w-10', text: 'text-lg', icon: 'size-5' },
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

  const cap = cn(
    'flex shrink-0 items-center justify-center text-muted-foreground transition-colors select-none',
    'hover:bg-accent hover:text-foreground active:bg-accent/70',
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
          'flex w-full items-stretch overflow-hidden rounded-lg border border-input bg-transparent transition-colors',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          'has-[input:disabled]:bg-input/50 has-[input:disabled]:opacity-60 dark:bg-input/30 dark:has-[input:disabled]:bg-input/80',
          invalid && 'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
          s.group,
          className,
        )}
      >
        <NumberField.Decrement aria-label={decrementLabel} className={cn(cap, 'border-r border-input')}>
          <Minus className={s.icon} />
        </NumberField.Decrement>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1.5">
          <NumberField.Input
            placeholder={placeholder}
            className={cn(
              'w-full min-w-0 bg-transparent text-center font-medium tabular-nums outline-none',
              'placeholder:font-normal placeholder:text-muted-foreground',
              'disabled:cursor-not-allowed',
              s.text,
              inputClassName,
            )}
          />
          {unit && <span className="shrink-0 text-xs text-muted-foreground">{unit}</span>}
        </div>

        <NumberField.Increment aria-label={incrementLabel} className={cn(cap, 'border-l border-input')}>
          <Plus className={s.icon} />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  )
}

export { NumberInput }
