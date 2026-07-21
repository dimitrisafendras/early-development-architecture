import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const glassButtonVariants = cva(
  // Capsule button built on the glass material. Focus ring uses the active palette.
  'ds-glass relative inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap outline-none transition-[transform,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        /** Neutral glass — inherits body foreground text. */
        neutral: 'text-foreground',
        /** Primary-tinted glass — tint applied via .ds-glass[data-tone='primary']
         *  in ds.css (unlayered, so a Tailwind utility can't win against the
         *  material's own background declaration). */
        primary: 'text-primary-foreground',
      },
      size: {
        sm: 'h-8 px-3.5 text-xs',
        default: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  variant?: 'regular' | 'clear'
  /**
   * Render as a different element (e.g. a react-router `<Link />` or an `<a>`)
   * while keeping the glass styling and layer composition. Base-ui-style API.
   */
  render?: React.ReactElement<Record<string, unknown>>
}

/**
 * GlassButton — a capsule control on the Liquid Glass material.
 * Renders the highlight + illumination layers so it reads as real glass, and
 * respects the reduced-transparency fallback inherited from `.ds-glass`.
 */
export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, tone, size, variant = 'regular', render, children, ...props }, ref) => {
    const inner = (
      <>
        <span className="ds-glass__illumination" aria-hidden="true" />
        <span className="ds-glass__highlight" aria-hidden="true" />
        <span className="ds-glass__content inline-flex items-center justify-center gap-2">{children}</span>
      </>
    )

    const sharedProps = {
      'data-slot': 'glass-button',
      'data-variant': variant,
      'data-tone': tone ?? 'neutral',
      'data-interactive': 'true',
      className: cn(glassButtonVariants({ tone, size }), className),
    }

    if (render) {
      return React.cloneElement(
        render,
        {
          ...sharedProps,
          className: cn(sharedProps.className, render.props.className as string | undefined),
        },
        inner
      )
    }

    return (
      <button ref={ref} {...sharedProps} {...props}>
        {inner}
      </button>
    )
  }
)
GlassButton.displayName = 'GlassButton'

export { glassButtonVariants }
