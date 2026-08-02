/**
 * A running clock, as a stopwatch reads.
 *
 * **Why not `formatDuration`.** That one writes a *quantity* — `1h 20m`, `45min`
 * — and it is right for every number the app reports: today's total, the longest
 * nap, how long ago the last feed was. This one writes a *clock*, for the one
 * situation where the number is still moving, and the two are different jobs.
 * A duration rounded to the minute is honest about a finished sleep and useless
 * on a timer you have just started, which sat on `0min` for sixty seconds and
 * gave no sign it was counting at all.
 *
 * Seconds always, hours only when there are any: `04:31`, then `1:04:31`. The
 * minute field is zero-padded so the digits do not jump width as it ticks, and
 * the hour field is not, because a leading `0` on an hour that is only there
 * once you have passed one reads as a placeholder for something.
 */
export function formatClock(totalSeconds: number): string {
  const t = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
