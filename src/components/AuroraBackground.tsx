import { useEffect, useRef, type CSSProperties } from 'react'

/**
 * Ambient aurora backdrop for the whole app.
 *
 * Five very large, very soft radial colour fields overlap and drift slowly, so
 * every page sits on a living wash of the active accent palette instead of a
 * flat `bg-background`. It is purely decorative: `aria-hidden`,
 * `pointer-events-none`, and `-z-10` so it never intercepts a tap and never
 * enters the accessibility tree.
 *
 * It is `fixed` rather than a page-level element for two reasons: the wash must
 * not scroll away on long documents (Wiki, Baby), and `Layout` mounts it exactly
 * once for the entire app, so it must survive route changes without being
 * re-painted per page. `body` sets `bg-background` and `html` sets no background,
 * so the body background propagates to the canvas and this `-z-10` layer paints
 * *above* that canvas but below all page content.
 *
 * Mounting contract: keep it a child of the shell root, and do not give any
 * ancestor a `transform`, `filter`, `perspective` or `contain` — those would
 * become the containing block for `position: fixed` and pin the aurora to that
 * box instead of the viewport. An ancestor stacking context (a positioned
 * ancestor with a `z-index`) would likewise trap the `-z-10` layer behind its
 * own content.
 *
 * Colour: every field is derived from the semantic palette tokens
 * (`--primary` / `--ring` / `--accent`) via `color-mix`, never a literal hex, so
 * it re-tints itself for the soft-blue ("boy") and soft-red ("girl") palettes
 * and for light vs dark with no JS. Because `--ring` currently resolves to the
 * same colour as `--primary` and `--accent` is a very low-chroma tint, hue
 * variety comes from a small per-field `hue-rotate()` nudge (±50°) applied to
 * the token colour rather than from extra hard-coded colours — the fields stay
 * analogous (blue → cyan/violet, red → coral/magenta) and still follow the
 * palette.
 *
 * Contrast: the whole layer is dimmed to `opacity-40` in light mode and
 * `opacity-90` in dark. Light mode needs the heavier reduction because the light
 * `--primary` is a dark saturated blue/red; left at full strength an overlap of
 * two fields would lift the page background enough to push page-level
 * `text-muted-foreground` (the deliberately darkened `oklch(0.53)`) below WCAG
 * AA. At 40% a single field peaks near 12% effective alpha, which keeps muted
 * body text above 4.5:1 while still reading as a clear tint. In dark mode the
 * palette `--primary` is a pale blue/pink over a near-black background, so it
 * can run near full strength and still leave light text far above AA.
 */

const FIELD_BLUR_PX = 70

type AuroraField = {
  /** React key; also names where the field is anchored. */
  key: string
  /** Anchoring + size. Sized in `vmax` so a field stays round-ish on a tall
   *  phone and on a wide desktop alike, and anchored with negative insets so
   *  the bright centre sits off-screen and only the soft tail is visible. */
  box: CSSProperties
  /** The field's centre colour, mixed down from a palette token. */
  color: string
  /** Degrees of hue nudge away from the token colour (see doc comment). */
  hue: number
  /** Transform waypoints for the drift, starting from the identity transform so
   *  the un-animated (reduced-motion) state is exactly the composed layout. */
  path: string[]
  /** One-way duration in ms; the animation alternates, so a full there-and-back
   *  cycle is twice this. All are 19s+ → 38s+ per cycle. */
  duration: number
}

/** Anchored so the five fields cover the viewport corners plus one drifting
 *  highlight through the middle. Durations are mutually indivisible so the
 *  fields fall out of phase within a few seconds instead of pulsing together,
 *  and the `path` directions differ so even the first pass looks uncoordinated. */
const AURORA_FIELDS: AuroraField[] = [
  {
    key: 'nw',
    box: { top: '-26vmax', left: '-20vmax', width: '80vmax', height: '68vmax' },
    color: 'color-mix(in oklab, var(--primary) 34%, transparent)',
    hue: 0,
    path: [
      'translate3d(0%, 0%, 0) scale(1)',
      'translate3d(7%, 5%, 0) scale(1.09)',
      'translate3d(11%, -3%, 0) scale(1.15)',
    ],
    duration: 19_000,
  },
  {
    key: 'ne',
    box: { top: '-18vmax', right: '-24vmax', width: '74vmax', height: '62vmax' },
    color: 'color-mix(in oklab, var(--primary) 30%, transparent)',
    hue: -30,
    path: [
      'translate3d(0%, 0%, 0) scale(1)',
      'translate3d(-6%, 8%, 0) scale(1.12)',
      'translate3d(-12%, 4%, 0) scale(1.05)',
    ],
    duration: 23_500,
  },
  {
    key: 'sw',
    box: { bottom: '-28vmax', left: '-22vmax', width: '86vmax', height: '70vmax' },
    color: 'color-mix(in oklab, var(--ring) 27%, transparent)',
    hue: 26,
    path: [
      'translate3d(0%, 0%, 0) scale(1)',
      'translate3d(9%, -6%, 0) scale(1.07)',
      'translate3d(4%, -11%, 0) scale(1.16)',
    ],
    duration: 27_000,
  },
  {
    key: 'se',
    box: { bottom: '-20vmax', right: '-18vmax', width: '72vmax', height: '62vmax' },
    // Blends the two accent-family tokens: `--accent` alone is a near-white tint
    // in light mode and a dark navy in dark mode, so it is anchored to
    // `--primary` to stay visible in both.
    color:
      'color-mix(in oklab, color-mix(in oklab, var(--accent) 55%, var(--primary)) 32%, transparent)',
    hue: 12,
    path: [
      'translate3d(0%, 0%, 0) scale(1)',
      'translate3d(-8%, -5%, 0) scale(1.13)',
      'translate3d(-3%, -10%, 0) scale(1.06)',
    ],
    duration: 21_500,
  },
  {
    key: 'mid',
    box: { top: '18%', left: '14%', width: '58vmax', height: '52vmax' },
    color: 'color-mix(in oklab, var(--primary) 22%, transparent)',
    hue: 48,
    path: [
      'translate3d(0%, 0%, 0) scale(1)',
      'translate3d(14%, 9%, 0) scale(1.18)',
      'translate3d(22%, -4%, 0) scale(1.1)',
    ],
    duration: 30_500,
  },
]

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function AuroraBackground() {
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([])

  // The drift is driven by the Web Animations API rather than a CSS animation:
  // Tailwind v4 here is CSS-first with no config file, and this component owns no
  // stylesheet, so declaring custom `@keyframes` would mean editing a global CSS
  // file. WAAPI keeps the whole effect self-contained, animates only `transform`
  // (compositor-only — no layout, no repaint of the blurred layer), and lets the
  // reduced-motion check react live to an OS setting change.
  //
  // Note the global `prefers-reduced-motion` rule in `src/index.css` neutralises
  // *CSS* animations only; WAAPI is unaffected by it, hence the explicit guard.
  useEffect(() => {
    const reduceMotion = window.matchMedia(REDUCED_MOTION)
    let animations: Animation[] = []

    const stop = () => {
      for (const animation of animations) animation.cancel()
      animations = []
    }

    /** (Re)start the drift, or leave every field at its static pose when the
     *  user has asked for reduced motion. */
    const sync = () => {
      stop()
      if (reduceMotion.matches) return
      AURORA_FIELDS.forEach((field, index) => {
        const el = fieldRefs.current[index]
        if (!el) return
        animations.push(
          el.animate(
            { transform: field.path },
            {
              duration: field.duration,
              direction: 'alternate',
              easing: 'ease-in-out',
              iterations: Infinity,
            },
          ),
        )
      })
    }

    sync()
    reduceMotion.addEventListener('change', sync)
    return () => {
      reduceMotion.removeEventListener('change', sync)
      stop()
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-40 dark:opacity-90"
      // `paint` containment clips the fields' blur haloes to the viewport and
      // isolates their painting from the rest of the document.
      style={{ contain: 'paint' }}
    >
      {AURORA_FIELDS.map((field, index) => (
        <div
          key={field.key}
          ref={(el) => {
            fieldRefs.current[index] = el
          }}
          className="absolute"
          style={{
            ...field.box,
            background: `radial-gradient(ellipse closest-side, ${field.color} 0%, transparent 76%)`,
            filter: `blur(${FIELD_BLUR_PX}px) hue-rotate(${field.hue}deg)`,
            // Promote once: the blurred gradient is painted a single time and
            // only re-composited as it drifts.
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
