import { useMemo } from 'react'
import { fullDaySchedule, defaultSlotMins, type ScheduleSlot } from '../data'
import { useAppStore } from '../store'
import { useT, type Messages } from '../i18n'

/** The built-in schedule resolved with localized text (time + type + duration
 *  from data.ts, title/detail from i18n at the matching index). Used as the
 *  default and as the starting point when the editor first opens. */
export function buildDefaultSchedule(t: Messages): ScheduleSlot[] {
  return fullDaySchedule.map((s, i) => ({
    time: s.time,
    type: s.type,
    mins: s.mins,
    title: t.fullDay.slots[i].title,
    detail: t.fullDay.slots[i].detail,
  }))
}

/** A stored slot, made safe to render: schedules saved before slots carried a
 *  duration have no `mins`, and a hand-edited one can hold 0 — both would make
 *  every countdown and progress arc read as finished. */
function withDuration(slot: ScheduleSlot): ScheduleSlot {
  return slot.mins > 0 ? slot : { ...slot, mins: defaultSlotMins[slot.type] }
}

/** The effective day schedule: the user's customized one if present, otherwise
 *  the built-in localized schedule. */
export function useSchedule(): ScheduleSlot[] {
  const custom = useAppStore((s) => s.customSchedule)
  const t = useT()
  return useMemo(
    () => (custom && custom.length ? custom.map(withDuration) : buildDefaultSchedule(t)),
    [custom, t],
  )
}
