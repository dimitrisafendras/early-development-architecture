import { cn } from '@/lib/utils'
import { LiveDot } from '@/components/ui/live-badge'

/**
 * The day's sessions as one bar: **one section per session the day program
 * plans**, each as long as that session is meant to be.
 *
 * ## Why sections rather than a fraction
 *
 * A ring — and a plain progress bar — says one number: minutes done over
 * minutes wanted. That is the wrong unit for this page. Tummy time is guided as
 * *short, frequent sessions*, and the day program the caregiver authored on
 * `/schedule` already says how many and how long. "Twelve of sixty" is the same
 * reading whether it arrived in one stretch or six, so a fraction throws away
 * exactly the structure the plan exists to express.
 *
 * Here the plan *is* the scale. Three planned sessions make three sections; a
 * ten-minute session is twice the section of a five-minute one; finishing one
 * fills one. "Two of three done, and the next is a short one" is then a glance
 * rather than an inference.
 *
 * ## The details that matter
 *
 * - **Sections are sized by their planned minutes**, via `flexGrow`, so the bar
 *   always spans its container while the sections keep their relative lengths.
 * - **A section fills by how much of *it* was done**, capped at full: an
 *   eight-minute session against a five-minute plan fills its section and no
 *   more, because the overrun belongs to that session, not to the next one.
 * - **Sessions beyond the plan get their own sections** at the end rather than
 *   being dropped. Doing more than the day planned is a good outcome, and the
 *   bar has to be able to show it.
 * - **With no plan at all** — nothing of this kind in the program, or no
 *   program saved — it falls back to one section per logged session, so the bar
 *   still reads rather than collapsing to an empty track.
 */
export function SessionBar({
  planned,
  done,
  running,
  complete = false,
  accent = 'var(--primary)',
  className,
}: {
  /** Minutes per session, in order, as the day program plans them. */
  planned: number[]
  /** Minutes per session actually logged today, in order. */
  done: number[]
  /** Minutes of the session in progress, if one is running. */
  running?: number
  complete?: boolean
  accent?: string
  className?: string
}) {
  const fill = complete ? 'var(--success)' : accent
  const runningIdx = running != null ? done.length : -1
  // Every section the bar has to draw: the plan, plus anything done past it.
  const count = Math.max(planned.length, done.length + (running != null ? 1 : 0), 1)
  // A session with no planned counterpart still needs a width. The plan's own
  // typical length is the honest default — falling back to a constant would
  // make an unplanned session look like a different kind of thing.
  const fallback = planned.length
    ? planned.reduce((a, b) => a + b, 0) / planned.length
    : Math.max(1, [...done, running ?? 0].reduce((a, b) => a + b, 0) / count)

  const sections = Array.from({ length: count }, (_, i) => {
    const length = Math.max(0.5, planned[i] ?? fallback)
    const actual = i < done.length ? done[i] : i === runningIdx ? (running ?? 0) : null
    return {
      i,
      length,
      // `null` is a section still to come — drawn as an outline, not as 0%.
      pct: actual == null ? null : Math.min(100, (actual / length) * 100),
      live: i === runningIdx,
    }
  })

  return (
    <div className={cn('flex w-full items-center gap-1.5', className)}>
      {sections.map((section) => (
        <div
          key={section.i}
          className="relative"
          style={{ flexGrow: section.length, flexBasis: 0, minWidth: 6 }}
        >
          <div
            className={cn(
              'h-3.5 w-full overflow-hidden rounded-full',
              // Still to come: an outline, so it reads as room the plan has
              // reserved rather than as time that has somehow been spent.
              section.pct == null && 'border border-dashed',
            )}
            style={{
              background:
                section.pct == null
                  ? 'transparent'
                  : 'color-mix(in oklab, var(--muted-foreground) 24%, transparent)',
              borderColor:
                section.pct == null ? `color-mix(in oklab, ${fill} 45%, transparent)` : undefined,
            }}
          >
            {section.pct != null && (
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${section.pct}%`,
                  // The running one is lighter: what is banked and what is still
                  // accruing should not read as the same thing.
                  background: section.live ? `color-mix(in oklab, ${fill} 60%, transparent)` : fill,
                }}
              />
            )}
          </div>

          {/* The live edge, outside the track's `overflow-hidden` — a dot
              centred on the leading edge is half outside the bar by definition,
              and clipping it leaves a half-moon. */}
          {section.live && section.pct != null && (
            <span
              className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-out"
              style={{ left: `${section.pct}%` }}
            >
              <LiveDot className="size-2" color={fill} />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
