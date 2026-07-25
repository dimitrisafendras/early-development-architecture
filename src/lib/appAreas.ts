import { CalendarCheck, Timer, Milk, Baby, Users, type LucideIcon } from 'lucide-react'
import type { Messages } from '../i18n'

export interface AppArea {
  to: string
  Icon: LucideIcon
  /** Full label — nav dropdown, aria-label, tooltips. */
  label: (t: Messages) => string
  /** Short label for the mobile bottom tab bar. */
  tabLabel: (t: Messages) => string
}

/**
 * The five "do something" areas of the app, in the order they appear in both
 * the mobile bottom tab bar and the nav dropdown. Single source of truth so the
 * two navigations can never drift apart.
 */
export const appAreas: AppArea[] = [
  {
    to: '/',
    Icon: CalendarCheck,
    label: (t) => t.nav.today,
    tabLabel: (t) => t.nav.tabs.today,
  },
  {
    to: '/tracker',
    Icon: Timer,
    label: (t) => t.nav.tracker,
    tabLabel: (t) => t.nav.tabs.tracker,
  },
  { to: '/feed', Icon: Milk, label: (t) => t.nav.feed, tabLabel: (t) => t.nav.tabs.feed },
  { to: '/baby', Icon: Baby, label: (t) => t.nav.baby, tabLabel: (t) => t.nav.tabs.baby },
  { to: '/family', Icon: Users, label: (t) => t.nav.family, tabLabel: (t) => t.nav.tabs.family },
]
