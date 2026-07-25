import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The tinted square that carries an icon beside a title.
 *
 * **Why it exists.** The same chip was hand-rolled in ~20 places with four
 * different geometries: padding `p-2` / `p-2.5` / `p-3`, radius `rounded-lg` /
 * `rounded-xl` / `rounded-2xl`, and two sizing strategies (padding-based vs a
 * fixed `size-11` box), with icons at `size-4` / `size-5` / `size-6` /
 * `size-[18px]` inside them. Sibling pages therefore showed visibly different
 * chips for the same role.
 *
 * One geometry, two steps:
 *
 * | size | box            | icon      | used for                        |
 * |------|----------------|-----------|---------------------------------|
 * | `sm` | `rounded-lg`, p-2   | 16px | inline with a 13–15px title     |
 * | `md` | `rounded-xl`, p-2.5 | 20px | a card / sub-block heading      |
 * | `lg` | `rounded-2xl`, p-3  | 24px | a page-level or hero mark       |
 *
 * The default tint is the palette gradient, so the chip re-tints with the
 * blue/red axis for free. A semantic hue (an activity colour, a status tone)
 * goes through `className` — it replaces the gradient rather than layering on
 * it, because `cn` lets the caller's `bg-*` win.
 */
export function IconChip({
  size = 'md',
  className,
  children,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-primary/25 to-primary/5 text-primary ring-1 ring-inset ring-primary/20',
        size === 'sm' && 'rounded-lg p-2 [&_svg]:size-4',
        size === 'md' && 'rounded-xl p-2.5 [&_svg]:size-5',
        size === 'lg' && 'rounded-2xl p-3 [&_svg]:size-6',
        className,
      )}
    >
      {children}
    </span>
  )
}
