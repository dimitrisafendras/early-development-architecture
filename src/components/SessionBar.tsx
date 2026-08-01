import { cn } from '@/lib/utils'
import { LiveDot } from '@/components/ui/live-badge'

/**
 * The day's tummy time as one bar: **one block per session the day program
 * plans**, each as long as that session is meant to be, filled continuously by
 * the minutes actually done.
 *
 * ## Why blocks
 *
 * A ring — and a plain progress bar — says one number: minutes done over
 * minutes wanted. That is the wrong unit for this page. Tummy time is guided as
 * *short, frequent sessions*, and the day program the caregiver authored on
 * `/schedule` already says how many and how long. "Twelve of sixty" is the same
 * reading whether it arrived in one stretch or six, so a bare fraction throws
 * away exactly the structure the plan exists to express.
 *
 * So the plan is the scale: three planned sessions make three blocks, and a
 * ten-minute session is twice the block of a five-minute one.
 *
 * ## Why the fill is continuous, and not one block per session
 *
 * The first version mapped session *n* to block *n*. That looked right until you
 * stopped early: a one-minute session against a five-minute block left that
 * block a fifth full for ever, and pressing Start again jumped to the next block
 * — so the bar kept opening new rooms while the previous one stood mostly empty,
 * and the minutes on screen stopped matching the minutes in the day.
 *
 * Minutes fill the blocks in order instead, spilling from one into the next.
 * Stopping and starting again continues exactly where it left off, which is what
 * a caregiver doing "a bit more" actually means; the blocks stay as the day's
 * planned shape rather than as a claim about which sitting was which.
 *
 * ## The rest
 *
 * - Blocks are sized by planned minutes via `flexGrow`, so the bar always spans
 *   its container while the blocks keep their relative lengths.
 * - The leading edge of `running` is drawn in a lighter tint with a live dot, so
 *   what is banked and what is accruing never read as the same thing.
 * - Minutes past the whole plan get extra blocks rather than being dropped:
 *   doing more than the day planned is a good outcome and the bar has to show
 *   it.
 * - Callers with no plan pass a single block — the day's target — so the bar
 *   still reads rather than collapsing to an empty track.
 */
export function SessionBar({
  planned,
  done,
  running = 0,
  complete = false,
  accent = 'var(--primary)',
  className,
}: {
  /** Minutes per session, in order, as the day program plans them. */
  planned: number[]
  /** Total minutes banked today. */
  done: number
  /** Minutes accruing in the session running right now. */
  running?: number
  complete?: boolean
  accent?: string
  className?: string
}) {
  const fill = complete ? 'var(--success)' : accent
  const banked = Math.max(0, done)
  const live = Math.max(0, running)

  // Blocks: the plan, plus whatever is needed to hold minutes beyond it. Extra
  // blocks take the plan's own typical length, so an overrun reads as "another
  // session's worth" rather than as a differently-shaped thing.
  const base = planned.filter((mins) => mins > 0)
  const typical = base.length ? base.reduce((a, b) => a + b, 0) / base.length : 5
  const plannedTotal = base.reduce((a, b) => a + b, 0)
  const overflow = Math.max(0, banked + live - plannedTotal)
  const blocks = [
    ...(base.length ? base : [typical]),
    ...Array.from({ length: Math.ceil(overflow / typical) }, () => typical),
  ]

  // Walk the blocks, drawing down the banked minutes first and then the live
  // ones — this is the whole fix: one continuous pour, not a block per session.
  let bankedLeft = banked
  let liveLeft = live
  const drawn = blocks.map((length, i) => {
    const solid = Math.min(bankedLeft, length)
    bankedLeft -= solid
    const running = Math.min(liveLeft, length - solid)
    liveLeft -= running
    return {
      i,
      length,
      solidPct: (solid / length) * 100,
      livePct: (running / length) * 100,
      touched: solid > 0 || running > 0,
      // The block the live edge is currently in — the only one that gets a dot.
      liveEdge: running > 0 && liveLeft === 0,
    }
  })

  return (
    <div className={cn('flex w-full items-center gap-1.5', className)}>
      {drawn.map((block) => (
        <div
          key={block.i}
          className="relative"
          // Named so the fill is assertable: "minutes pour across blocks" is the
          // rule this component exists for, and it is invisible to a text-based
          // test otherwise.
          data-slot="session-block"
          data-solid={Math.round(block.solidPct)}
          data-live={Math.round(block.livePct)}
          style={{ flexGrow: block.length, flexBasis: 0, minWidth: 6 }}
        >
          <div
            className={cn(
              'flex h-3.5 w-full overflow-hidden rounded-full',
              // Untouched: an outline, so it reads as room the plan has reserved
              // rather than as time that has somehow been spent.
              !block.touched && 'border border-dashed',
            )}
            style={{
              background: block.touched
                ? 'color-mix(in oklab, var(--muted-foreground) 24%, transparent)'
                : 'transparent',
              borderColor: block.touched
                ? undefined
                : `color-mix(in oklab, ${fill} 45%, transparent)`,
            }}
          >
            <div
              className="h-full transition-[width] duration-500 ease-out"
              style={{ width: `${block.solidPct}%`, background: fill }}
            />
            <div
              className="h-full transition-[width] duration-500 ease-out"
              style={{
                width: `${block.livePct}%`,
                background: `color-mix(in oklab, ${fill} 60%, transparent)`,
              }}
            />
          </div>

          {/* The live edge, outside the track's `overflow-hidden` — a dot centred
              on the leading edge is half outside the bar by definition, and
              clipping it leaves a half-moon. */}
          {block.liveEdge && (
            <span
              className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-out"
              style={{ left: `${block.solidPct + block.livePct}%` }}
            >
              <LiveDot className="size-2" color={fill} />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * How long the session currently being filled is *meant* to be, in minutes.
 *
 * The same walk the bar draws: pour `minutes` into the blocks in order and
 * report the length of the block the edge lands in. The running clock uses it to
 * read "01:12 / 05:00" rather than a bare elapsed time — the plan already says
 * how long this sitting should be, and the timer had no reason to keep it a
 * secret.
 *
 * Past the end of the plan it returns the plan's typical length, which is the
 * same length the bar gives its overflow blocks, so the two never disagree.
 */
export function plannedLengthAt(planned: number[], minutes: number): number {
  const base = planned.filter((mins) => mins > 0)
  if (!base.length) return 0
  const typical = base.reduce((a, b) => a + b, 0) / base.length
  let left = Math.max(0, minutes)
  for (const length of base) {
    // `<` not `<=`: landing exactly on a boundary means the block just finished,
    // so the session being timed is the next one.
    if (left < length) return length
    left -= length
  }
  return typical
}
