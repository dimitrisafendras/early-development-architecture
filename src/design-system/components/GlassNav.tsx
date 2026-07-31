import * as React from 'react'
import { Menu, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { GlassSurface } from './GlassSurface'

export interface GlassNavLink {
  href: string
  label: string
}

export interface GlassNavLinkRenderArgs {
  link: GlassNavLink
  active: boolean
  className: string
  /** Call on activation so the mobile dropdown can close itself. */
  onNavigate: () => void
}

export interface GlassNavProps {
  brand: React.ReactNode
  links?: GlassNavLink[]
  /** Controls slot (theme / palette / language switchers, cross-route link). */
  actions?: React.ReactNode
  /**
   * Controls rendered inside the collapsed dropdown instead of `actions`.
   * The inline row is icon-dense because horizontal space is scarce; the
   * dropdown has room for full labels and taller touch targets, so consumers
   * pass a purpose-built layout rather than reusing the cramped inline one.
   * Falls back to `actions` when omitted.
   */
  mobileActions?: React.ReactNode
  /**
   * Controls that stay in the bar row at *every* breakpoint, between the brand
   * and the section links. For the few controls that carry live state a user
   * must be able to see without opening anything — a notification count, say —
   * since `actions` is desktop-only and `mobileActions` is hidden behind the
   * hamburger.
   */
  inlineActions?: React.ReactNode
  /** Currently-active anchor href, for link highlighting. */
  activeHref?: string
  /**
   * Custom renderer for each section link. Lets a router-driven consumer emit
   * a client-side `<Link>` while keeping GlassNav itself router-agnostic.
   * Defaults to a plain `<a href>`.
   */
  renderLink?: (args: GlassNavLinkRenderArgs) => React.ReactNode
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
  mobileActions,
  inlineActions,
  activeHref,
  renderLink,
  menuLabelOpen = 'Open menu',
  menuLabelClose = 'Close menu',
  sectionsLabel = 'Sections',
  className,
}: GlassNavProps) {
  const [open, setOpen] = React.useState(false)
  // The bar keeps one consistent form at every scroll position — a flush,
  // edge-to-edge glass bar. It deliberately does not morph/resize on scroll.

  const defaultRenderLink =({ link, active, className: cls, onNavigate }: GlassNavLinkRenderArgs) => (
    <a
      href={link.href}
      aria-current={active ? 'true' : undefined}
      onClick={onNavigate}
      className={cls}
    >
      {link.label}
    </a>
  )
  const renderNavLink = renderLink ?? defaultRenderLink
  const rootRef = React.useRef<HTMLDivElement>(null)
  const menuId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element | null
      // Popovers and menus opened *from* the dropdown (settings, account) are
      // portalled to the end of <body>, so they are not DOM descendants of
      // rootRef. Without this guard, tapping into one of them reads as an
      // outside tap, collapses the dropdown, and unmounts the popover mid-use —
      // which made the sign-in form impossible to fill in on a phone.
      if (target?.closest?.('[data-slot^="popover"], [role="dialog"], [role="menu"]')) return
      if (rootRef.current && target && !rootRef.current.contains(target)) setOpen(false)
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
  const collapsible = hasLinks || Boolean(actions) || Boolean(mobileActions)

  return (
    <div
      ref={rootRef}
      // `viewport-fit=cover` lets the page paint under the notch, so the bar adds
      // the insets back itself — otherwise the brand/hamburger sit beneath the
      // status bar in an installed iOS PWA and one edge clips in landscape.
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
      className={cn('sticky top-0 z-50', className)}
    >
      <div className="relative mx-auto w-full">
        <GlassSurface radius={0} className="border-b border-border/50 px-4 py-2.5 sm:px-6" role="banner">
          {/* A single bar row: brand (left) + section links + controls (right).
              GlassSurface nests children in `.ds-glass__content`. */}
          <div className="flex items-center gap-2 sm:gap-4">
            {collapsible && (
              <button
                type="button"
                aria-label={open ? menuLabelClose : menuLabelOpen}
                aria-expanded={open}
                aria-controls={menuId}
                aria-haspopup="menu"
                onClick={() => setOpen((v) => !v)}
                className="-ml-1 grid size-11 shrink-0 place-items-center rounded-full text-foreground/80 transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 active:bg-foreground/10 sm:ml-0 sm:size-9 xl:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            )}

            {/* `flex-1` (not `shrink-0`) so a brand slot that carries a context
                strip alongside the wordmark can claim the leftover width and
                truncate inside it, instead of pushing the controls off-screen. */}
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-0.5 font-heading text-sm font-semibold tracking-tight sm:pl-1">
              {brand}
            </div>

            {/* Always-visible controls — the brand's `flex-1` has already pushed
                them to the trailing edge, so no `ml-auto` is needed. */}
            {inlineActions && (
              <div className="flex shrink-0 items-center gap-0.5">{inlineActions}</div>
            )}

            {/* Section links — inline in the same row on `xl+`, collapsed into the
                dropdown below that. */}
            {hasLinks && (
              <nav
                aria-label={sectionsLabel}
                className="ml-auto hidden shrink-0 items-center gap-0.5 xl:flex"
              >
                {links.map((link) => {
                  const active = activeHref === link.href
                  return (
                    <React.Fragment key={link.href}>
                      {renderNavLink({
                        link,
                        active,
                        onNavigate: () => setOpen(false),
                        className: cn(
                          'block whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                          active
                            ? 'bg-primary/15 text-foreground'
                            : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground',
                        ),
                      })}
                    </React.Fragment>
                  )
                })}
              </nav>
            )}

            {/* Controls: inline on desktop, collapsed into the dropdown on mobile. */}
            {actions && (
              <div
                className={cn(
                  'hidden shrink-0 items-center gap-1.5 sm:gap-2 xl:flex',
                  !hasLinks && 'ml-auto',
                  hasLinks && 'border-l border-foreground/10 pl-2 sm:pl-3',
                )}
              >
                {actions}
              </div>
            )}
            {!actions && !hasLinks && !inlineActions && <div className="ml-auto" />}
          </div>
        </GlassSurface>

        {/* Mobile / tablet dropdown — opaque popover for guaranteed legibility.
            Capped to the dynamic viewport height and scrollable, so a long link
            list stays reachable on a short phone in landscape. */}
        {collapsible && open && (
          <div
            id={menuId}
            className="absolute inset-x-0 top-full z-50 mt-2 max-h-[calc(100dvh-8rem)] origin-top overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0/0.20),0_4px_12px_rgb(0_0_0/0.12)] xl:hidden"
          >
            {(mobileActions ?? actions) && (
              <div className="border-b border-border pb-3">{mobileActions ?? actions}</div>
            )}
            {hasLinks && (
              <ul
                className={cn(
                  'grid grid-cols-2 gap-1 sm:grid-cols-3',
                  (mobileActions ?? actions) && 'pt-3',
                )}
              >
                {links.map((link) => {
                  const active = activeHref === link.href
                  return (
                    <li key={link.href}>
                      {renderNavLink({
                        link,
                        active,
                        onNavigate: () => setOpen(false),
                        className: cn(
                          'flex min-h-11 items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                          active
                            ? 'bg-primary/15 text-foreground'
                            : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10'
                        ),
                      })}
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
