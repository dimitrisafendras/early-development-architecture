import * as React from 'react'

import { cn } from '@/lib/utils'

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `regular` (default) — adaptive, legible over any content.
   * `clear` — more transparent; only over bright media, may need a scrim.
   */
  variant?: 'regular' | 'clear'
  /** Enables the hover lensing shift (lift + saturation bump). */
  interactive?: boolean
  /** Corner radius in px. Pass the outer radius; nest with `--inset` for concentric children. */
  radius?: number
}

/**
 * GlassSurface — the core Liquid Glass material.
 *
 * Renders the three conceptual layers Apple describes:
 *   1. highlight     — specular light cast on the top edge (`.ds-glass__highlight`)
 *   2. illumination  — adaptive interior glow / lensing (`.ds-glass__illumination`)
 *   3. shadow        — depth separation from the background (box-shadow on root)
 *
 * The material itself (blur + saturate + adaptive tint) lives on the root so the
 * backdrop lenses the content behind it. Accessibility fallbacks for reduced
 * transparency / motion are handled in `ds.css`.
 */
export const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ variant = 'regular', interactive = false, radius, className, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="glass-surface"
        data-variant={variant}
        data-interactive={interactive || undefined}
        className={cn('ds-glass', className)}
        style={{ ...(radius != null ? { ['--ds-glass-radius' as string]: `${radius}px` } : {}), ...style }}
        {...props}
      >
        <span className="ds-glass__illumination" aria-hidden="true" />
        <span className="ds-glass__highlight" aria-hidden="true" />
        <div className="ds-glass__content">{children}</div>
      </div>
    )
  }
)
GlassSurface.displayName = 'GlassSurface'
