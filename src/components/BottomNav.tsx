import { Link, useLocation } from 'react-router-dom'
import { GlassSurface } from '@/design-system/components'
import '@/design-system/ds.css'
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

  return (
    <nav
      aria-label={t.nav.appAreas}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] xl:hidden"
    >
      <GlassSurface radius={26} className="mx-auto max-w-md p-1.5">
        <ul className="grid grid-cols-5">
          {appAreas.map(({ to, Icon, tabLabel }) => {
            const active = pathname === to
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-13 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/70',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground/60 active:bg-foreground/5',
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
