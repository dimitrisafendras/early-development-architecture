/**
 * The control size scale — **one table, every control**.
 *
 * ## The rule
 *
 * Anything you can click or type into is a *control*: `Button`, `Input`,
 * `NumberInput`, `DatePicker`, `TimePicker`, `DateTimePicker`, `Toggle` /
 * `ToggleGroup` / `ChoiceGroup` / `SegmentedGroup`. Every one of them takes the same three sizes —
 * `sm`, `md`, `lg` — and at a given size they are **exactly the same height**.
 *
 * So: *controls standing side by side in a row must all be given the same
 * size.* A `md` field beside a `lg` button is a bug, not a style choice — that
 * mismatch is what makes a form row look ragged. Pick one size for the row and
 * pass it to everything in it; if one control needs to stand out, change its
 * `variant` (fill, weight, colour), never its size.
 *
 * `default` is kept as an alias of `md` because it is what `cva` and ~60 call
 * sites already say. New code should say `md`.
 *
 * ## The scale
 *
 * Mobile-first, and the two numbers are not a free choice:
 *
 * | size | phone | `sm` up | why |
 * | ---- | ----- | ------- | --- |
 * | `sm` | 36px  | 28px    | dense rows — table cells, inline edit, chips |
 * | `md` | 44px  | 32px    | the default. 44px is the WCAG touch minimum |
 * | `lg` | 48px  | 40px    | the primary action of a page, hero forms |
 *
 * Phones get a real touch target; from `sm` up (where a mouse is doing the
 * aiming) everything collapses to the compact base-nova desktop scale.
 *
 * Only *dimensions* live here — height, the square for icon-only controls, the
 * corner radius, the glyph size, and the type scale **fields** share. Buttons
 * keep their own type scale (`text-sm`): a field needs `text-base` on phones or
 * iOS Safari zooms the viewport when it takes focus, and a button never takes
 * text input, so it never pays that tax. Horizontal padding also stays per
 * control — a label needs more room beside it than a value does.
 */

export type ControlSize = 'sm' | 'md' | 'lg'

/** What a control accepts at its boundary; `default` is the legacy alias. */
export type ControlSizeProp = ControlSize | 'default'

export const controlSizes = {
  sm: {
    /** Height of a control that sits in a row. */
    height: 'h-9 sm:h-7',
    /** Height *and* width, for icon-only controls. */
    square: 'size-9 sm:size-7',
    radius: 'rounded-[min(var(--radius-md),12px)]',
    icon: 'size-3.5',
    /** The type scale every *field* uses at this size. */
    text: 'text-sm',
  },
  md: {
    height: 'h-11 sm:h-8',
    square: 'size-11 sm:size-8',
    radius: 'rounded-lg',
    icon: 'size-4',
    // `text-base` below `md` is deliberate: iOS Safari zooms the viewport when a
    // focused field's font-size is under 16px.
    text: 'text-base md:text-sm',
  },
  lg: {
    height: 'h-12 sm:h-10',
    square: 'size-12 sm:size-10',
    radius: 'rounded-lg',
    icon: 'size-4',
    text: 'text-base',
  },
} as const

/** Collapses the `default` alias so a component can index `controlSizes`. */
export function controlSize(size?: ControlSizeProp): (typeof controlSizes)[ControlSize] {
  return controlSizes[!size || size === 'default' ? 'md' : size]
}
