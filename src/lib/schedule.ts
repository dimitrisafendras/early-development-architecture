import { scheduleBlocks, type ScheduleSlot } from '../data'

const DAY = 24 * 60

/** Local day key YYYY-MM-DD (not UTC) — used for checklist + tummy grouping. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Minutes since local midnight for the first "HH:MM" in a label — so it reads a
 *  bare time ("09:00") and the start of a range ("06:00 – 08:30") alike. */
export function minutesOfDay(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})/)
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
}

/** "HH:MM" for a minutes-since-midnight value, wrapping past midnight. */
export function clockAt(mins: number): string {
  const m = ((mins % DAY) + DAY) % DAY
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** The clock time a slot of `mins` starting at `time` finishes. */
export function slotEndTime(time: string, mins: number): string {
  return clockAt(minutesOfDay(time) + mins)
}

/** A duration as "25m" / "1h 30m", using the locale's hour/minute suffixes. */
export function formatDuration(mins: number, h: string, m: string): string {
  const hr = Math.floor(mins / 60)
  const mn = mins % 60
  if (hr === 0) return `${mn}${m}`
  return mn === 0 ? `${hr}${h}` : `${hr}${h} ${mn}${m}`
}

/**
 * Where the day is cut, in minutes since midnight.
 *
 * A day schedule is a 24-hour cycle that starts at the morning wake, not at
 * midnight — so sorting the moments by raw clock time would file the 02:00 night
 * feed at the *top* of the list, above the 07:00 wake, when it plainly belongs at
 * the bottom of the night that began the evening before.
 *
 * 06:00 is the cut because every sample day in the app wakes at 07:00 and the
 * latest night moment is a 05:30 return to sleep. A family whose child genuinely
 * wakes before 06:00 will see that moment file to the end of the list; the
 * alternative — deriving the cut from the largest gap between moments — picks
 * the evening for a newborn day whose longest gap is the first stretch of night.
 */
const DAY_ANCHOR_MIN = 6 * 60

/** A time's position within the day-cycle that starts at {@link DAY_ANCHOR_MIN}. */
export function clockRank(time: string): number {
  return (minutesOfDay(time) - DAY_ANCHOR_MIN + DAY) % DAY
}

/**
 * The moments in the order they happen, starting from the morning.
 *
 * Clock time is the single source of order on /schedule. The editor used to keep
 * a hand-maintained list position *as well as* a time, which is why it needed
 * drag handles and up/down buttons, why a preset always landed at the bottom
 * whatever time it carried, and why the two could disagree. Sorting here makes
 * "move this moment" the same action as "change its time".
 *
 * Stable: two moments at the same minute keep the order they were given in.
 *
 * Returns the **same array** when it is already in order. The caller re-sorts on
 * a timer after every time edit, and a fresh array each time would look like a
 * change to everything downstream — re-running the autosave and re-rendering the
 * whole list for a sort that moved nothing.
 */
export function sortByClock<T extends { time: string }>(slots: T[]): T[] {
  const sorted = slots
    .map((slot, i) => ({ slot, i }))
    .sort((a, b) => clockRank(a.slot.time) - clockRank(b.slot.time) || a.i - b.i)
  return sorted.every((entry, i) => entry.i === i) ? slots : sorted.map((entry) => entry.slot)
}

/**
 * How far a moment runs past the start of the one after it, in whole minutes.
 *
 * Measured along the day cycle rather than the raw clock, so a night sleep that
 * crosses midnight is compared against the small-hours feed that follows it and
 * not against the next morning. Zero when they do not overlap.
 */
export function overlapMinutes(
  slot: { time: string; mins: number },
  next: { time: string },
): number {
  const start = clockRank(slot.time)
  const nextStart = clockRank(next.time)
  // The next moment is later in the cycle by construction (the list is sorted);
  // if it reads as earlier, it has wrapped past the anchor, so push it a day on.
  const end = start + Math.max(0, slot.mins)
  const boundary = nextStart >= start ? nextStart : nextStart + DAY
  return Math.max(0, end - boundary)
}

export interface BlockWindow {
  index: number
  startMin: number
  /** Exclusive end; the last block wraps past midnight to the first block's start. */
  endMin: number
}

/**
 * The schedule blocks as contiguous windows over a 24h clock. Each block runs
 * until the next one starts; the final ("21:00 Onward") block wraps around to
 * the first block's start the next morning.
 */
export function blockWindows(): BlockWindow[] {
  const starts = scheduleBlocks.map((b) => minutesOfDay(b.time))
  return starts.map((startMin, index) => {
    const next = starts[(index + 1) % starts.length]
    const endMin = index === starts.length - 1 ? next + 24 * 60 : next
    return { index, startMin, endMin }
  })
}

/** Index of the block active at `now`, honoring the past-midnight wrap. */
export function activeBlockIndex(now: Date = new Date()): number {
  const mins = now.getHours() * 60 + now.getMinutes()
  const windows = blockWindows()
  for (const w of windows) {
    if (mins >= w.startMin && mins < w.endMin) return w.index
    // Wrap window (e.g. 21:00 → 06:00): also match the small hours.
    if (w.endMin > 24 * 60 && mins < w.endMin - 24 * 60) return w.index
  }
  return 0
}

/** Whole minutes from `now` until the given block next starts. */
export function minutesUntilBlockStart(index: number, now: Date = new Date()): number {
  const mins = now.getHours() * 60 + now.getMinutes()
  const start = blockWindows()[index].startMin
  const diff = (start - mins + 24 * 60) % (24 * 60)
  return diff
}

/**
 * The daily floor-time target in minutes, and which kind of movement it is.
 *
 * Under a year it is tummy time, ramping 5 → 60 min a day by four months (the
 * chart's ramp). From the first birthday tummy time stops being the point: the
 * WHO 24-hour guidance for 1–4 year-olds is **180 min a day of activity of any
 * intensity**, so the target jumps and the label has to change with it —
 * otherwise a two-year-old's tracker asks for 60 minutes of lying on their front.
 */
export function activityTargetForAge(months: number | null): {
  mins: number
  kind: 'tummy' | 'movement'
} {
  if (months != null && months >= 12) return { mins: 180, kind: 'movement' }
  return { mins: tummyTargetForAgeMonths(months), kind: 'tummy' }
}

/** Cumulative daily tummy-time target (minutes) by age; mirrors the chart ramp.
 *  Only meaningful under a year — see {@link activityTargetForAge}. */
export function tummyTargetForAgeMonths(months: number | null): number {
  if (months == null) return 60
  if (months < 1) return 5
  if (months < 2) return 15
  if (months < 3) return 30
  if (months < 4) return 45
  return 60
}

export interface SlotTiming {
  /** Index of the slot that follows, wrapping at the end of the list. */
  nextIdx: number
  /** The slot's own length in minutes, and the clock time it ends at. */
  mins: number
  endTime: string
  /** Whole minutes still to run of the activity itself (0 once it is over). */
  remaining: number
  /** Whole minutes from now until the *next* slot starts. */
  untilNext: number
  /** How far through the activity we are, 0–100 (clamped, min 2 so the arc shows). */
  pct: number
  /** `true` while now is inside the slot's own duration; `false` in the gap
   *  between it finishing and the next slot starting. */
  running: boolean
}

/** Where `now` sits inside the slot at `idx` — driven by the slot's own `mins`,
 *  not by the gap to the next slot, so a 25-minute feed reads as 25 minutes even
 *  when nothing else is scheduled for another 40. */
export function slotTiming(schedule: ScheduleSlot[], idx: number, now: Date = new Date()): SlotTiming {
  const slot = schedule[idx]
  const mins = Math.max(1, slot.mins || 1)
  const cur = now.getHours() * 60 + now.getMinutes()
  const elapsed = (cur - minutesOfDay(slot.time) + DAY) % DAY
  const nextIdx = (idx + 1) % schedule.length
  const untilNext = (minutesOfDay(schedule[nextIdx].time) - cur + DAY) % DAY
  const running = elapsed < mins
  return {
    nextIdx,
    mins,
    endTime: slotEndTime(slot.time, mins),
    remaining: running ? mins - elapsed : 0,
    untilNext,
    pct: Math.min(100, Math.max(2, (elapsed / mins) * 100)),
    running,
  }
}

/**
 * Index of the "current" entry in a time-ordered list of HH:MM times: the last
 * one at or before `now`. Before the first time of the day it wraps to the
 * latest entry (i.e. the previous day's last slot is still current overnight).
 */
export function activeTimeIndex(times: string[], now: Date = new Date()): number {
  const cur = now.getHours() * 60 + now.getMinutes()
  let best = -1
  let bestStart = -1
  let latest = 0
  let latestStart = -1
  times.forEach((t, i) => {
    const s = minutesOfDay(t)
    if (s <= cur && s > bestStart) {
      bestStart = s
      best = i
    }
    if (s > latestStart) {
      latestStart = s
      latest = i
    }
  })
  return best !== -1 ? best : latest
}

/** Index of the age band whose exclusive upper bound first exceeds `months`. */
export function bandIndex(months: number, uppers: number[]): number {
  for (let i = 0; i < uppers.length; i++) {
    if (months < uppers[i]) return i
  }
  return uppers.length - 1
}

export function ageInMonths(birthDate: string, at: Date = new Date()): number {
  const b = new Date(birthDate)
  let months = (at.getFullYear() - b.getFullYear()) * 12 + (at.getMonth() - b.getMonth())
  if (at.getDate() < b.getDate()) months -= 1
  return Math.max(0, months)
}

/**
 * The span one age band covers, phrased as a range rather than a start.
 *
 * "From 0 mo" / "From 3 mo" chips made the reader do the arithmetic to work out
 * what each day was actually for — and the last one had no visible end at all.
 * A range says it outright, and switches to years past twelve months because
 * that is how the age is spoken: "1–2 y", never "12–24 mo".
 *
 * `toMonths` is exclusive; `null` means the band is open-ended.
 */
export function formatAgeRange(
  fromMonths: number,
  toMonths: number | null,
  monthsShort: string,
  yearsShort: string,
): string {
  const inYears = (m: number) => m >= 12 && m % 12 === 0
  const value = (m: number) => (inYears(m) ? m / 12 : m)
  const unit = (m: number) => (inYears(m) ? yearsShort : monthsShort)

  if (toMonths == null) return `${value(fromMonths)} ${unit(fromMonths)}+`
  // One unit for the whole range when both ends agree, so it reads "0–3 mo"
  // rather than "0 mo–3 mo".
  if (unit(fromMonths) === unit(toMonths)) {
    return `${value(fromMonths)}–${value(toMonths)} ${unit(toMonths)}`
  }
  return `${value(fromMonths)} ${unit(fromMonths)}–${value(toMonths)} ${unit(toMonths)}`
}

/**
 * An age in months, phrased the way it is said aloud: "0 mo" under a year and
 * "2 y 3 mo" past it. Nobody calls a toddler "27 mo".
 *
 * Units come in as arguments rather than being read from `i18n` here, because
 * this module is imported by non-React code that has no locale.
 */
export function formatAgeLabel(months: number, monthsShort: string, yearsShort: string): string {
  if (months < 12) return `${months} ${monthsShort}`
  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest === 0 ? `${years} ${yearsShort}` : `${years} ${yearsShort} ${rest} ${monthsShort}`
}
