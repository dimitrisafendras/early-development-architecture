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
  const fill = complete ? '#10b981' : accent
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      {complete && (
        <span
          className="pointer-events-none absolute rounded-full ring-2 ring-emerald-500/50 motion-safe:animate-ping"
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
          stroke="var(--muted)"
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
