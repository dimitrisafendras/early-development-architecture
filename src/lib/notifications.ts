import type { ComponentType } from 'react'
import { Timer, Milk, ListChecks, Baby as BabyIcon, Users } from 'lucide-react'
import {
  activeTimeIndex,
  activityTargetForAge,
  formatDuration,
  slotTiming,
  todayKey,
} from './schedule'
import {
  ageGroupForMonths,
  wikiPath,
  wikiTopics,
  wikiTopicsInAgeGroup,
  type Topic,
} from '../sections/registry'
import { dayActivityMeta } from '../components/dayActivity'
import type { ScheduleSlot } from '../data'
import type { Messages } from '../i18n'

/**
 * Which surface a notification belongs to. Every kind names exactly one
 * destination, so a notification is always a way *into* a section rather than a
 * dead-end message.
 */
export type NotificationKind =
  | 'routine'
  | 'tummy'
  | 'feed'
  | 'checklist'
  | 'wiki'
  | 'baby'
  | 'family'

export interface AppNotification {
  /**
   * Stable id of the shape `kind:YYYY-MM-DD:detail`. The day segment is what
   * makes read/dismissed/already-fired state self-expiring (see `pruneToDay` in
   * the store), and the trailing detail is what re-arms a notification within
   * the day — a new schedule slot, another feed logged.
   */
  id: string
  kind: NotificationKind
  /** In-app route the notification opens. */
  to: string
  Icon: ComponentType<{ className?: string }>
  title: string
  body: string
  /** Time-sensitive: sorts to the top and gets the accent dot. */
  urgent?: boolean
  /**
   * Whether this also fires as an OS notification when push is enabled. The
   * ambient ones (checklist progress, "add your baby") stay in-app only — they
   * are true all day and would be nagging rather than useful as system alerts.
   */
  push: boolean
}

/**
 * How long after the last feed to raise the "feed due" notification. Deliberately
 * generous — this is a prompt to look, not a schedule to keep, and demand feeding
 * means the baby's cues outrank any clock.
 */
export function feedGapTargetMins(months: number | null): number {
  if (months == null || months < 6) return 180
  return 240
}

/**
 * The Wiki topic surfaced today, rotating one per local day through the chapter
 * that matches the baby's age. Rotating on the day number rather than at random
 * keeps it stable across reloads and across devices, so the notification doesn't
 * change under the caregiver mid-day.
 *
 * Two fallbacks, and they are deliberately different:
 * - **Age known but past the last bounded chapter** (three years and up):
 *   `anytime`, the cross-cutting chapter. Not the whole catalogue — that would
 *   offer a three-year-old tummy time and newborn soothing.
 * - **No age at all** (no baby profile yet): the whole catalogue, because
 *   there is nothing to narrow by and a browsing caregiver is best served by
 *   the full sampler.
 */
export function topicOfTheDay(months: number | null, now: Date): Topic | undefined {
  const age = months == null ? undefined : (ageGroupForMonths(months) ?? 'anytime')
  const pool = age ? wikiTopicsInAgeGroup(age) : wikiTopics
  if (!pool.length) return undefined
  const localDays = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000)
  return pool[localDays % pool.length]
}

export interface NotificationContext {
  t: Messages
  now: Date
  /** Current baby's age in months, or null when there is no baby profile. */
  months: number | null
  signedIn: boolean
  hasBaby: boolean
  /** Household invitations awaiting this user's answer. */
  pendingInvites: number
  schedule: ScheduleSlot[]
  /** Minutes of tummy time / active play completed today, and whether one runs. */
  tummyMinutes: number
  tummyRunning: boolean
  feedsToday: number
  minsSinceLastFeed: number | null
  checklistDone: number
  checklistTotal: number
}

/**
 * Derive today's notifications from live app state. Pure — it takes a snapshot
 * and returns the list, so the same rules drive the in-app bell and the OS
 * notifications without either owning the logic.
 *
 * Ordered by urgency first, then by how immediate the prompt is: the moment
 * you're in, the things due, then the ambient nudges.
 */
export function buildNotifications(ctx: NotificationContext): AppNotification[] {
  const { t, now } = ctx
  const n = t.notifications
  const day = todayKey(now)
  const out: AppNotification[] = []

  // The moment happening right now → the Day page, which pairs it with its tool.
  const idx = activeTimeIndex(
    ctx.schedule.map((s) => s.time),
    now,
  )
  const slot = ctx.schedule[idx]
  if (slot) {
    const timing = slotTiming(ctx.schedule, idx, now)
    if (timing.running) {
      out.push({
        id: `routine:${day}:${idx}`,
        kind: 'routine',
        to: '/',
        Icon: dayActivityMeta[slot.type].icon,
        title: n.routineTitle.replace('{title}', slot.title),
        body: n.routineBody.replace('{mins}', String(timing.remaining)),
        urgent: true,
        push: true,
      })
    }
  }

  // A feed that's overdue by the age-appropriate gap → the feed log.
  const gap = feedGapTargetMins(ctx.months)
  if (ctx.minsSinceLastFeed == null) {
    out.push({
      id: `feed:${day}:0`,
      kind: 'feed',
      to: '/feed',
      Icon: Milk,
      title: n.feedNoneTitle,
      body: n.feedNoneBody,
      push: true,
    })
  } else if (ctx.minsSinceLastFeed >= gap) {
    out.push({
      // The count re-arms this once another feed is logged.
      id: `feed:${day}:${ctx.feedsToday}`,
      kind: 'feed',
      to: '/feed',
      Icon: Milk,
      title: n.feedDueTitle,
      body: n.feedDueBody.replace(
        '{time}',
        formatDuration(ctx.minsSinceLastFeed, t.feed.hourShort, t.feed.minShort),
      ),
      urgent: true,
      push: true,
    })
  }

  // A household invitation waiting on an answer → the family page.
  if (ctx.pendingInvites > 0) {
    out.push({
      id: `family:${day}:${ctx.pendingInvites}`,
      kind: 'family',
      to: '/family',
      Icon: Users,
      title: n.familyTitle,
      body: (ctx.pendingInvites === 1 ? n.familyBody : n.familyBodyPlural).replace(
        '{n}',
        String(ctx.pendingInvites),
      ),
      urgent: true,
      push: true,
    })
  }

  // Floor time still owed today → the tracker. Silent while a session runs.
  const target = activityTargetForAge(ctx.months)
  if (!ctx.tummyRunning && ctx.tummyMinutes < target.mins) {
    out.push({
      id: `tummy:${day}`,
      kind: 'tummy',
      to: '/tracker',
      Icon: Timer,
      title: target.kind === 'movement' ? n.movementTitle : n.tummyTitle,
      body: n.tummyBody.replace('{mins}', String(target.mins - ctx.tummyMinutes)),
      push: true,
    })
  }

  // Today's reading, rotating through the chapter for this age → the Wiki.
  const topic = topicOfTheDay(ctx.months, now)
  if (topic) {
    out.push({
      id: `wiki:${day}:${topic.slug}`,
      kind: 'wiki',
      to: wikiPath(topic.slug),
      Icon: topic.icon,
      title: n.wikiTitle.replace('{topic}', topic.label(t)),
      body: topic.blurb(t),
      push: true,
    })
  }

  // Ambient, in-app only: true all day, so firing them at the OS would nag.
  if (ctx.checklistTotal > 0 && ctx.checklistDone < ctx.checklistTotal) {
    out.push({
      id: `checklist:${day}`,
      kind: 'checklist',
      to: '/',
      Icon: ListChecks,
      title: n.checklistTitle,
      body: n.checklistBody
        .replace('{done}', String(ctx.checklistDone))
        .replace('{total}', String(ctx.checklistTotal)),
      push: false,
    })
  }

  if (ctx.signedIn && !ctx.hasBaby) {
    out.push({
      id: `baby:${day}`,
      kind: 'baby',
      to: '/baby',
      Icon: BabyIcon,
      title: n.babyTitle,
      body: n.babyBody,
      push: false,
    })
  }

  return out
}
