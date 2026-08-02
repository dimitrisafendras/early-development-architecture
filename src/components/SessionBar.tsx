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
      // A hair's worth is not a session. Filling a block *exactly* leaves float
      // dust in the next one, which drew it as a started block rather than as
      // one still to come — the plan losing an outline for a thousandth of a
      // minute.
      touched: solid > 0.01 || running > 0.01,
      // A block whose planned minutes are banked in full. Same epsilon, other
      // end: pouring 5.0 minutes into a 5-minute block can leave 4.999 behind.
      filled: solid >= length - 0.01,
      // The block the live edge is currently in — the only one that gets a dot.
      liveEdge: running > 0 && liveLeft === 0,
    }
  })

  return (
    <div className={cn('flex w-full items-center gap-1.5', className)}>
      {drawn.map((block) => {
        // A session that filled its planned minutes goes green on its own,
        // without waiting for the whole day. Three blocks all in the accent
        // said only "some progress"; the caregiver's actual question at a
        // glance is *which* of the planned sessions are behind them, and the
        // caption's "1 of 3" was the only thing answering it.
        const blockFill = block.filled ? 'var(--success)' : fill
        return (
          <div
            key={block.i}
            className="relative"
            // Named so the fill is assertable: "minutes pour across blocks" is
            // the rule this component exists for, and it is invisible to a
            // text-based test otherwise.
            data-slot="session-block"
            data-solid={Math.round(block.solidPct)}
            data-live={Math.round(block.livePct)}
            data-filled={block.filled ? '' : undefined}
            style={{ flexGrow: block.length, flexBasis: 0, minWidth: 6 }}
          >
            <div
              className={cn(
                'flex h-3.5 w-full overflow-hidden rounded-full',
                // Untouched: an outline, so it reads as room the plan has
                // reserved rather than as time that has somehow been spent.
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
                style={{ width: `${block.solidPct}%`, background: blockFill }}
              />
              <div
                className="h-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${block.livePct}%`,
                  background: `color-mix(in oklab, ${fill} 60%, transparent)`,
                }}
              />
            </div>

            {/* The live edge, outside the track's `overflow-hidden` — a dot
                centred on the leading edge is half outside the bar by
                definition, and clipping it leaves a half-moon. */}
            {block.liveEdge && (
              <span
                className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-out"
                style={{ left: `${block.solidPct + block.livePct}%` }}
              >
                <LiveDot className="size-2" color={fill} />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Where `minutes` lands in the planned blocks: which block, how long that block
 * is, and how far into it we already are.
 *
 * The same walk the bar draws, which is the point — the readout and the bar have
 * to agree about which session is being timed and how much of it is already
 * done. The clock uses `into` so that stopping and starting again *resumes*:
 * before this it restarted at 00:00 on every press while the bar carried on from
 * where it left off, so the two disagreed by exactly the minutes already banked.
 *
 * Past the end of the plan it reports the plan's typical length — the same
 * length the bar gives its overflow blocks.
 */
export function blockAt(
  planned: number[],
  minutes: number,
): { length: number; into: number } {
  const base = planned.filter((mins) => mins > 0)
  if (!base.length) return { length: 0, into: 0 }
  const typical = base.reduce((a, b) => a + b, 0) / base.length
  let left = Math.max(0, minutes)
  for (const length of base) {
    // `<` not `<=`: landing exactly on a boundary means that block just filled,
    // so the session being timed is the next one, at zero.
    if (left < length) return { length, into: left }
    left -= length
  }
  return { length: typical, into: left % typical }
}

/**
 * How many of the planned sessions the banked minutes have actually completed.
 *
 * Counting *sittings* instead produced "5 of 3 sessions planned": press Start
 * and Stop five times and you have five sittings, but the plan still says three
 * sessions and the bar still shows how full they are. The two readings measured
 * different things — one the button, one the day — and only the second is what
 * the caption claims to be about.
 *
 * Stops at the plan's length: minutes beyond it are drawn as extra blocks on the
 * bar, and "4 of 3" would be the same category error in the other direction.
 */
export function filledBlocks(planned: number[], minutes: number): number {
  let left = Math.max(0, minutes)
  let filled = 0
  for (const length of planned.filter((mins) => mins > 0)) {
    if (left < length) break
    left -= length
    filled += 1
  }
  return filled
}
