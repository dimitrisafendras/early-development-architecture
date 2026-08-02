import { Link, useLocation } from 'react-router-dom'
import { GlassSurface } from '@dimitrisafendras/liquid-glass'
import { cn } from '@/lib/utils'
import { appAreas } from '../lib/appAreas'
import { useT } from '../i18n'

/**
 * Mobile bottom tab bar — the primary navigation on phones, where reaching a
 * hamburger at the top of the screen one-handed (usually while holding a baby)
 * is the worst possible ask. Visible right up to `xl`, which is exactly where
 * the top nav stops collapsing and renders its links inline — so there is no
 * band where navigation is hamburger-only.
 *
 * Floating capsule on the Liquid Glass material, matching the scrolled top nav.
 * Sits above the home-indicator inset; `.pb-bottom-nav` on the app shell
 * reserves the matching space so page content is never trapped underneath.
 */
export function BottomNav() {
  const t = useT()
  const { pathname } = useLocation()
  // -1 on the routes that aren't tabs (`/wiki`, `/design-system`, the auth
  // pages), where no tab is lit and the indicator stays out of the way.
  const activeIndex = appAreas.findIndex((a) => a.to === pathname)

  return (
    <nav
      aria-label={t.nav.appAreas}
      // Phones get a flush edge-to-edge bar: the five tabs each gain ~5px of
      // width back, and a full-bleed bar reads as system chrome rather than as
      // a floating widget. The safe-area inset moves *inside* the surface so
      // the glass reaches the screen edge under the home indicator. From `sm`
      // up it becomes the floating capsule that matches the scrolled top nav.
      className="fixed inset-x-0 bottom-0 z-40 sm:px-3 sm:pb-[max(0.5rem,env(safe-area-inset-bottom))] xl:hidden"
    >
      {/* The radius travels through `--ds-glass-radius` as classes rather than
          GlassSurface's `radius` prop: that prop writes an inline style, which a
          `sm:` utility could never override. */}
      <GlassSurface className="border-t border-border/50 px-1.5 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] [--ds-glass-radius:0px] sm:mx-auto sm:max-w-md sm:border-t-0 sm:p-1.5 sm:pb-1.5 sm:[--ds-glass-radius:26px]">
        {/* **The column count comes from the list, not from a literal.**
            It was `grid-cols-5` against six areas, so the sixth tab (Family)
            dropped onto a second row the moment the sleep log added itself to
            `appAreas` — half a bar's worth of glass below the other five, with
            the sliding indicator still measuring itself in sixths and landing
            on nothing. A tab bar's whole job is to be one row of equal targets.
            An inline `gridTemplateColumns` rather than a `grid-cols-${n}` class
            because Tailwind generates from source text and cannot see a value
            computed at runtime. */}
        <ul
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${appAreas.length}, minmax(0, 1fr))` }}
        >
          {/* The selected-tab indicator is one sliding element rather than a
              background on each tab, so switching tabs glides the way the
              segmented control's thumb does — same `.ds-seg-thumb` easing, so
              the two capsule controls move alike (and it inherits that class's
              reduced-motion guard). Tinted, not solid: a solid primary thumb
              under five tabs reads as a fill rather than as glass lensing. */}
          {activeIndex >= 0 && (
            <span
              aria-hidden="true"
              className="ds-seg-thumb pointer-events-none absolute inset-y-0 left-0 rounded-[20px] bg-primary/15"
              style={{
                width: `${100 / appAreas.length}%`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          )}
          {appAreas.map(({ to, Icon, tabLabel }) => {
            const active = pathname === to
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    // `relative` keeps the label above the indicator, and keeps
                    // the tap wash on the inactive tabs paintable over it.
                    'relative flex min-h-13 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/70',
                    active ? 'text-primary' : 'text-foreground/60 active:bg-foreground/5',
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className="max-w-full truncate text-[10px] leading-none font-semibold tracking-tight">
                    {tabLabel(t)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </GlassSurface>
    </nav>
  )
}
