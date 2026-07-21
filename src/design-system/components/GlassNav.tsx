import * as React from 'react'

import { cn } from '@/lib/utils'
import { GlassSurface } from './GlassSurface'

export interface GlassNavLink {
  href: string
  label: string
}

export interface GlassNavProps {
  brand: React.ReactNode
  links?: GlassNavLink[]
  /** Right-aligned controls slot (theme / palette switchers, back link). */
  actions?: React.ReactNode
  /** Currently-active anchor href, for link highlighting. */
  activeHref?: string
  className?: string
}

/**
 * GlassNav — a floating capsule navigation bar on the Liquid Glass material.
 * Belongs to the control layer that floats above content (never a content
 * surface). Sticky positioning is included; the page supplies brand/links/actions.
 */
export function GlassNav({ brand, links = [], actions, activeHref, className }: GlassNavProps) {
  return (
    <div className={cn('sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4', className)}>
      <GlassSurface
        radius={9999}
        className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4"
        role="banner"
      >
        <div className="flex min-w-0 shrink-0 items-center gap-2 pl-1 font-heading text-sm font-semibold tracking-tight">
          {brand}
        </div>

        {links.length > 0 && (
          <nav aria-label="Sections" className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center gap-1">
              {links.map((link) => {
                const active = activeHref === link.href
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                        active
                          ? 'bg-primary/15 text-foreground'
                          : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
      </GlassSurface>
    </div>
  )
}
