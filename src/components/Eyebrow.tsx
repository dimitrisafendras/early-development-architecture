import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The one small-caps label ("eyebrow").
 *
 * **Why it exists.** An alignment audit found *twelve* spellings of this one
 * label across the app and the topic sections — sizes `text-sm` / `text-xs` /
 * `text-[11px]` / `text-[10px]`, trackings `0.18em` / `0.16em` / `0.14em` /
 * `tracking-wider` (0.05em) / none, and weights 500 / 600 / 700 — often two or
 * three of them visible on the same screen (the Day page alone had three). A
 * label whose size and letter-spacing shift between neighbouring cards reads as
 * a rendering bug, not as a style.
 *
 * The contract is fixed: **uppercase, `font-semibold`, `tracking-[0.16em]`**.
 * Only two things vary, and only for a stated reason:
 *
 * - `size` — `sm` (12px) is the default and covers every label *inside* a card
 *   or over a tier. `md` (14px) is for a label that stands in for a heading:
 *   the sub-block titles inside the Wiki topic sections, which are real `h3`s.
 * - `tone` — `primary` (the default) for a label that opens a block of content;
 *   `muted` for a structural/meta label that must not compete with it. Pass
 *   `tone="inherit"` when the colour is semantic (an activity hue, a status
 *   tone) and comes from `className`.
 *
 * Use `as` to keep the document outline correct: a label that titles a section
 * is an `h2`/`h3`, not a `p`.
 */
export function Eyebrow({
  as: As = 'p',
  size = 'sm',
  tone = 'primary',
  id,
  className,
  children,
}: {
  as?: 'p' | 'span' | 'div' | 'h2' | 'h3' | 'h4'
  /** `sm` = 12px (in-card / tier label). `md` = 14px (stands in for a heading). */
  size?: 'sm' | 'md'
  /** `inherit` leaves the colour to `className` — for semantic hues only. */
  tone?: 'primary' | 'muted' | 'inherit'
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <As
      id={id}
      className={cn(
        'font-semibold uppercase tracking-[0.16em]',
        size === 'md' ? 'text-sm' : 'text-xs',
        tone === 'primary' && 'text-primary',
        tone === 'muted' && 'text-muted-foreground',
        className,
      )}
    >
      {children}
    </As>
  )
}
