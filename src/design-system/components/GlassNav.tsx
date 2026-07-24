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
  activeHref,
  renderLink,
  menuLabelOpen = 'Open menu',
  menuLabelClose = 'Close menu',
  sectionsLabel = 'Sections',
  className,
}: GlassNavProps) {
  const [open, setOpen] = React.useState(false)
  // At the top of the page the bar is flush/edge-to-edge; once scrolled it
  // morphs into the floating rounded capsule — but only from `sm` up. On a
  // phone the capsule would give up ~24px of an already scarce line to side
  // gutters, so the bar stays edge-to-edge at every scroll position.
  const [scrolled, setScrolled] = React.useState(false)
  // Track the viewport width so the top state can be genuinely edge-to-edge on
  // any screen, while still animating to a fixed px width (smooth, no snap).
  const [vw, setVw] = React.useState(() =>
    typeof document !== 'undefined' ? document.documentElement.clientWidth : 1600,
  )
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    const onResize = () => setVw(document.documentElement.clientWidth)
    onScroll()
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

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

  // The floating-capsule geometry (side gutters, capped width, rounded corners)
  // is driven from JS because the radius and max-width animate as px values, so
  // it needs the same `sm` cutoff the Tailwind classes use. Below it the bar is
  // a flush edge-to-edge bar no matter the scroll position.
  const SM = 640
  const floating = scrolled && vw >= SM

  const ease = '[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]'
  return (
    <div
      ref={rootRef}
      // `viewport-fit=cover` lets the page paint under the notch, so the bar has
      // to add the insets back itself — otherwise the brand and the hamburger
      // sit beneath the status bar in an installed iOS PWA, and one edge is
      // clipped in landscape. The gutter travels through `--nav-pad-x` so the
      // responsive part stays in Tailwind while env() stays in the style prop
      // (media queries can't live in an inline style).
      style={{
        paddingTop: floating
          ? 'calc(0.75rem + env(safe-area-inset-top))'
          : 'env(safe-area-inset-top)',
        paddingLeft: 'max(var(--nav-pad-x), env(safe-area-inset-left))',
        paddingRight: 'max(var(--nav-pad-x), env(safe-area-inset-right))',
      }}
      className={cn(
        'sticky top-0 z-50 transition-[padding] duration-500',
        ease,
        // `--nav-pad-x` stays 0 below `sm` even when scrolled, so the phone bar
        // never gains side gutters.
        scrolled ? '[--nav-pad-x:0px] sm:[--nav-pad-x:1.25rem]' : '[--nav-pad-x:0px]',
        className,
      )}
    >
      <div
        // Top = full viewport width (edge-to-edge on any screen); scrolled =
        // the content width (max-w-7xl = 1280px) so the capsule lines up with
        // the page content. Both px so max-width eases smoothly (no snap).
        style={{ maxWidth: floating ? 1280 : vw }}
        className={cn('relative mx-auto w-full transition-[max-width] duration-500', ease)}
      >
        <GlassSurface
          radius={floating ? 26 : 0}
          className={cn(
            'border-b transition-[border-radius,border-color,padding,box-shadow] duration-500',
            ease,
            // A flush bar keeps its hairline so it separates from the content
            // scrolling beneath; the floating capsule doesn't need one.
            floating ? 'border-transparent px-3 py-2 sm:px-5' : 'border-border/50 px-4 py-2.5 sm:px-6',
          )}
          role="banner"
        >
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
                      {renderNavLink({
                        link,
                        active,
                        onNavigate: () => setOpen(false),
                        className: cn(
                          'block whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                          active
                            ? 'bg-primary/15 text-foreground'
                            : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                        ),
                      })}
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}
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
