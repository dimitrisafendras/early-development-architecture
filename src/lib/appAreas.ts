import { CalendarCheck, Timer, Milk, Moon, Baby, Users, type LucideIcon } from 'lucide-react'
import type { Messages } from '../i18n'

export interface AppArea {
  to: string
  Icon: LucideIcon
  /** Full label — nav dropdown, aria-label, tooltips. */
  label: (t: Messages) => string
  /** Short label for the mobile bottom tab bar. */
  tabLabel: (t: Messages) => string
  /**
   * Whether this area gets a tab on the phone's bottom bar.
   *
   * Required, not optional: the bar divides the viewport evenly, so every area
   * that joins it makes every other tab narrower, and that is a decision about
   * the whole bar rather than about the area being added. An area with `false`
   * is still a first-class destination — it is in the rail, the hamburger and
   * the header title lookup, all of which read this list whole.
   */
  bottomTab: boolean
}

/**
 * The "do something" areas of the app, in the order they appear in both the
 * mobile bottom tab bar and the nav dropdown. Single source of truth so the two
 * navigations can never drift apart.
 *
 * Six areas, five of which take a bottom tab (`bottomTab`). Five is the
 * practical ceiling: the bar divides the viewport evenly, so at six the tabs
 * were ~65px on the narrowest phone and the longest Greek label ("Οικογένεια")
 * filled one edge to edge. Family is the one that comes off — it is the thing
 * you set up once and then hardly touch, unlike the four logs and the day —
 * and it keeps its place in the rail and the hamburger, the way `/schedule` and
 * `/export` do.
 */
export const appAreas: AppArea[] = [
  {
    to: '/',
    Icon: CalendarCheck,
    label: (t) => t.nav.today,
    tabLabel: (t) => t.nav.tabs.today,
    bottomTab: true,
  },
  {
    to: '/tracker',
    Icon: Timer,
    label: (t) => t.nav.tracker,
    tabLabel: (t) => t.nav.tabs.tracker,
    bottomTab: true,
  },
  { to: '/feed', Icon: Milk, label: (t) => t.nav.feed, tabLabel: (t) => t.nav.tabs.feed, bottomTab: true },
  { to: '/sleep', Icon: Moon, label: (t) => t.nav.sleep, tabLabel: (t) => t.nav.tabs.sleep, bottomTab: true },
  { to: '/baby', Icon: Baby, label: (t) => t.nav.baby, tabLabel: (t) => t.nav.tabs.baby, bottomTab: true },
  {
    to: '/family',
    Icon: Users,
    label: (t) => t.nav.family,
    tabLabel: (t) => t.nav.tabs.family,
    bottomTab: false,
  },
]

/** The areas that take a tab on the phone's bottom bar, in bar order. */
export const bottomTabs: AppArea[] = appAreas.filter((a) => a.bottomTab)
