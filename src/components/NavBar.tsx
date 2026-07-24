import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Palette, Timer, Baby, Users, CalendarCheck, SlidersHorizontal } from 'lucide-react'
import { GlassNav, GlassToggleGroup } from '@/design-system/components'
import '@/design-system/ds.css'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { AccountControl } from './AccountControl'
import { useAppStore } from '../store'
import { useT } from '../i18n'
import { learnGroups, groupPath } from '../sections/registry'

/**
 * The shared floating nav. The top row stays lean: brand, a primary "Today"
 * link, the app-area icons, a Settings popover (theme / palette / language +
 * Design System), and the account control. The theme's Learn groups sit on
 * the second tier.
 */
export function NavBar() {
  const t = useT()
  const { pathname } = useLocation()

  const links = learnGroups.map((group) => ({
    href: groupPath(group),
    label: t.hub.groups[group],
  }))

  const iconLink =
    'inline-flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground'

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
          <Link
            to="/daily"
            aria-label={t.nav.today}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <CalendarCheck className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t.nav.today}</span>
          </Link>
          <Link to="/tracker" aria-label={t.nav.tracker} title={t.nav.tracker} className={iconLink}>
            <Timer className="size-4" aria-hidden />
          </Link>
          <Link to="/baby" aria-label={t.nav.baby} title={t.nav.baby} className={iconLink}>
            <Baby className="size-4" aria-hidden />
          </Link>
          <Link to="/family" aria-label={t.nav.family} title={t.nav.family} className={iconLink}>
            <Users className="size-4" aria-hidden />
          </Link>
          <SettingsMenu triggerClassName={iconLink} />
          <AccountControl />
        </>
      }
    />
  )
}

function SettingsMenu({ triggerClassName }: { triggerClassName: string }) {
  const t = useT()
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)

  return (
    <Popover>
      <PopoverTrigger aria-label={t.nav.settings} title={t.nav.settings} className={triggerClassName}>
        <SlidersHorizontal className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 space-y-4">
        <Field label={t.nav.theme}>
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
        </Field>
        <Field label={t.nav.palette}>
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
        </Field>
        <Field label={t.nav.language}>
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
        </Field>
        <Separator />
        <Link
          to="/design-system"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Palette className="size-4" aria-hidden />
          {t.nav.designSystem}
        </Link>
      </PopoverContent>
    </Popover>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
