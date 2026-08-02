import { CalendarCheck, Timer, Milk, Moon, Baby, Users, type LucideIcon } from 'lucide-react'
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
 * The "do something" areas of the app, in the order they appear in both the
 * mobile bottom tab bar and the nav dropdown. Single source of truth so the two
 * navigations can never drift apart.
 *
 * Six of them since the sleep log arrived, which is the practical ceiling: the
 * bar divides the viewport evenly, so on the narrowest phone this targets each
 * tab is ~65px and the longest Greek label ("Οικογένεια") already fills it. A
 * seventh belongs in the rail, the way `/schedule` and `/export` do.
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
  { to: '/sleep', Icon: Moon, label: (t) => t.nav.sleep, tabLabel: (t) => t.nav.tabs.sleep },
  { to: '/baby', Icon: Baby, label: (t) => t.nav.baby, tabLabel: (t) => t.nav.tabs.baby },
  { to: '/family', Icon: Users, label: (t) => t.nav.family, tabLabel: (t) => t.nav.tabs.family },
]
