import * as React from 'react'

import { cn } from '@/lib/utils'

export interface GlassToggleOption<T extends string> {
  value: T
  label: React.ReactNode
  /** Accessible name when the label is icon-only. */
  ariaLabel?: string
}

export interface GlassToggleGroupProps<T extends string> {
  options: GlassToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Required accessible name for the radiogroup. */
  ariaLabel: string
  size?: 'sm' | 'default'
  className?: string
}

/**
 * GlassToggleGroup — segmented control on the glass material with a sliding
 * "lensing" thumb. Used for the theme + palette switchers. Implements the
 * WAI-ARIA radiogroup pattern (roving arrow-key navigation, aria-checked).
 */
export function GlassToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'default',
  className,
}: GlassToggleGroupProps<T>) {
  const count = options.length
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value))
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  const move = (dir: 1 | -1) => {
    const next = (activeIndex + dir + count) % count
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    }
  }

  const pad = size === 'sm' ? 3 : 4
  const height = size === 'sm' ? 'h-8' : 'h-10'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('ds-glass rounded-full', className)}
      style={{ ['--ds-glass-radius' as string]: '9999px', padding: pad }}
    >
      <span className="ds-glass__illumination" aria-hidden="true" />
      <span className="ds-glass__highlight" aria-hidden="true" />
      <div
        className={cn('ds-glass__content relative grid', height)}
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {/* Sliding lensing thumb */}
        <span
          aria-hidden="true"
          className="ds-seg-thumb pointer-events-none absolute inset-y-0 left-0 rounded-full bg-primary shadow-sm"
          style={{
            width: `${100 / count}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {options.map((opt, i) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={opt.ariaLabel}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(opt.value)}
              className={cn(
                'relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full px-3 font-medium whitespace-nowrap outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring/70',
                textSize,
                selected ? 'text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
