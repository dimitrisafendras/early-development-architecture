import type { ComponentType } from 'react'
import { Brain, Repeat, Music, Baby, CalendarClock, MonitorOff, ListChecks } from 'lucide-react'
import type { Messages } from '../i18n'
import { Neurobiology } from './Neurobiology'
import { ServeReturn } from './ServeReturn'
import { LanguageMusic } from './LanguageMusic'
import { TummyTime } from './TummyTime'
import { Routine } from './Routine'
import { Environment } from './Environment'
import { Summary } from './Summary'

export interface Topic {
  /** URL segment under /topic/. */
  slug: string
  /** Module number shown in the section header + hub card eyebrow. */
  module: number
  icon: ComponentType<{ className?: string }>
  /** Short localized label (nav + card title). */
  label: (t: Messages) => string
  /** Longer localized blurb for the hub card. */
  blurb: (t: Messages) => string
  Component: ComponentType
}

/**
 * The seven infographic topics, in reading order. Single source of truth for
 * the landing hub grid, the per-topic routes (`/topic/:slug`), the nav links,
 * and the prev/next pager. Labels/blurbs pull from the i18n tree so both
 * locales stay in sync automatically.
 */
export const topics: Topic[] = [
  { slug: 'brain-growth', module: 1, icon: Brain, label: (t) => t.nav.links.neurobiology, blurb: (t) => t.neurobiology.description, Component: Neurobiology },
  { slug: 'serve-return', module: 2, icon: Repeat, label: (t) => t.nav.links.serveReturn, blurb: (t) => t.serveReturn.description, Component: ServeReturn },
  { slug: 'parentese-music', module: 3, icon: Music, label: (t) => t.nav.links.languageMusic, blurb: (t) => t.languageMusic.description, Component: LanguageMusic },
  { slug: 'tummy-time', module: 4, icon: Baby, label: (t) => t.nav.links.tummyTime, blurb: (t) => t.tummyTime.description, Component: TummyTime },
  { slug: 'daily-routine', module: 5, icon: CalendarClock, label: (t) => t.nav.links.routine, blurb: (t) => t.routine.description, Component: Routine },
  { slug: 'video-deficit', module: 6, icon: MonitorOff, label: (t) => t.nav.links.environment, blurb: (t) => t.environment.description, Component: Environment },
  { slug: 'action-items', module: 7, icon: ListChecks, label: (t) => t.nav.links.summary, blurb: (t) => t.summary.description, Component: Summary },
]

export const topicPath = (slug: string) => `/topic/${slug}`

export function findTopic(slug: string | undefined): Topic | undefined {
  return topics.find((topic) => topic.slug === slug)
}
