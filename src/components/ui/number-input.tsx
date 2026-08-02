import * as React from 'react'
import { NumberField } from '@base-ui/react/number-field'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { controlSizes, type ControlSizeProp } from '@/components/ui/control-size'

/**
 * A stepper field: `[−][ 3.4 kg ][+]`.
 *
 * It is an `Input` first and a stepper second — same height, same `rounded-lg`
 * border, same text size as the field beside it — so a form row of
 * `Input` / `DatePicker` / `NumberInput` / `Button` reads as one family.
 *
 * Nothing inside the field touches its border. The caps are full-height hit
 * areas whose *visible* chrome is a rounded key inset 4px on every side, and
 * the optional value indicator is a 2px bar inset from the bottom edge. That
 * inset is the whole trick: an earlier version divided the caps from the value
 * with full-height hairlines, and where a straight hairline met the 10px corner
 * radius it read as a seam leaking out of the box (worst in dark, where the
 * border is a light hairline on a dark fill). Any line that stops short of the
 * corners cannot do that.
 *
 * Built on Base UI's `NumberField`, so it gets press-and-hold repeat,
 * arrow-key stepping (alt = small step, shift = large), locale-aware parsing
 * and clamping for free — none of which the native `type="number"` spinner
 * offers.
 *
 * Digits are tabular so the value never jitters while stepping, and `unit`
 * renders the measure inline ("3.4 kg") instead of leaning on the label.
 */

/**  The size map is derived from `Input` (`h-11 … sm:h-8`, `text-base md:text-sm`),
   which `Button` and `DatePicker` also follow: a real touch target on phones,
   the compact desktop height from `sm` up. Nothing here is a free choice —
   given the group height, everything else falls out of it:

   | size    | group        | cap (w)     | icon           | value          |
   | ------- | ------------ | ----------- | -------------- | -------------- |
   | sm      | h-9  sm:h-7  | w-8  sm:w-6 | 3.5 → 3        | text-sm        |
   | default | h-11 sm:h-8  | w-9  sm:w-7 | 4   → 3.5      | base → md:sm   |
   | lg      | h-12 sm:h-10 | w-10 sm:w-8 | 5   → 4        | text-base      |

   *Cap width* — the cap is a full-height hit area, so its height is the
   group's and only the width is a choice: ~0.85 × the group height, rounded to
   a spacing step (default 36/44 and 28/32). Slightly narrower than square keeps
   the row of two caps from eating a narrow grid column, and every cap still
   clears the 24px minimum target: the smallest is 24×28.
   *Icon* — half the cap, so the glyph keeps a ring of key around it. The key
   is the cap minus its `p-1`, so at `default` the glyph sits (36−8−16)/2 = 6px
   inside the key and 10px inside the cap; at `sm`, 3px and 7px.

   *`min-w`* is a floor, not a target. The caps are `shrink-0` and the value is
   `min-w-0`, so without it a narrow parent squeezes the number to nothing
   between the two caps while the caps stay full size. Each floor is
   `2 × cap + 8px of value padding + 2rem of value room`, which is why they are
   exact rather than round: default = 72 + 8 + 32 = 112px = 7rem, and 56 + 8 +
   32 = 96px = 6rem from `sm`. Both fit the app's tightest real columns — 120px
   (a `grid-cols-2 gap-4` form in a card on a 320px viewport) and 99px (the same
   card's `sm:grid-cols-4` row at exactly 640px) — so the floor can never turn a
   squeeze into an overflow. Give the field a full row (or a `max-w-*`) when you
   want the value comfortable rather than merely readable.
 */
const sizes = {
  sm: {
    group: `${controlSizes.sm.height} min-w-[6.5rem] sm:min-w-[5.5rem]`,
    cap: 'w-8 sm:w-6',
    bar: 'inset-x-8 sm:inset-x-6',
    text: controlSizes.sm.text,
    icon: 'size-3.5 sm:size-3',
  },
  md: {
    group: `${controlSizes.md.height} min-w-[7rem] sm:min-w-[6rem]`,
    cap: 'w-9 sm:w-7',
    bar: 'inset-x-9 sm:inset-x-7',
    text: controlSizes.md.text,
    icon: 'size-4 sm:size-3.5',
  },
  lg: {
    group: `${controlSizes.lg.height} min-w-[7.5rem] sm:min-w-[6.5rem]`,
    cap: 'w-10 sm:w-8',
    bar: 'inset-x-10 sm:inset-x-8',
    text: controlSizes.lg.text,
    icon: 'size-5 sm:size-4',
  },
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
  /**
   * Top of the scale the value indicator fills against. Pass it (or a real
   * `max`) to switch the indicator on: a 2px bar along the bottom inside edge
   * that grows left→right with the value, so repeated `+` presses accumulate
   * into something you can see. Without a scale there is nothing to be a
   * proportion *of*, so the bar is not rendered at all.
   *
   * Pick the top of the plausible range for the measure, not a hard limit —
   * it is a readout, not a constraint (it never clamps; `floor`/`max` do that).
   */
  indicatorMax?: number
  /** Bottom of the indicator's scale. Defaults to 0; set it when the plausible
   *  range starts far from zero (head circumference, room temperature), or the
   *  bar sits two-thirds full before the first press and barely moves. */
  indicatorMin?: number
  /** One of the shared control sizes — see `control-size.ts`. */
  size?: ControlSizeProp
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
  indicatorMax,
  indicatorMin = 0,
  size = 'md',
  placeholder,
  invalid,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
  className,
  inputClassName,
  id,
  ...props
}: NumberInputProps) {
  const s = sizes[size === 'default' ? 'md' : size]

  // The indicator needs the current value, which may be controlled by the call
  // site or left to the field. Mirroring it keeps the bar working either way,
  // and the controlled prop always wins so the bar can never disagree with the
  // number on screen.
  const [tracked, setTracked] = React.useState<number | null>(props.defaultValue ?? null)
  const value = props.value !== undefined ? props.value : tracked

  const scaleTop = indicatorMax ?? props.max
  const scale = scaleTop !== undefined && scaleTop > indicatorMin ? scaleTop - indicatorMin : null
  const percent =
    scale === null || value == null
      ? 0
      : Math.min(100, Math.max(0, ((value - indicatorMin) / scale) * 100))

  // A cap is a full-height hit area whose visible chrome is an inset *key*: a
  // chip that carries the fill, the radius, the hairline and the focus ring.
  // Because it is inset by `p-1` on every side, none of them can reach — let
  // alone cross — the field's rounded border. Its 6px radius is the field's
  // 10px minus that 4px inset, so the key is exactly concentric with the box it
  // sits in, which is what makes the inset read as drawn rather than left over.
  const cap = cn(
    'group/cap grid shrink-0 place-items-center p-1 focus-visible:outline-none',
    // `touch-manipulation`: no 300ms double-tap-zoom delay when tapping the caps
    // in quick succession.
    'touch-manipulation select-none',
    'disabled:pointer-events-none disabled:opacity-40 data-disabled:pointer-events-none data-disabled:opacity-40',
    s.cap,
  )
  // The key borrows the app's own chip idiom — a `bg-gradient-to-br
  // from-primary/x to-primary/y` tile with a `ring-inset` hairline and a
  // primary glyph, the same recipe as `StatTile`'s icon chip — so the stepper
  // looks drawn by the hand that drew the rest of the app, and re-tints with the
  // palette for free. A neutral grey key was the first attempt and it
  // disappeared against a light card: near-invisible chrome on the one part of
  // the field you are meant to press.
  //
  // It deepens on hover and sinks on press (`scale`, no shadow), so a press
  // feels like a key going down rather than a colour flicking on.
  const key = cn(
    'grid size-full place-items-center rounded-sm shadow-xs ring-1 ring-inset',
    'bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-primary/20',
    'transition-[background-color,box-shadow,transform] duration-150 ease-out',
    'group-hover/cap:from-primary/35 group-hover/cap:to-primary/15 group-hover/cap:ring-primary/35',
    'group-active/cap:scale-[0.94] group-active/cap:shadow-none group-active/cap:from-primary/45 group-active/cap:to-primary/25',
    // The ring rides the inset key, so a focused cap is unmistakable without
    // any ring escaping the field.
    'group-focus-visible/cap:ring-2 group-focus-visible/cap:ring-ring/80',
    'motion-reduce:transition-none motion-reduce:group-active/cap:scale-100',
  )

  return (
    // One element in the caller's flow. `NumberField.Root` emits a 1px hidden
    // input for form submission *as a sibling* of the group, so a field cell laid
    // out with `space-y-*` (the app's standard label-over-control cell) saw two
    // children where it expected one: the hidden input became the last child, the
    // group stopped being it, and the group therefore picked up the cell's 6px
    // bottom margin. In an `items-end` row — the log-a-feed compose row, the
    // measurement row — that put the stepper's bottom edge 6px above every
    // neighbouring control while the cells themselves aligned perfectly. Wrapping
    // Root keeps the hidden input inside the component, where it belongs.
    //
    // **`className` sizes this box, not the group inside it.** The wrapper used
    // to be an unconditional `w-full`, so a caller could never make the stepper
    // narrower than its container: `w-40` landed on the group, the wrapper still
    // claimed the full line, and in a flex row every neighbour was pushed onto
    // the next one. The group fills whatever this box is given, which is what
    // every call site already assumed — all four pass nothing but a width.
    <div className={cn('w-full', className)}>
    <NumberField.Root
      id={id}
      data-slot="number-input"
      onValueChange={(next) => {
        setTracked(next)
        onValueChange?.(next !== null && floor !== undefined ? Math.max(floor, next) : next)
      }}
      {...props}
    >
      <NumberField.Group
        data-slot="number-input-group"
        className={cn(
          // `Input`'s own shell: same radius, same border, same fill.
          'relative flex w-full items-stretch overflow-hidden rounded-lg border border-input bg-transparent transition-colors',
          // Ring on the *text* focus only, exactly like `Input`; a focused cap
          // shows its own key ring instead of lighting the whole field.
          'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50',
          'has-[input:disabled]:bg-input/50 has-[input:disabled]:opacity-60 dark:bg-input/30 dark:has-[input:disabled]:bg-input/80',
          invalid && 'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
          s.group,
        )}
      >
        <NumberField.Decrement aria-label={decrementLabel} className={cap}>
          <span className={key}>
            <Minus className={s.icon} strokeWidth={2.25} />
          </span>
        </NumberField.Decrement>

        {/* The value is the middle of the field: centred, tabular, with the unit
            riding just after it so the field never reads as an empty box. The
            type scale lives here rather than on the input so the unit can size
            itself off the value (`0.8em`) at every size variant — Tailwind's
            preflight gives form controls `font: inherit`, so the input picks it
            up too. */}
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center justify-center gap-1 px-1 font-semibold tracking-tight',
            s.text,
          )}
        >
          <NumberField.Input
            placeholder={placeholder}
            className={cn(
              // `h-full`: the whole middle of the field is a click target, not
              // just the 24px line box of the number.
              'h-full min-w-0 flex-1 bg-transparent text-center tabular-nums outline-none',
              'placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/70',
              'disabled:cursor-not-allowed',
              inputClassName,
            )}
          />
          {unit && (
            <span className="shrink-0 text-[0.78em] font-medium tracking-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </div>

        <NumberField.Increment aria-label={incrementLabel} className={cap}>
          <span className={key}>
            <Plus className={s.icon} strokeWidth={2.25} />
          </span>
        </NumberField.Increment>

        {/* How far along the scale the value is, as a hairline on the field's
            bottom edge. It spans exactly the *value cell* — inset from each end
            by one cap width — for two reasons: the keys are opaque, so a
            full-width bar spent its first ~13% hidden underneath the left one
            and small values looked like no progress at all; and starting 36px
            in puts it nowhere near the corner radius, so it cannot leak.
            Decorative: the number itself is the accessible value, and the empty
            track is what tells you a scale exists at all. `motion-reduce` drops
            the travel animation, never the bar. */}
        {scale !== null && (
          <span
            aria-hidden
            data-slot="number-input-indicator"
            className={cn(
              'pointer-events-none absolute bottom-0.5 h-0.5 overflow-hidden rounded-full',
              'bg-foreground/10 dark:bg-foreground/15',
              s.bar,
            )}
          >
            <span
              data-slot="number-input-indicator-fill"
              className="block h-full rounded-full bg-gradient-to-r from-primary/40 to-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </span>
        )}
      </NumberField.Group>
    </NumberField.Root>
    </div>
  )
}

export { NumberInput }
