import { useMemo } from 'react'
import { dayTemplateForAge, defaultSlotMins, type DayTemplate, type ScheduleSlot } from '../data'
import { useAppStore, type AgeSchedule } from '../store'
import { useBabyAge } from '../components/AgeBadge'
import { useT, type Messages } from '../i18n'

/** One age band's sample day resolved with localized text (time + type +
 *  duration from data.ts, title/detail from i18n at the matching index). Used as
 *  the default and as the starting point when the editor first opens. */
export function buildScheduleFromTemplate(t: Messages, template: DayTemplate): ScheduleSlot[] {
  const text = t.fullDay.days[template.id]
  return template.slots.map((s, i) => ({
    time: s.time,
    type: s.type,
    mins: s.mins,
    title: text[i].title,
    detail: text[i].detail,
  }))
}

/** The built-in schedule for a baby of `months` (null → the 3–6 month day). */
export function buildDefaultSchedule(t: Messages, months: number | null = null): ScheduleSlot[] {
  return buildScheduleFromTemplate(t, dayTemplateForAge(months))
}

/** A stored slot, made safe to render: schedules saved before slots carried a
 *  duration have no `mins`, and a hand-edited one can hold 0 — both would make
 *  every countdown and progress arc read as finished. */
function withDuration(slot: ScheduleSlot): ScheduleSlot {
  return slot.mins > 0 ? slot : { ...slot, mins: defaultSlotMins[slot.type] }
}

/**
 * The user-authored day in effect at `months`, or `null` if none covers it.
 *
 * The list is sorted ascending, so the match is the last band whose
 * `fromMonths` the child has reached. A child younger than every band falls
 * through to `null` and gets the built-in day — a schedule written for
 * "from 12 months" must not govern a newborn just because it is the only one
 * saved.
 */
export function scheduleForAge(list: AgeSchedule[], months: number | null): AgeSchedule | null {
  if (!list.length) return null
  // No baby on file: the earliest band is the only defensible guess.
  if (months == null) return list[0].fromMonths === 0 ? list[0] : null
  let match: AgeSchedule | null = null
  for (const entry of list) {
    if (entry.fromMonths <= months) match = entry
    else break
  }
  return match
}

/** The effective day schedule: the user's band for this age if one covers it,
 *  otherwise the built-in day for the age — a newborn, a one-nap toddler and a
 *  three-year-old do not share a clock, and neither do their saved days. */
export function useSchedule(): ScheduleSlot[] {
  const custom = useAppStore((s) => s.customSchedules)
  const baby = useBabyAge()
  const months = baby?.months ?? null
  const t = useT()
  return useMemo(() => {
    const match = scheduleForAge(custom, months)
    return match && match.slots.length
      ? match.slots.map(withDuration)
      : buildDefaultSchedule(t, months)
  }, [custom, t, months])
}
