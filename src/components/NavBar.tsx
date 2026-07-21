import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CheckSquare, Monitor, Music, Network, RefreshCw, Baby, Sun, Moon, Palette } from 'lucide-react'
import { GlassNav, GlassToggleGroup } from '@/design-system/components'
import '@/design-system/ds.css'
import { useAppStore } from '../store'

const items = [
  { href: '#neurobiology', label: 'Brain Growth', Icon: Network },
  { href: '#serve-return', label: 'Serve & Return', Icon: RefreshCw },
  { href: '#language-music', label: 'Parentese & Music', Icon: Music },
  { href: '#tummy-time', label: 'Tummy Time', Icon: Baby },
  { href: '#routine', label: 'Daily Schedule', Icon: Calendar },
  { href: '#environment', label: 'Video Deficit', Icon: Monitor },
  { href: '#summary', label: 'Action Items', Icon: CheckSquare },
]

/** Tracks which section anchor is currently in view, for nav link highlighting. */
function useActiveSection(hrefs: string[]) {
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
  const activeHref = useActiveSection(items.map((i) => i.href))

  return (
    <GlassNav
      activeHref={activeHref}
      links={items.map(({ href, label }) => ({ href, label }))}
      brand={
        <>
          <span aria-hidden>🧠</span>
          <span className="hidden sm:inline">Early Development</span>
        </>
      }
      actions={
        <>
          <GlassToggleGroup
            ariaLabel="Accent palette"
            size="sm"
            value={palette}
            onChange={setPalette}
            options={[
              { value: 'blue', label: 'Boy' },
              { value: 'red', label: 'Girl' },
            ]}
          />
          <GlassToggleGroup
            ariaLabel="Color theme"
            size="sm"
            value={dark ? 'dark' : 'light'}
            onChange={(v) => {
              if ((v === 'dark') !== dark) toggleTheme()
            }}
            options={[
              { value: 'light', label: <Sun className="size-3.5" />, ariaLabel: 'Light theme' },
              { value: 'dark', label: <Moon className="size-3.5" />, ariaLabel: 'Dark theme' },
            ]}
          />
          <Link
            to="/design-system"
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground sm:inline-flex"
          >
            <Palette className="size-4" aria-hidden />
            <span className="hidden lg:inline">Design System</span>
          </Link>
        </>
      }
    />
  )
}
