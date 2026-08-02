import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The one bulleted list.
 *
 * **Why it exists.** The app spelled this three different ways. The safe-sleep
 * list drew a real 6px `rounded-full` dot nudged onto the first line's optical
 * centre; the feeding cue lists typed a literal `•` glyph, which sits on the
 * text baseline and is a different size in every font; and the tummy-time
 * benefits used the browser's own `list-disc`, whose marker size, colour and
 * indent are the user agent's and match neither. Three markers for one meaning,
 * two of them visible on the same screen.
 *
 * The dot is a span, not a glyph and not a marker, for the reason the safe-sleep
 * list found first: `mt-1.5` puts it on the *cap height* of the first line
 * rather than its baseline, so it reads as aligned with the text beside it at
 * any size, and it takes a token colour that a `::marker` cannot.
 *
 * `dotClassName` is for a list whose colour is **semantic** — the hunger cues
 * are `success` and the full cues are `warning`, and that pairing is the point
 * of showing them side by side. Everything else takes the default and should:
 * a colour used decoratively is the thing that hides the colours that mean
 * something.
 */
export function BulletList({
  items,
  dotClassName,
  className,
}: {
  /** One entry per bullet. Compose rich content in the caller. */
  items: ReactNode[]
  /** Dot colour, for semantic lists only. Defaults to the accent. */
  dotClassName?: string
  className?: string
}) {
  return (
    <ul className={cn('flex flex-col gap-2.5 text-[13px] leading-relaxed', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span
            aria-hidden
            className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', dotClassName ?? 'bg-primary')}
          />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  )
}
