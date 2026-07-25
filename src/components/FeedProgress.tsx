import { cn } from '@/lib/utils'
import { useT } from '../i18n'

/**
 * Today's feed count against the typical range for the baby's age band — one
 * line and a hairline bar.
 *
 * **Why this file exists.** The same readout was written twice, from the same
 * maths, and had already drifted: the `/feed` input card rendered the count at
 * `text-lg` with a `mt-3` bar and *no* status line, while the Day page's feed
 * tool rendered it at `text-2xl` with a `mt-2`, 2.5px bar *and* the status. Same
 * numbers, same thresholds, two spellings — so the on-track sentence appeared on
 * one screen and not the other, and the number changed size between them for no
 * reason. This is the single spelling; both call sites render it.
 *
 * **One size, deliberately.** The two call sites do not need different scales:
 * in both, this is the supporting readout that sits directly above the same
 * `AddFeedForm` and explains *why* you would log a feed — it is never the thing
 * you came to do, so it never wants a hero number. `text-2xl` also collided with
 * the moment card's own 24px title on the Day page. Hence no `size` / `compact`
 * prop: the smaller of the two scales, everywhere.
 *
 * **Accessibility.** The line is the accessible statement ("3 / ~5–7 feeds",
 * then the status); the bar is `aria-hidden` because it says nothing the line
 * has not already said.
 *
 * Flat by design — it sits inside a content card, and cards never stack.
 */
export function FeedProgress({
  /** Feeds logged today. */
  count,
  /** Typical `[min, max]` feeds/24h for the age band, or `null` when the age is
   *  unknown (no baby yet) — then it degrades to the bare count, no comparison. */
  range,
}: {
  count: number
  range: [number, number] | null
}) {
  const tf = useT().feed
  const state = !range ? null : count < range[0] ? 'below' : count > range[1] ? 'above' : 'on'
  const status =
    state === 'below' ? tf.progressBelow : state === 'above' ? tf.progressAbove : state === 'on' ? tf.progressOnTrack : null
  // Scale so the typical zone and current count always fit with headroom.
  const scaleMax = Math.max(range ? range[1] + 2 : 0, count + 1, 1)
  const p = (v: number) => Math.min(100, (v / scaleMax) * 100)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        {/* The count and the range say what a title would have said, so there is
            no title. */}
        <p className="font-heading text-sm text-muted-foreground">
          <span className="text-lg font-semibold tabular-nums text-foreground">{count}</span>
          {range && (
            <>
              {' / ~'}
              {range[0]}–{range[1]}
            </>
          )}{' '}
          {tf.progressFeeds}
        </p>
        {status && (
          <p
            className={cn(
              'text-xs',
              // Semantic tokens, so both palettes × both themes are handled and
              // the status text carries the same colour as the bar's fill.
              state === 'on' ? 'text-success' : state === 'above' ? 'text-warning' : 'text-muted-foreground',
            )}
          >
            {status}
          </p>
        )}
      </div>
      {range && (
        <div aria-hidden className="relative mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          {/* The typical zone, as a tint behind the fill. */}
          <div
            className="absolute inset-y-0 bg-primary/20"
            style={{ left: `${p(range[0])}%`, width: `${p(range[1]) - p(range[0])}%` }}
          />
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              state === 'on' ? 'bg-success' : state === 'above' ? 'bg-warning' : 'bg-primary',
            )}
            style={{ width: `${p(count)}%` }}
          />
        </div>
      )}
    </div>
  )
}
