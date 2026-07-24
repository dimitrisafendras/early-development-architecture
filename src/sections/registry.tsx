import type { ComponentType } from 'react'
import {
  Brain,
  Repeat,
  Music,
  Baby,
  CalendarClock,
  MonitorOff,
  ListChecks,
  MessagesSquare,
  MoonStar,
} from 'lucide-react'
import type { Messages } from '../i18n'
import { Neurobiology } from './Neurobiology'
import { ServeReturn } from './ServeReturn'
import { LanguageMusic } from './LanguageMusic'
import { TummyTime } from './TummyTime'
import { Routine } from './Routine'
import { Environment } from './Environment'
import { Summary } from './Summary'
import { Interaction } from './Interaction'
import { SleepFeeding } from './SleepFeeding'

export type TopicGroup = 'foundations' | 'connection' | 'rhythm' | 'practice'

/** Theme groups in display order; labels resolved from i18n (`hub.groups`). */
export const groupOrder: TopicGroup[] = ['foundations', 'connection', 'rhythm', 'practice']

export interface Topic {
  /** URL segment under /topic/. */
  slug: string
  /** Module number shown in the section header + hub card eyebrow. */
  module: number
  /** Theme group the topic belongs to (drives the hub grouping). */
  group: TopicGroup
  icon: ComponentType<{ className?: string }>
  /** Short localized label (nav + card title). */
  label: (t: Messages) => string
  /** Longer localized blurb for the hub card. */
  blurb: (t: Messages) => string
  Component: ComponentType
}

/**
 * The nine infographic topics, grouped by theme and ordered for reading.
 * Single source of truth for the landing hub grid, the per-topic routes
 * (`/topic/:slug`), the nav links, and the prev/next pager. Labels/blurbs pull
 * from the i18n tree so both locales stay in sync automatically.
 */
export const topics: Topic[] = [
  // Foundations — why the early window matters
  { slug: 'brain-growth', module: 1, group: 'foundations', icon: Brain, label: (t) => t.nav.links.neurobiology, blurb: (t) => t.neurobiology.description, Component: Neurobiology },
  { slug: 'video-deficit', module: 6, group: 'foundations', icon: MonitorOff, label: (t) => t.nav.links.environment, blurb: (t) => t.environment.description, Component: Environment },
  // Connection — how you bond, respond, and talk
  { slug: 'serve-return', module: 2, group: 'connection', icon: Repeat, label: (t) => t.nav.links.serveReturn, blurb: (t) => t.serveReturn.description, Component: ServeReturn },
  { slug: 'parentese-music', module: 3, group: 'connection', icon: Music, label: (t) => t.nav.links.languageMusic, blurb: (t) => t.languageMusic.description, Component: LanguageMusic },
  { slug: 'interaction-time', module: 8, group: 'connection', icon: MessagesSquare, label: (t) => t.nav.links.interaction, blurb: (t) => t.interaction.description, Component: Interaction },
  // Daily rhythm — the physical care routine
  { slug: 'tummy-time', module: 4, group: 'rhythm', icon: Baby, label: (t) => t.nav.links.tummyTime, blurb: (t) => t.tummyTime.description, Component: TummyTime },
  { slug: 'daily-routine', module: 5, group: 'rhythm', icon: CalendarClock, label: (t) => t.nav.links.routine, blurb: (t) => t.routine.description, Component: Routine },
  { slug: 'sleep-feeding', module: 9, group: 'rhythm', icon: MoonStar, label: (t) => t.nav.links.sleepFeeding, blurb: (t) => t.sleepFeeding.description, Component: SleepFeeding },
  // Put it into practice
  { slug: 'action-items', module: 7, group: 'practice', icon: ListChecks, label: (t) => t.nav.links.summary, blurb: (t) => t.summary.description, Component: Summary },
]

/** Topics belonging to a group, in registry order. */
export function topicsInGroup(group: TopicGroup): Topic[] {
  return topics.filter((topic) => topic.group === group)
}

export const topicPath = (slug: string) => `/topic/${slug}`

export function findTopic(slug: string | undefined): Topic | undefined {
  return topics.find((topic) => topic.slug === slug)
}
