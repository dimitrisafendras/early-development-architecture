interface Props {
  /** 0–1 fraction filled. */
  progress: number
  /**
   * A second, larger fraction: what the ring will read once whatever is
   * happening right now finishes. Drawn as a translucent arc beyond the solid
   * one, with a dot at its head.
   *
   * The tracker needs it because its ring plots the day while its clock counts
   * the session, so at the moment anyone is actually watching, the needle and
   * the readout measured two different things. With this the solid arc is
   * always minutes banked, the ghost is the minutes accruing, and stopping the
   * timer sweeps one over the other.
   */
  live?: number
  size?: number
  stroke?: number
  /** Target reached — turn the ring green and pulse to celebrate. */
  complete?: boolean
  /** Fill colour for the in-progress arc. Any CSS colour; defaults to the
   *  palette primary. Use to match a specific activity's hue. */
  accent?: string
  children?: React.ReactNode
}

/**
 * A palette-tinted circular progress ring. Track + fill use theme tokens
 * (`--muted` / `--primary`) so it adapts to both themes and both palettes.
 * Once `complete`, the fill turns success-green and a soft ring pulses out.
 *
 * The completed arc is `var(--success)`, not a literal green: as a hard-coded
 * `#10b981` it was the same emerald in both themes and only reached 2.54:1
 * against a light card — under the 3:1 WCAG 1.4.11 floor for a meaningful
 * graphic. The token is theme-aware (5.67:1 light / 7.70:1 dark) and, being a
 * semantic state, stays green in both palettes.
 */
export function ProgressRing({
  progress,
  live,
  size = 220,
  stroke = 14,
  complete = false,
  accent = 'var(--primary)',
  children,
}: Props) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamp = (n: number) => Math.max(0, Math.min(1, n))
  const clamped = clamp(progress)
  const offset = circumference * (1 - clamped)
  // An SVG `stroke` needs a real colour value, so this takes the custom property
  // directly — the same idiom as the `accent` default above.
  const fill = complete ? 'var(--success)' : accent

  // Never behind the solid arc: `live` is by definition "this and a bit more",
  // and a ghost that fell short would draw a gap in the middle of the fill.
  const liveClamped = live == null ? null : Math.max(clamped, clamp(live))
  // The head of the ghost arc. The `<svg>` is rotated a quarter turn, so angle 0
  // here lands at twelve o'clock like the arcs do — no separate correction.
  const tip =
    liveClamped != null && liveClamped > 0
      ? {
          x: size / 2 + radius * Math.cos(2 * Math.PI * liveClamped),
          y: size / 2 + radius * Math.sin(2 * Math.PI * liveClamped),
        }
      : null

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      {complete && (
        // Three pulses, not forever. A celebration that never ends stops being
        // one by the afternoon, and on a page where a session may still be
        // running it competes with the live badge for the eye.
        <span
          className="pointer-events-none absolute rounded-full ring-2 ring-success/50 motion-safe:animate-ping [animation-iteration-count:3]"
          style={{ width: size, height: size }}
          aria-hidden
        />
      )}
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          // Mixed from the foreground rather than flat `--muted`: on the tinted
          // cards the ring sits on (the moment card, the timer console) a `--muted`
          // track all but disappears, so a ring at 0% read as a ghost.
          stroke="color-mix(in oklab, var(--muted-foreground) 24%, transparent)"
          strokeWidth={stroke}
        />
        {/* The ghost, under the solid arc so the two share a head cleanly.
            Mixed off `fill` rather than given a colour of its own, so it follows
            the palette and turns green with the ring on target-met.

            60%, measured rather than picked. The ghost has to separate from two
            things at once — the track it lies on and the solid arc it continues
            — and those pull opposite ways: at 45% it was 1.4:1 against the track
            (all but invisible), at 70% it collapses toward the solid at 1.7:1.
            60% maximises the weaker of the two in all four theme × palette
            combinations (~1.8:1 track / ~2.0:1 solid).

            It does not reach 3:1 against the card, and no value can: a colour
            sitting between the track and the fill is low-contrast against both
            by construction. That is why the **tip** below is solid `fill` —
            4.9:1 light, 7.3:1 dark — so the head of the live arc, which is the
            part that carries meaning, is the part that meets WCAG 1.4.11. The
            ghost is supplementary shading; the minutes it represents are stated
            as text by the clock inside the ring and by the tile above it. */}
        {liveClamped != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`color-mix(in oklab, ${fill} 60%, transparent)`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - liveClamped)}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
          />
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fill}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
        />
        {/* The head of the live arc, solid. Deliberately static: the badge
            beside the ring is already the one thing on the page that pulses, and
            two movers cancel each other out. */}
        {tip && (
          <circle
            cx={tip.x}
            cy={tip.y}
            r={stroke / 2 + 2}
            fill={fill}
            style={{ transition: 'cx 0.5s ease, cy 0.5s ease, fill 0.4s ease' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
