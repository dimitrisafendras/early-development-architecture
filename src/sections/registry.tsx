import type { ComponentType } from 'react'
import {
  Brain,
  Repeat,
  Music,
  Baby,
  CalendarClock,
  CalendarDays,
  MonitorOff,
  ListChecks,
  MessagesSquare,
  MoonStar,
  Utensils,
  Bath,
  HeartHandshake,
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
import { FullDay } from './FullDay'
import { Sleep } from './Sleep'
import { Feeding } from './Feeding'
import { Bathing } from './Bathing'
import { Soothing } from './Soothing'

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
  /**
   * Long editorial title — the heading of the topic's own page. Lives here rather
   * than inside the section component so `/wiki/:slug` renders the page header
   * through `PageFrame`, and the section stays pure content with no header of its
   * own (it used to render one, which showed up as a duplicate heading).
   */
  title: (t: Messages) => string
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
  { slug: 'brain-growth', module: 1, group: 'foundations', icon: Brain, label: (t) => t.nav.links.neurobiology, title: (t) => t.neurobiology.title, blurb: (t) => t.neurobiology.description, Component: Neurobiology },
  { slug: 'video-deficit', module: 6, group: 'foundations', icon: MonitorOff, label: (t) => t.nav.links.environment, title: (t) => t.environment.title, blurb: (t) => t.environment.description, Component: Environment },
  // Connection — how you bond, respond, and talk
  { slug: 'serve-return', module: 2, group: 'connection', icon: Repeat, label: (t) => t.nav.links.serveReturn, title: (t) => t.serveReturn.title, blurb: (t) => t.serveReturn.description, Component: ServeReturn },
  { slug: 'parentese-music', module: 3, group: 'connection', icon: Music, label: (t) => t.nav.links.languageMusic, title: (t) => t.languageMusic.title, blurb: (t) => t.languageMusic.description, Component: LanguageMusic },
  { slug: 'interaction-time', module: 8, group: 'connection', icon: MessagesSquare, label: (t) => t.nav.links.interaction, title: (t) => t.interaction.title, blurb: (t) => t.interaction.description, Component: Interaction },
  { slug: 'soothing', module: 13, group: 'connection', icon: HeartHandshake, label: (t) => t.nav.links.soothing, title: (t) => t.soothing.title, blurb: (t) => t.soothing.description, Component: Soothing },
  // Daily rhythm — the physical care routine
  { slug: 'tummy-time', module: 4, group: 'rhythm', icon: Baby, label: (t) => t.nav.links.tummyTime, title: (t) => t.tummyTime.title, blurb: (t) => t.tummyTime.description, Component: TummyTime },
  { slug: 'daily-routine', module: 5, group: 'rhythm', icon: CalendarClock, label: (t) => t.nav.links.routine, title: (t) => t.routine.title, blurb: (t) => t.routine.description, Component: Routine },
  { slug: 'full-day', module: 11, group: 'rhythm', icon: CalendarDays, label: (t) => t.nav.links.fullDay, title: (t) => t.fullDay.title, blurb: (t) => t.fullDay.description, Component: FullDay },
  { slug: 'sleep', module: 9, group: 'rhythm', icon: MoonStar, label: (t) => t.nav.links.sleep, title: (t) => t.sleep.title, blurb: (t) => t.sleep.description, Component: Sleep },
  { slug: 'feeding', module: 10, group: 'rhythm', icon: Utensils, label: (t) => t.nav.links.feeding, title: (t) => t.feeding.title, blurb: (t) => t.feeding.description, Component: Feeding },
  { slug: 'bathing', module: 12, group: 'rhythm', icon: Bath, label: (t) => t.nav.links.bathing, title: (t) => t.bathing.title, blurb: (t) => t.bathing.description, Component: Bathing },
  // Put it into practice
  { slug: 'action-items', module: 7, group: 'practice', icon: ListChecks, label: (t) => t.nav.links.summary, title: (t) => t.summary.title, blurb: (t) => t.summary.description, Component: Summary },
]

/** Topics belonging to a group, in registry order. */
export function topicsInGroup(group: TopicGroup): Topic[] {
  return topics.filter((topic) => topic.group === group)
}

/** Theme groups that form the Wiki's chapters (in reading order). "practice"
 *  (the daily checklist) is a daily tool that lives on the Day page, so it isn't
 *  a Wiki chapter. */
export const learnGroups: TopicGroup[] = ['foundations', 'connection', 'rhythm']

export const groupMeta: Record<TopicGroup, { icon: ComponentType<{ className?: string }> }> = {
  foundations: { icon: Brain },
  connection: { icon: MessagesSquare },
  rhythm: { icon: CalendarClock },
  practice: { icon: ListChecks },
}

export function isLearnGroup(value: string | undefined): value is TopicGroup {
  return learnGroups.includes(value as TopicGroup)
}

/** Topics that are NOT part of the Wiki: they became first-class app surfaces —
 *  the full-day timeline is the Day page (`/`) and the checklist is a Day tool. */
const WIKI_HIDDEN = new Set(['full-day', 'action-items'])

/** Wiki topics in a chapter, in registry order (excludes the promoted topics). */
export function wikiTopicsInGroup(group: TopicGroup): Topic[] {
  return topicsInGroup(group).filter((topic) => !WIKI_HIDDEN.has(topic.slug))
}

/** All Wiki topics as one ordered list — drives the in-chapter prev/next pager. */
export const wikiTopics: Topic[] = learnGroups.flatMap(wikiTopicsInGroup)

export function isWikiTopic(slug: string | undefined): boolean {
  return wikiTopics.some((topic) => topic.slug === slug)
}

/** The theme group a topic belongs to, or undefined if it isn't a Wiki topic. */
export function groupOfTopic(slug: string | undefined): TopicGroup | undefined {
  return wikiTopics.find((topic) => topic.slug === slug)?.group
}

export const wikiPath = (slug: string) => `/wiki/${slug}`

/** Legacy path helpers — kept only so the old-route redirects in App.tsx and any
 *  external deep links resolve. New links use {@link wikiPath}. */
export const groupPath = (group: TopicGroup) => `/learn/${group}`
export const topicPath = (slug: string) => `/topic/${slug}`

export function findTopic(slug: string | undefined): Topic | undefined {
  return topics.find((topic) => topic.slug === slug)
}
