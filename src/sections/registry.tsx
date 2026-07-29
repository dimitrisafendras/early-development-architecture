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
  Blocks,
  Footprints,
  Infinity as InfinityIcon,
  Milestone,
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
import { Milestones } from './Milestones'

export type TopicGroup = 'foundations' | 'connection' | 'rhythm' | 'practice'

/** Theme groups in display order; labels resolved from i18n (`hub.groups`). */
export const groupOrder: TopicGroup[] = ['foundations', 'connection', 'rhythm', 'practice']

/**
 * The Wiki's chapter axis: the child's stage rather than the topic's theme.
 * `anytime` is the cross-cutting chapter — advice that holds from birth to three
 * — so it matches no particular age and always reads last.
 */
export type AgeGroup = 'newborn' | 'baby' | 'toddler' | 'anytime'

/** Age chapters in reading order; labels resolved from i18n (`hub.ageGroups`). */
export const ageGroupOrder: AgeGroup[] = ['newborn', 'baby', 'toddler', 'anytime']

/**
 * Exclusive upper bound, in months, for matching a baby's age to a chapter:
 * newborn < 3, baby < 12, toddler < 36. `anytime` has no bound — it is the
 * cross-cutting chapter and never wins the "for your baby's age" marker.
 */
export const ageGroupMaxMonths: Record<AgeGroup, number | null> = {
  newborn: 3,
  baby: 12,
  toddler: 36,
  anytime: null,
}

export const ageGroupMeta: Record<AgeGroup, { icon: ComponentType<{ className?: string }> }> = {
  newborn: { icon: Baby },
  baby: { icon: Blocks },
  toddler: { icon: Footprints },
  anytime: { icon: InfinityIcon },
}

/**
 * The chapter a given age in months falls into, or `undefined` when it is past
 * the last bounded chapter (or unknown). Bounds are exclusive and read in
 * `ageGroupOrder`, so the first chapter that still contains the age wins.
 */
export function ageGroupForMonths(months: number | null | undefined): AgeGroup | undefined {
  if (months == null || months < 0) return undefined
  return ageGroupOrder.find((age) => {
    const max = ageGroupMaxMonths[age]
    return max != null && months < max
  })
}

export interface Topic {
  /** URL segment under /topic/. */
  slug: string
  /** Module number shown in the section header + hub card eyebrow. */
  module: number
  /** Theme group the topic belongs to (drives the hub grouping). */
  group: TopicGroup
  /**
   * Age chapters the topic belongs to (drives the Wiki grouping). A topic may
   * sit in several chapters and is listed in each of them; the first entry is
   * its *primary* chapter — the one the breadcrumb names.
   */
  ages: AgeGroup[]
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
 * The infographic topics. Single source of truth for the landing hub grid, the
 * Wiki chapters, the per-topic routes (`/wiki/:slug`), the nav links, and the
 * prev/next pager. Labels/blurbs pull from the i18n tree so both locales stay in
 * sync automatically.
 *
 * Two independent axes: `group` is the theme (drives the hub) and `ages` is the
 * stage (drives the Wiki chapters). The care topics repeat across stages because
 * the guidance genuinely differs at 2 weeks, 6 months, and 2 years; the theory
 * topics are `anytime` because they hold throughout.
 */
export const topics: Topic[] = [
  // Foundations — why the early window matters
  { slug: 'brain-growth', module: 1, group: 'foundations', ages: ['anytime'], icon: Brain, label: (t) => t.nav.links.neurobiology, title: (t) => t.neurobiology.title, blurb: (t) => t.neurobiology.description, Component: Neurobiology },
  { slug: 'milestones', module: 14, group: 'foundations', ages: ['newborn', 'baby', 'toddler'], icon: Milestone, label: (t) => t.nav.links.milestones, title: (t) => t.milestones.title, blurb: (t) => t.milestones.description, Component: Milestones },
  { slug: 'video-deficit', module: 6, group: 'foundations', ages: ['anytime'], icon: MonitorOff, label: (t) => t.nav.links.environment, title: (t) => t.environment.title, blurb: (t) => t.environment.description, Component: Environment },
  // Connection — how you bond, respond, and talk
  { slug: 'serve-return', module: 2, group: 'connection', ages: ['anytime'], icon: Repeat, label: (t) => t.nav.links.serveReturn, title: (t) => t.serveReturn.title, blurb: (t) => t.serveReturn.description, Component: ServeReturn },
  { slug: 'parentese-music', module: 3, group: 'connection', ages: ['anytime'], icon: Music, label: (t) => t.nav.links.languageMusic, title: (t) => t.languageMusic.title, blurb: (t) => t.languageMusic.description, Component: LanguageMusic },
  { slug: 'interaction-time', module: 8, group: 'connection', ages: ['anytime'], icon: MessagesSquare, label: (t) => t.nav.links.interaction, title: (t) => t.interaction.title, blurb: (t) => t.interaction.description, Component: Interaction },
  { slug: 'soothing', module: 13, group: 'connection', ages: ['newborn', 'baby'], icon: HeartHandshake, label: (t) => t.nav.links.soothing, title: (t) => t.soothing.title, blurb: (t) => t.soothing.description, Component: Soothing },
  // Daily rhythm — the physical care routine
  { slug: 'tummy-time', module: 4, group: 'rhythm', ages: ['newborn', 'baby'], icon: Baby, label: (t) => t.nav.links.tummyTime, title: (t) => t.tummyTime.title, blurb: (t) => t.tummyTime.description, Component: TummyTime },
  { slug: 'daily-routine', module: 5, group: 'rhythm', ages: ['newborn', 'baby', 'toddler'], icon: CalendarClock, label: (t) => t.nav.links.routine, title: (t) => t.routine.title, blurb: (t) => t.routine.description, Component: Routine },
  { slug: 'full-day', module: 11, group: 'rhythm', ages: ['newborn', 'baby', 'toddler'], icon: CalendarDays, label: (t) => t.nav.links.fullDay, title: (t) => t.fullDay.title, blurb: (t) => t.fullDay.description, Component: FullDay },
  { slug: 'sleep', module: 9, group: 'rhythm', ages: ['newborn', 'baby', 'toddler'], icon: MoonStar, label: (t) => t.nav.links.sleep, title: (t) => t.sleep.title, blurb: (t) => t.sleep.description, Component: Sleep },
  { slug: 'feeding', module: 10, group: 'rhythm', ages: ['newborn', 'baby', 'toddler'], icon: Utensils, label: (t) => t.nav.links.feeding, title: (t) => t.feeding.title, blurb: (t) => t.feeding.description, Component: Feeding },
  { slug: 'bathing', module: 12, group: 'rhythm', ages: ['newborn', 'baby', 'toddler'], icon: Bath, label: (t) => t.nav.links.bathing, title: (t) => t.bathing.title, blurb: (t) => t.bathing.description, Component: Bathing },
  // Put it into practice
  { slug: 'action-items', module: 7, group: 'practice', ages: ['anytime'], icon: ListChecks, label: (t) => t.nav.links.summary, title: (t) => t.summary.title, blurb: (t) => t.summary.description, Component: Summary },
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

/** Wiki topics in a theme group, in registry order (excludes the promoted topics). */
export function wikiTopicsInGroup(group: TopicGroup): Topic[] {
  return topicsInGroup(group).filter((topic) => !WIKI_HIDDEN.has(topic.slug))
}

/** Wiki topics in an age chapter, in registry order (excludes the promoted topics). */
export function wikiTopicsInAgeGroup(age: AgeGroup): Topic[] {
  return topics.filter((topic) => topic.ages.includes(age) && !WIKI_HIDDEN.has(topic.slug))
}

/**
 * All Wiki topics as one ordered, de-duplicated list — chapter by chapter in
 * `ageGroupOrder`, first appearance wins. This is what the prev/next pager walks,
 * so a topic that appears in three chapters still gets exactly one place in the
 * reading order (otherwise paging would loop back through it).
 */
export const wikiTopics: Topic[] = (() => {
  const seen = new Set<string>()
  return ageGroupOrder.flatMap(wikiTopicsInAgeGroup).filter((topic) => {
    if (seen.has(topic.slug)) return false
    seen.add(topic.slug)
    return true
  })
})()

export function isWikiTopic(slug: string | undefined): boolean {
  return wikiTopics.some((topic) => topic.slug === slug)
}

/**
 * The age chapter a topic primarily belongs to (its first `ages` entry), or
 * undefined if it isn't a Wiki topic. Drives the topic-page breadcrumb.
 */
export function ageGroupOfTopic(slug: string | undefined): AgeGroup | undefined {
  return wikiTopics.find((topic) => topic.slug === slug)?.ages[0]
}

/** The theme group a topic belongs to, or undefined if it isn't a Wiki topic.
 *  Kept for the thematic axis (the hub); the Wiki breadcrumb uses
 *  {@link ageGroupOfTopic}. */
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
