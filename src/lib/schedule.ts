import { scheduleBlocks } from '../data'

/** Local day key YYYY-MM-DD (not UTC) — used for checklist + tummy grouping. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Minutes since local midnight for the "HH:MM" that starts a block's label. */
function startMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})/)
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
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
  const starts = scheduleBlocks.map((b) => startMinutes(b.time))
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

/** Cumulative daily tummy-time target (minutes) by age; mirrors the chart ramp. */
export function tummyTargetForAgeMonths(months: number | null): number {
  if (months == null) return 60
  if (months < 1) return 5
  if (months < 2) return 15
  if (months < 3) return 30
  if (months < 4) return 45
  return 60
}

function minutesOf(time: string): number {
  const m = time.match(/(\d{1,2}):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
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
    const s = minutesOf(t)
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
