import { Link, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { GlassNav } from '@dimitrisafendras/liquid-glass'
import { cn } from '@/lib/utils'
import { AccountControl } from './AccountControl'
import { SettingsMenu } from './SettingsMenu'
import { HeaderInfo, HeaderIdentity } from './HeaderContext'
import { NotificationBell } from './NotificationBell'
import { appAreas } from '../lib/appAreas'
import { useT } from '../i18n'

/**
 * The floating top bar — brand + "you are here" title and a hamburger holding
 * every destination and control. It is the navigation below `xl` only: from `xl`
 * up the `SideNav` rail takes over and this bar hides, so the page keeps the
 * vertical space. The core areas are also one tap away in the `BottomNav`.
 */
export function NavBar() {
  const t = useT()
  const { pathname } = useLocation()

  // The two top-level destinations. Everything else is a tool area (icons).
  const links = [
    { href: '/', label: t.nav.day },
    { href: '/wiki', label: t.nav.wiki },
  ]

  return (
    <GlassNav
      className="xl:hidden"
      activeHref={pathname}
      menuLabelOpen={t.nav.menuOpen}
      menuLabelClose={t.nav.menuClose}
      sectionsLabel={t.nav.sections}
      links={links}
      renderLink={({ link, active, className, onNavigate }) => (
        <Link
          to={link.href}
          aria-current={active ? 'true' : undefined}
          onClick={onNavigate}
          className={className}
        >
          {link.label}
        </Link>
      )}
      brand={
        <>
          <Link
            to="/"
            aria-label={t.nav.brand}
            className="flex min-h-11 min-w-11 shrink-0 items-center gap-2 text-foreground sm:min-h-0 sm:min-w-0"
          >
            <span aria-hidden>🧠</span>
            <span className="hidden truncate lg:inline">{t.nav.brand}</span>
          </Link>
          <HeaderInfo />
        </>
      }
      // In the bar itself rather than the hamburger: an unread count is only
      // useful if it can be seen without opening anything.
      inlineActions={
        <NotificationBell className="grid size-11 shrink-0 place-items-center rounded-full text-foreground/80 transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 active:bg-foreground/10 sm:size-9" />
      }
      mobileActions={<MobileActions activeHref={pathname} />}
    />
  )
}

/**
 * Dropdown controls: the five app areas as a two-column grid of labelled 44px
 * rows, then the settings + account controls.
 */
function MobileActions({ activeHref }: { activeHref: string }) {
  const t = useT()
  // Day + the tool areas, plus the Wiki, as labelled dropdown rows.
  const destinations = [
    ...appAreas.map((a) => ({ to: a.to, Icon: a.Icon, label: a.label(t) })),
    { to: '/wiki', Icon: BookOpen, label: t.nav.wiki },
  ]
  return (
    <div className="flex flex-col gap-3">
      <HeaderIdentity />
      <ul className="grid grid-cols-2 gap-1">
        {destinations.map(({ to, Icon, label }) => {
          const active = activeHref === to
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                  active
                    ? 'bg-primary/15 text-foreground'
                    : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10',
                )}
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-1">
        <SettingsMenu
          withLabel
          triggerClassName="inline-flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10"
        />
        <AccountControl variant="row" />
      </div>
    </div>
  )
}
