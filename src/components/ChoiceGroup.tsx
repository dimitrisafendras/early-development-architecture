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
        <ToggleGroupItem key={o.value} value={o.value} aria-label={o.ariaLabel} disabled={o.disabled}>
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
