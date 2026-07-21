import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Palette } from 'lucide-react'
import { GlassNav, GlassToggleGroup } from '@/design-system/components'
import '@/design-system/ds.css'
import { AccountControl } from './AccountControl'
import { useAppStore } from '../store'
import { useT } from '../i18n'

const NAV_HREFS = [
  '#neurobiology',
  '#serve-return',
  '#language-music',
  '#tummy-time',
  '#routine',
  '#environment',
  '#summary',
] as const

/** Tracks which section anchor is currently in view, for nav link highlighting. */
function useActiveSection(hrefs: readonly string[]) {
  const [active, setActive] = useState<string>(hrefs[0] ?? '')
  useEffect(() => {
    const ids = hrefs.map((h) => h.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [hrefs])
  return active
}

export function NavBar() {
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const t = useT()
  const activeHref = useActiveSection(NAV_HREFS)

  const labels = [
    t.nav.links.neurobiology,
    t.nav.links.serveReturn,
    t.nav.links.languageMusic,
    t.nav.links.tummyTime,
    t.nav.links.routine,
    t.nav.links.environment,
    t.nav.links.summary,
  ]

  return (
    <GlassNav
      activeHref={activeHref}
      menuLabelOpen={t.nav.menuOpen}
      menuLabelClose={t.nav.menuClose}
      sectionsLabel={t.nav.sections}
      links={NAV_HREFS.map((href, i) => ({ href, label: labels[i] }))}
      brand={
        <>
          <span aria-hidden>🧠</span>
          <span className="hidden truncate sm:inline">{t.nav.brand}</span>
        </>
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
