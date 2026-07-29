import { useMemo } from 'react'
import { dayTemplateForAge, defaultSlotMins, type DayTemplate, type ScheduleSlot } from '../data'
import { useAppStore } from '../store'
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

/** The effective day schedule: the user's customized one if present, otherwise
 *  the built-in day for the current baby's age — a newborn, a one-nap toddler
 *  and a three-year-old do not share a clock. */
export function useSchedule(): ScheduleSlot[] {
  const custom = useAppStore((s) => s.customSchedule)
  const baby = useBabyAge()
  const months = baby?.months ?? null
  const t = useT()
  return useMemo(
    () => (custom && custom.length ? custom.map(withDuration) : buildDefaultSchedule(t, months)),
    [custom, t, months],
  )
}
