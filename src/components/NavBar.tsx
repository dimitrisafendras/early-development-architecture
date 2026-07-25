import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Sun, Moon, Palette, SlidersHorizontal, Download, BookOpen } from 'lucide-react'
import { GlassNav, GlassToggleGroup } from '@/design-system/components'
import '@/design-system/ds.css'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { AccountControl } from './AccountControl'
import { HeaderInfo, HeaderIdentity } from './HeaderContext'
import { useAppStore } from '../store'
import { useInstall } from '../lib/useInstall'
import { appAreas } from '../lib/appAreas'
import { useT } from '../i18n'

/**
 * The shared floating nav, kept deliberately lean: brand + "you are here" title,
 * the two top-level destinations (Day, Wiki) as text links, then the tool-area
 * icons (tracker / feed / baby / family), a Settings popover, and the account
 * control. The live "what's now" status that used to live up here now sits on
 * the Day page.
 *
 * Below `xl` the links and icons collapse into the dropdown, where every
 * destination renders as a full-width labelled row — on a phone an unlabelled
 * icon in a menu is a guessing game. The core areas are also one tap away in the
 * `BottomNav` tab bar.
 */
export function NavBar() {
  const t = useT()
  const { pathname } = useLocation()

  // The two top-level destinations. Everything else is a tool area (icons).
  const links = [
    { href: '/', label: t.nav.day },
    { href: '/wiki', label: t.nav.wiki },
  ]

  const iconLink =
    'inline-flex size-11 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground sm:size-9'

  // Day is the home destination (a text link + bottom-tab); the tool areas after
  // it stay as quick-access icons in the inline row.
  const toolAreas = appAreas.filter((a) => a.to !== '/')

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
      actions={
        <>
          {toolAreas.map(({ to, Icon, label }) => (
            <Link key={to} to={to} aria-label={label(t)} title={label(t)} className={iconLink}>
              <Icon className="size-4" aria-hidden />
            </Link>
          ))}
          <SettingsMenu triggerClassName={iconLink} />
          <AccountControl />
        </>
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
        <SettingsMenu triggerClassName="inline-flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10" withLabel />
        <AccountControl variant="row" />
      </div>
    </div>
  )
}

function SettingsMenu({
  triggerClassName,
  withLabel = false,
}: {
  triggerClassName: string
  withLabel?: boolean
}) {
  const t = useT()
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const { canInstall, installed, ios, promptInstall } = useInstall()
  const [iosHint, setIosHint] = useState(false)
  const showInstall = !installed && (canInstall || ios)

  return (
    <Popover>
      <PopoverTrigger aria-label={t.nav.settings} title={t.nav.settings} className={triggerClassName}>
        <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
        {withLabel && <span>{t.nav.settings}</span>}
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
        {showInstall && (
          <>
            <Separator />
            <button
              type="button"
              onClick={() => {
                if (canInstall) void promptInstall()
                else setIosHint((v) => !v)
              }}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:min-h-0"
            >
              <Download className="size-4" aria-hidden />
              {t.install.title}
            </button>
            {iosHint && !canInstall && (
              <p className="text-xs leading-relaxed text-muted-foreground">{t.install.iosBody}</p>
            )}
          </>
        )}
        <Separator />
        <Link
          to="/design-system"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
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
