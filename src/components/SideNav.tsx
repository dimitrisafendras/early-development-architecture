import { Link, useLocation } from 'react-router-dom'
import { BookOpen, CalendarRange, FileDown, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react'
import { GlassSurface } from '@dimitrisafendras/liquid-glass'
import { cn } from '@/lib/utils'
import { AccountControl } from './AccountControl'
import { SettingsMenu } from './SettingsMenu'
import { NotificationBell } from './NotificationBell'
import { appAreas } from '../lib/appAreas'
import { useAppStore } from '../store'
import { useT } from '../i18n'

/**
 * The desktop navigation: a full-height glass rail on the left, so vertical space
 * belongs to the page instead of a top bar. Slim by default — icons only, labels
 * as tooltips — and expandable to labelled rows with the toggle at its head; the
 * choice persists. Destinations are `appAreas` plus the day programs, the Wiki
 * and the report — the same set, in the same order, as the mobile dropdown. The
 * bottom tab bar carries `appAreas` alone; see the note beside the extras.
 *
 * Shown from `xl` up only; below that the floating `NavBar` (collapsed to a
 * hamburger) and the `BottomNav` tab bar take over.
 */
export function SideNav() {
  const t = useT()
  const { pathname } = useLocation()
  const collapsed = useAppStore((s) => s.navCollapsed)
  const toggleNav = useAppStore((s) => s.toggleNav)

  const destinations: { to: string; Icon: LucideIcon; label: string }[] = [
    ...appAreas.map((a) => ({ to: a.to, Icon: a.Icon, label: a.label(t) })),
    // The day programs sit with the tools they shape rather than in `appAreas`:
    // that list drives the five-column mobile tab bar, and editing the day is
    // something you do occasionally, not many times a day.
    { to: '/schedule', Icon: CalendarRange, label: t.nav.programs },
    { to: '/wiki', Icon: BookOpen, label: t.nav.wiki },
    // Beside the Wiki rather than in `appAreas`: that list drives the mobile
    // bottom tab bar, which is a five-column grid of the things you reach many
    // times a day. Exporting a report is neither.
    { to: '/export', Icon: FileDown, label: t.report.title },
  ]

  // One row shape for links, the settings trigger and the account control, so the
  // rail reads as a single column of controls in both states.
  const row = cn(
    'flex min-h-10 items-center rounded-xl text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
    collapsed ? 'w-10 justify-center px-0' : 'w-full gap-2.5 px-3',
  )
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        // The xl shell is exactly one viewport tall and doesn't scroll, so the
        // rail simply fills it — no sticky needed.
        'z-50 hidden h-svh shrink-0 transition-[width] duration-200 xl:block',
        // `w-68` (272px), not `w-60`. The expanded rail exists to say where each
        // link goes, and at 240px three of its eight Greek destinations were cut
        // mid-word — "Καταγραφή Ταΐσματ…", "Προγράμματα ημέρ…" — so the one state
        // whose entire purpose is the label was the state that hid it. The
        // truncation stays as the backstop it was meant to be; it is no longer
        // the normal case in one of the app's two languages.
        collapsed ? 'w-[4.5rem]' : 'w-68',
      )}
    >
      <GlassSurface
        radius={0}
        className="h-full border-r border-border/50"
        contentClassName={cn('flex h-full flex-col gap-5 py-4', collapsed ? 'px-4' : 'px-3')}
      >
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'gap-1')}>
          <Link
            to="/"
            aria-label={t.nav.brand}
            title={t.nav.brand}
            className={cn(
              'flex min-h-10 items-center gap-2.5 rounded-xl font-heading text-sm font-semibold tracking-tight text-foreground transition-colors hover:bg-foreground/5',
              collapsed ? 'w-10 justify-center' : 'min-w-0 flex-1 px-2',
            )}
          >
            <span className="text-lg leading-none" aria-hidden>
              🧠
            </span>
            {!collapsed && <span className="min-w-0 truncate">{t.nav.brand}</span>}
          </Link>
          <button
            type="button"
            onClick={toggleNav}
            aria-label={collapsed ? t.nav.expandNav : t.nav.collapseNav}
            title={collapsed ? t.nav.expandNav : t.nav.collapseNav}
            aria-expanded={!collapsed}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-foreground/50 transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <ToggleIcon className="size-4" aria-hidden />
          </button>
        </div>

        <nav aria-label={t.nav.sections}>
          <ul className="flex flex-col gap-0.5">
            {destinations.map(({ to, Icon, label }) => {
              // `/wiki` also owns its topic pages, so keep it lit while inside one.
              const active = pathname === to || (to === '/wiki' && pathname.startsWith('/wiki/'))
              return (
                <li key={to} className={collapsed ? 'flex justify-center' : undefined}>
                  <Link
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    title={label}
                    className={cn(
                      row,
                      active
                        ? 'bg-primary/15 text-foreground'
                        : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-foreground/50')}
                      aria-hidden
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings + account sit at the foot of the rail, out of the way. */}
        <div
          className={cn(
            'mt-auto flex flex-col gap-0.5 border-t border-border/50 pt-3',
            collapsed && 'items-center',
          )}
        >
          <NotificationBell
            align="start"
            withLabel={!collapsed}
            className={cn(row, 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground')}
          />
          <SettingsMenu
            align="end"
            side="right"
            withLabel={!collapsed}
            triggerClassName={cn(row, 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground')}
          />
          <AccountControl variant={collapsed ? 'rail' : 'row'} />
        </div>
      </GlassSurface>
    </aside>
  )
}
