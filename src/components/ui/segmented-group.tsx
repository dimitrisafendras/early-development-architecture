import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { controlSize, type ControlSizeProp } from '@/components/ui/control-size'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  /** Needed when `label` is an icon or carries decoration rather than plain text. */
  ariaLabel?: string
  disabled?: boolean
}

/**
 * A segmented control — one choice out of a few, drawn as a single object.
 *
 * ## Why this exists beside `ChoiceGroup`
 *
 * The split is *settings* against *items*.
 *
 * This is for a setting: one thing with a small, fixed set of mutually
 * exclusive positions — an age band, a report range, how a feed happened, which
 * palette. `ChoiceGroup` is for choosing among items, where the options are
 * data rather than positions: which baby, which program to copy. Those sets
 * grow and shrink and have no order to them, so they stay a row of separate
 * pills that can wrap; a track with a travelling thumb would be claiming a
 * sequence that isn't there.
 *
 * Drawn as separate pills, a setting reads wrong: a row of detached lozenges
 * says "nine things" when the truth is "one thing, currently here", and picking
 * one reads as pressing a button rather than moving a selection.
 *
 * A segmented control says it in the shape: one recessed track, one thumb, and
 * the thumb **travels** to the choice you make. The movement is the whole point
 * — it is what makes the group feel like a single control with a position
 * rather than a set of buttons with a winner.
 *
 * ## How the thumb works
 *
 * The thumb is one absolutely-positioned element whose `translate` and `width`
 * are measured from the selected item, not a per-item background. That is what
 * lets it animate between arbitrary widths ("0 mo" and "1 y 6 mo" are not the
 * same size) with no layout thrash, and it is why the track needs
 * `position: relative` and the items need to sit above it.
 *
 * Measurement is layout-effect timing, re-run on selection, on container
 * resize, and after fonts load — a webfont swapping in after first paint is the
 * classic way a control like this ends up with the thumb a few pixels off the
 * label it is supposed to be under.
 *
 * ## Semantics
 *
 * `radiogroup` / `radio`, not a row of pressed buttons. A segmented control is
 * a single-choice control, so a screen reader should hear "2 of 9 selected",
 * and the arrow keys should move the selection — which they do here, including
 * wrapping, and skipping disabled options. Only the selected item is in the tab
 * order (roving tabindex), so the group costs one Tab stop rather than nine.
 *
 * Motion is suppressed under `prefers-reduced-motion`: the thumb still moves,
 * it just arrives immediately.
 */
export function SegmentedGroup<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  size = 'md',
  className,
}: {
  value: T
  onValueChange: (value: T) => void
  options: SegmentedOption<T>[]
  /** Names the group for assistive tech; omit when a visible <Label> does it. */
  ariaLabel?: string
  /** One of the shared control sizes — see `control-size.ts`. */
  size?: ControlSizeProp
  className?: string
}) {
  const dims = controlSize(size)
  const id = useId()

  const trackRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<string, HTMLButtonElement>())
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null)

  const measure = useCallback(() => {
    const track = trackRef.current
    const el = itemRefs.current.get(value)
    if (!track || !el) return setThumb(null)
    setThumb({ x: el.offsetLeft - track.clientLeft, w: el.offsetWidth })
  }, [value])

  useLayoutEffect(measure, [measure, options.length])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    for (const el of itemRefs.current.values()) ro.observe(el)
    // A webfont landing after first paint changes every label's width; without
    // this the thumb sits a few pixels off the text it belongs to.
    void document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [measure])

  const enabled = options.filter((o) => !o.disabled)

  const move = (dir: 1 | -1) => {
    const i = enabled.findIndex((o) => o.value === value)
    if (i < 0) return
    const next = enabled[(i + dir + enabled.length) % enabled.length]
    onValueChange(next.value)
    itemRefs.current.get(next.value)?.focus()
  }

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          move(1)
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          move(-1)
        }
      }}
      className={cn(
        // A recessed track, so the group reads as one inset object with
        // something sitting in it rather than as buttons floating on the page.
        //
        // The control size is the height of the *track*, not of the items in
        // it: this sits in rows beside fields and steppers, and the shared
        // scale promises everything in a row is the same height. Sizing the
        // items instead made the group its padding taller than the stepper
        // beside it — 40px against 32.
        'relative isolate inline-flex max-w-full items-stretch gap-0.5 overflow-x-auto rounded-full bg-muted p-1 align-middle',
        dims.height,
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {/* The travelling thumb. One element for the whole group — a per-item
          background cannot animate between items, which is the entire effect. */}
      {thumb && (
        <span
          aria-hidden
          style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }}
          className={cn(
            'pointer-events-none absolute inset-y-1 left-0 -z-10 rounded-full bg-primary shadow-sm',
            'transition-[transform,width] duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]',
            'motion-reduce:transition-none',
          )}
        />
      )}

      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              if (el) itemRefs.current.set(option.value, el)
              else itemRefs.current.delete(option.value)
            }}
            type="button"
            role="radio"
            id={`${id}-${option.value}`}
            aria-checked={selected}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            // Roving tabindex: the group is one Tab stop, and the arrows move
            // within it — the radiogroup contract.
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'relative inline-flex h-full shrink-0 items-center justify-center rounded-full px-3 font-medium whitespace-nowrap',
              'outline-none transition-colors select-none',
              'focus-visible:ring-3 focus-visible:ring-ring/50',
              'disabled:pointer-events-none disabled:opacity-50',
              'text-sm',
              selected
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
