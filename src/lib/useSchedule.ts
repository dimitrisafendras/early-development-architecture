import { useMemo } from 'react'
import {
  dayTemplateForAge,
  defaultSlotMins,
  type DayTemplate,
  type MomentKey,
  type ScheduleSlot,
} from '../data'
import { useAppStore, type AgeSchedule } from '../store'
import { useBabyAge } from '../components/AgeBadge'
import { allMessages, useT, type Messages } from '../i18n'

/** One age band's sample day resolved with localized text (time + type +
 *  duration from data.ts, title/detail looked up by the slot's `moment` key).
 *  Used as the default and as the starting point when the editor first opens.
 *
 *  The lookup is by name, not by array index: the two lists used to be paired
 *  positionally, so inserting a slot in `data.ts` silently re-labelled every
 *  moment after it and a length mismatch threw at render. */
export function buildScheduleFromTemplate(t: Messages, template: DayTemplate): ScheduleSlot[] {
  return template.slots.map((s) => {
    const text = t.fullDay.moments[s.moment]
    return {
      time: s.time,
      type: s.type,
      mins: s.mins,
      title: text.title,
      detail: text.detail,
      // Kept, so a saved copy of this slot can be re-read in the language the
      // app is in rather than the one it was saved in. See `ScheduleSlot`.
      moment: s.moment,
    }
  })
}

/**
 * A stored slot with its words in the current language.
 *
 * Saved programs snapshot `title` and `detail` as text. That is correct for
 * anything the caregiver typed and wrong for everything the app wrote: the day
 * on the landing screen kept the language it was authored in, so switching to
 * Greek left twenty-odd English moments in the middle of a Greek app — and the
 * built-in day beside it, which does follow the language, made it look like a
 * loading bug rather than a design one.
 *
 * A key that is no longer in the message catalogue (a program saved before a
 * moment was renamed) falls back to the stored text, which is the last thing
 * that was true rather than a blank row.
 */
export function localizeSlot(t: Messages, slot: ScheduleSlot): ScheduleSlot {
  const key = slot.moment ?? momentForTitle(slot.title)
  if (!key) return slot
  const text = t.fullDay.moments[key]
  if (!text) return slot
  return { ...slot, moment: key, title: text.title, detail: text.detail }
}

/**
 * The moment a stored title came from, for programs saved before slots carried
 * the key.
 *
 * Without this the fix would only reach days authored from today on, and every
 * program already saved would stay in the language it was written in for ever —
 * which is most of them, and all of the ones that made the drift visible.
 *
 * Both catalogues, because the language a program was saved in is exactly what
 * is not recorded. Titles that appear under more than one key are dropped rather
 * than guessed, and a title nobody's catalogue claims is a name the caregiver
 * typed and is left alone — the same test `appWrittenTitles` on `/schedule`
 * already applies before renaming a row.
 */
const titleToMoment: Map<string, MomentKey | null> = (() => {
  const map = new Map<string, MomentKey | null>()
  for (const messages of allMessages) {
    for (const [key, text] of Object.entries(messages.fullDay.moments)) {
      const title = text.title.trim()
      // Already claimed by a different moment: ambiguous, so neither gets it.
      map.set(title, map.has(title) && map.get(title) !== key ? null : (key as MomentKey))
    }
  }
  return map
})()

function momentForTitle(title: string): MomentKey | null {
  return titleToMoment.get(title.trim()) ?? null
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
      ? match.slots.map((s) => localizeSlot(t, withDuration(s)))
      : buildDefaultSchedule(t, months)
  }, [custom, t, months])
}
