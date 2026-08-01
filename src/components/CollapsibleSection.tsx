import { useId, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Eyebrow } from './Eyebrow'

/**
 * A titled block on a long page that can be folded away.
 *
 * `/schedule` grew four stacked sections — programs, the moments themselves, the
 * preset palette, the sample days — all open at once, so the page opened on
 * roughly four screens of controls with no way to see its own structure. Folding
 * is the fix that keeps every section reachable: the headers stay visible and
 * become a table of contents for the page.
 *
 * Open/closed is the caller's state, not this component's, because the page
 * persists it — a caregiver who works with the presets folded away should not
 * have to fold them again on every visit.
 *
 * The whole header is the control. A chevron-only hit target is 24px in a 60px
 * row, and every mis-click lands on dead space beside a thing that plainly looks
 * clickable.
 */
export function CollapsibleSection({
  title,
  hint,
  count,
  open,
  onToggle,
  actions,
  children,
  className,
}: {
  title: string
  hint?: string
  /** Optional tally shown beside the title — how much is folded away. */
  count?: number
  open: boolean
  onToggle: () => void
  /** Controls that stay reachable while the section is folded. */
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  const id = useId()

  return (
    // A Card, not a Card-lookalike. This was `bg-card/40` with a hairline
    // border — a third surface species beside the app's opaque, ring-edged
    // content surfaces, which is most of why the page read as assembled from
    // parts. The design system's rule is blunt: a surface that looks like a
    // Card must be a Card.
    <section
      className={cn(
        'rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          // `basis-full` below `sm` so the actions drop under the title instead
          // of squeezing the hint into five wrapped lines beside them.
          className="flex min-w-0 flex-1 basis-full items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:basis-0"
        >
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
              // Points right when folded, down when open — the rotation is the
              // only moving part, so it has to carry the state on its own.
              open ? 'rotate-0' : '-rotate-90',
            )}
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <Eyebrow as="span">{title}</Eyebrow>
              {/* `outline`, not `soft`: `soft` is the app's *status* badge
                  ("In use now"), and a plain tally that looks like a status
                  reads as one. */}
              {count != null && <Badge variant="outline" className="shrink-0">{count}</Badge>}
            </span>
            {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
          </span>
        </button>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {/* Unmounted rather than hidden when folded: these sections hold whole
          editable lists and tooltip roots, and keeping four of them mounted is
          the cost the folding was meant to remove. */}
      {open && (
        <div id={id} className="mt-4">
          {children}
        </div>
      )}
    </section>
  )
}
