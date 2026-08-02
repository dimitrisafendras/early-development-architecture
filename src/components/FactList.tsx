import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Fact {
  Icon: LucideIcon
  title: string
  text: string
  /** Tone classes for the glyph, when this row means something the rest do not. */
  iconClassName?: string
}

/**
 * A list of short titled facts, inside one surface.
 *
 * **Why this exists.** Half the Wiki was grids of identical mini-cards — four to
 * six `Card`s in a row, each holding an icon chip, a four-word title and one
 * sentence. That shape is right for independent objects you compare (an age
 * band, a stat) and wrong for a *list*, which is what these are: the items are
 * not alternatives, they are points, and giving each its own bordered surface
 * made a six-point list read as six separate things to weigh. The interaction
 * topic alone carried 32 cards and ran to eight viewports on a phone.
 *
 * One card, one `dl`, a glyph per row. The icon shrinks from a 40px gradient
 * chip to a 16px inline mark — it still distinguishes the rows, it just stops
 * being the loudest thing in them.
 *
 * `iconClassName` is the escape hatch for a row that genuinely differs — the one
 * "call the doctor today" line among four pieces of ordinary guidance. Use it
 * only where the colour is semantic; if every row takes one, none of them mean
 * anything.
 */
export function FactList({
  facts,
  columns = 2,
  className,
}: {
  facts: Fact[]
  /** Columns from `sm` up. One column below it, always. */
  columns?: 1 | 2 | 3
  className?: string
}) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-x-8 gap-y-5',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {facts.map(({ Icon, title, text, iconClassName }) => (
        <div key={title} className="flex gap-3">
          <Icon
            aria-hidden
            className={cn('mt-0.5 size-4 shrink-0', iconClassName ?? 'text-primary')}
          />
          <div className="min-w-0">
            <dt className="text-sm font-semibold text-foreground">{title}</dt>
            <dd className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{text}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
