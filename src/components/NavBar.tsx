import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Palette, Timer, Baby, Users } from 'lucide-react'
import { GlassNav, GlassToggleGroup } from '@/design-system/components'
import '@/design-system/ds.css'
import { AccountControl } from './AccountControl'
import { useAppStore } from '../store'
import { useT } from '../i18n'
import { topics, topicPath } from '../sections/registry'

/**
 * The shared floating nav. Section links are real routes now (`/topic/:slug`),
 * so the active link is derived from the current pathname and navigation is
 * client-side via react-router `<Link>` (injected through GlassNav.renderLink).
 */
export function NavBar() {
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const t = useT()
  const { pathname } = useLocation()

  const links = topics.map((topic) => ({
    href: topicPath(topic.slug),
    label: topic.label(t),
  }))

  return (
    <GlassNav
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
        <Link to="/" className="flex min-w-0 items-center gap-2 text-foreground">
          <span aria-hidden>🧠</span>
          <span className="hidden truncate sm:inline">{t.nav.brand}</span>
        </Link>
      }
      actions={
        <>
          <GlassToggleGroup
            ariaLabel={t.nav.palette}
            size="sm"
            value={palette}
            onChange={setPalette}
            options={[
              { value: 'blue', label: t.nav.boy },
              { value: 'red', label: t.nav.girl },
            ]}
          />
          <GlassToggleGroup
            ariaLabel={t.nav.theme}
            size="sm"
            value={dark ? 'dark' : 'light'}
            onChange={(v) => {
              if ((v === 'dark') !== dark) toggleTheme()
            }}
            options={[
              { value: 'light', label: <Sun className="size-3.5" />, ariaLabel: t.nav.lightTheme },
              { value: 'dark', label: <Moon className="size-3.5" />, ariaLabel: t.nav.darkTheme },
            ]}
          />
          <GlassToggleGroup
            ariaLabel={t.nav.language}
            size="sm"
            value={locale}
            onChange={setLocale}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'el', label: 'ΕΛ' },
            ]}
          />
          <Link
            to="/tracker"
            aria-label={t.nav.tracker}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground sm:px-3"
          >
            <Timer className="size-4" aria-hidden />
            <span className="hidden lg:inline">{t.nav.tracker}</span>
          </Link>
          <Link
            to="/baby"
            aria-label={t.nav.baby}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground sm:px-3"
          >
            <Baby className="size-4" aria-hidden />
            <span className="hidden lg:inline">{t.nav.baby}</span>
          </Link>
          <Link
            to="/family"
            aria-label={t.nav.family}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground sm:px-3"
          >
            <Users className="size-4" aria-hidden />
            <span className="hidden lg:inline">{t.nav.family}</span>
          </Link>
          <Link
            to="/design-system"
            aria-label={t.nav.designSystem}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground sm:px-3"
          >
            <Palette className="size-4" aria-hidden />
            <span className="hidden lg:inline">{t.nav.designSystem}</span>
          </Link>
          <AccountControl />
        </>
      }
    />
  )
}
