import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/**
 * A required single choice — feed method, accent palette, which baby.
 *
 * Base UI's `ToggleGroup` is array-valued, and with `multiple` off, pressing
 * the active item unpresses it and leaves the group empty. None of these
 * choices has a valid empty state, so deselection is swallowed here once
 * rather than being re-derived (and re-forgotten) at every call site.
 */

export interface ChoiceOption<T extends string> {
  value: T
  label: ReactNode
  /** Needed when `label` is an icon rather than text. */
  ariaLabel?: string
  disabled?: boolean
}

export interface ChoiceGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: ChoiceOption<T>[]
  /** Names the group for assistive tech; omit when a visible <Label> does it. */
  ariaLabel?: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * Mobile-first heights, matching `Input` and the pickers: a real touch target
 * on phones, the tighter desktop height from `sm` up. These override the fixed
 * heights in `toggleVariants`' size scale, which the rest of the app's toggles
 * still use.
 */
const heights = {
  sm: 'h-9 sm:h-7',
  default: 'h-11 sm:h-8',
  lg: 'h-11 sm:h-9',
} as const

export function ChoiceGroup<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = 'lg',
  className,
}: ChoiceGroupProps<T>) {
  return (
    <ToggleGroup
      aria-label={ariaLabel}
      variant="pill"
      size={size}
      value={[value]}
      onValueChange={(next) => {
        const picked = (next as T[]).find((v) => v !== value)
        if (picked) onChange(picked)
      }}
      className={cn('flex-wrap gap-2', className)}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          aria-label={o.ariaLabel}
          disabled={o.disabled}
          className={heights[size]}
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
