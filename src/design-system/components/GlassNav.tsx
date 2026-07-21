import * as React from 'react'
import { Menu, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { GlassSurface } from './GlassSurface'

export interface GlassNavLink {
  href: string
  label: string
}

export interface GlassNavProps {
  brand: React.ReactNode
  links?: GlassNavLink[]
  /** Controls slot (theme / palette / language switchers, cross-route link). */
  actions?: React.ReactNode
  /** Currently-active anchor href, for link highlighting. */
  activeHref?: string
  /** Accessible label for the mobile menu button. */
  menuLabelOpen?: string
  menuLabelClose?: string
  /** Accessible label for the section-links nav landmark. */
  sectionsLabel?: string
  className?: string
}

/**
 * GlassNav — a floating capsule navigation bar on the Liquid Glass material.
 * Belongs to the control layer that floats above content.
 *
 * Responsive: on `lg+` the section links and the controls render inline. Below
 * that they collapse into a single accessible dropdown (hamburger) — the
 * controls sit at the top, the section links below — so the bar stays a clean
 * single row on phones no matter how many switchers are present.
 */
export function GlassNav({
  brand,
  links = [],
  actions,
  activeHref,
  menuLabelOpen = 'Open menu',
  menuLabelClose = 'Close menu',
  sectionsLabel = 'Sections',
  className,
}: GlassNavProps) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const menuId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const hasLinks = links.length > 0
  const collapsible = hasLinks || Boolean(actions)

  return (
    <div ref={rootRef} className={cn('sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4', className)}>
      <div className="relative mx-auto max-w-6xl">
        <GlassSurface radius={26} className="px-3 py-2 sm:px-5" role="banner">
          {/* Tier 1: brand (left) + controls (right). GlassSurface nests
              children in `.ds-glass__content`. */}
          <div className="flex items-center gap-2 sm:gap-4">
            {collapsible && (
              <button
                type="button"
                aria-label={open ? menuLabelClose : menuLabelOpen}
                aria-expanded={open}
                aria-controls={menuId}
                aria-haspopup="menu"
                onClick={() => setOpen((v) => !v)}
                className="grid size-9 shrink-0 place-items-center rounded-full text-foreground/80 transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 xl:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            )}

            <div className="flex min-w-0 shrink-0 items-center gap-2 pl-0.5 font-heading text-sm font-semibold tracking-tight sm:pl-1">
              {brand}
            </div>

            {/* Controls: inline on desktop, collapsed into the dropdown on mobile. */}
            {actions && (
              <div className="ml-auto hidden shrink-0 items-center gap-1.5 sm:gap-2 xl:flex">
                {actions}
              </div>
            )}
            {!actions && hasLinks && <div className="ml-auto" />}
          </div>

          {/* Tier 2 (desktop): centered section links under a hairline divider.
              Deliberate second row — long localized labels (e.g. Greek) wrap
              symmetrically instead of distorting the bar. */}
          {hasLinks && (
            <nav aria-label={sectionsLabel} className="hidden xl:block">
              <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 border-t border-foreground/10 pt-2">
                {links.map((link) => {
                  const active = activeHref === link.href
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'block whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
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
        </GlassSurface>

        {/* Mobile / tablet dropdown — opaque popover for guaranteed legibility. */}
        {collapsible && open && (
          <div
            id={menuId}
            className="absolute inset-x-0 top-full z-50 mt-2 origin-top rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0/0.20),0_4px_12px_rgb(0_0_0/0.12)] xl:hidden"
          >
            {actions && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
                {actions}
              </div>
            )}
            {hasLinks && (
              <ul className={cn('grid grid-cols-2 gap-1 sm:grid-cols-3', actions && 'pt-3')}>
                {links.map((link) => {
                  const active = activeHref === link.href
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={active ? 'true' : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                          active
                            ? 'bg-primary/15 text-foreground'
                            : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                        )}
                      >
                        {link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
