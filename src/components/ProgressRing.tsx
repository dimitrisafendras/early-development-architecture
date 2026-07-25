interface Props {
  /** 0–1 fraction filled. */
  progress: number
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
  size = 220,
  stroke = 14,
  complete = false,
  accent = 'var(--primary)',
  children,
}: Props) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))
  const offset = circumference * (1 - clamped)
  // An SVG `stroke` needs a real colour value, so this takes the custom property
  // directly — the same idiom as the `accent` default above.
  const fill = complete ? 'var(--success)' : accent
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      {complete && (
        <span
          className="pointer-events-none absolute rounded-full ring-2 ring-success/50 motion-safe:animate-ping"
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
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
