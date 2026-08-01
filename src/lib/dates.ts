/**
 * Date-key helpers.
 *
 * The app stores every calendar date as a local `YYYY-MM-DD` key (see
 * `todayKey` in `./schedule`) so nothing is ever shifted by a timezone.
 * These helpers convert between that key and a local `Date` positioned at
 * midday — midday keeps DST transitions from rolling a day over.
 */
import { useAppStore } from '../store'
import { todayKey } from './schedule'

/** Local `Date` at midday for a `YYYY-MM-DD` key, or `null` if unparseable. */
export function parseDateKey(key: string | null | undefined): Date | null {
  if (!key) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d), 12)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `YYYY-MM-DD` key for a local `Date`. */
export const toDateKey = todayKey

/** A new key `days` away from `key` (negative goes back). */
export function shiftDateKey(key: string, days: number): string {
  const date = parseDateKey(key)
  if (!date) return key
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

/* ---- Time and date-time keys ---------------------------------------------
   Times are `HH:MM` and date-times are `YYYY-MM-DDTHH:MM` — the same shape a
   native `datetime-local` input produces, so existing state keeps working. */

const TIME = /^(\d{2}):(\d{2})$/

/** `[hours, minutes]` for an `HH:MM` string, or `null` if unparseable. */
export function parseTimeKey(key: string | null | undefined): [number, number] | null {
  if (!key) return null
  const match = TIME.exec(key)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return [h, m]
}

const pad = (n: number) => String(n).padStart(2, '0')

/** `HH:MM` for an hour and minute pair. */
export function toTimeKey(hours: number, minutes: number): string {
  return `${pad(hours)}:${pad(minutes)}`
}

/** Splits `YYYY-MM-DDTHH:MM` into its two keys. */
export function splitDateTimeKey(key: string | null | undefined): { date: string; time: string } | null {
  if (!key) return null
  const [date, time] = key.split('T')
  if (!parseDateKey(date) || !parseTimeKey(time)) return null
  return { date, time }
}

/** Joins a date key and a time key back into `YYYY-MM-DDTHH:MM`. */
export function joinDateTimeKey(date: string, time: string): string {
  return `${date}T${time}`
}

/** The current local moment as `YYYY-MM-DDTHH:MM`. */
export function nowDateTimeKey(at: Date = new Date()): string {
  return joinDateTimeKey(toDateKey(at), toTimeKey(at.getHours(), at.getMinutes()))
}

/* ---- ISO instants <-> keys ------------------------------------------------
   Logged entries (feeds, tummy sessions) are stored as ISO instants but edited
   through the pickers, which speak keys. These two are the whole round-trip, in
   one place: `/feed` and `/tracker` each carried a private `timeOfDay` +
   `withTimeOfDay` pair that could only rewrite the *time* of an entry, so an
   entry stamped onto the wrong calendar day could not be corrected at all. */

/** Local `HH:MM` for an ISO instant. */
export function timeKeyFromISO(iso: string): string {
  const date = new Date(iso)
  return toTimeKey(date.getHours(), date.getMinutes())
}

/** Local `YYYY-MM-DDTHH:MM` for an ISO instant. */
export function dateTimeKeyFromISO(iso: string): string {
  return nowDateTimeKey(new Date(iso))
}

/**
 * The ISO instant a local `YYYY-MM-DDTHH:MM` key names.
 *
 * Seconds are zeroed rather than carried over from the entry being edited: the
 * pickers only ever offer minutes, so keeping a stray `:37` would make a saved
 * time differ from the one displayed.
 */
export function isoFromDateTimeKey(key: string): string {
  const parts = splitDateTimeKey(key)
  if (!parts) return new Date().toISOString()
  const date = parseDateKey(parts.date)!
  const [h, m] = parseTimeKey(parts.time)!
  date.setHours(h, m, 0, 0)
  return date.toISOString()
}

/** A new date-time `minutes` away (negative goes back), crossing days safely. */
export function shiftDateTimeKey(key: string, minutes: number): string {
  const parts = splitDateTimeKey(key)
  if (!parts) return key
  const [h, m] = parseTimeKey(parts.time)!
  const date = parseDateKey(parts.date)!
  date.setHours(h, m + minutes, 0, 0)
  return nowDateTimeKey(date)
}

/**
 * Whether the locale writes times on a 12-hour clock. Probed with the same
 * options `formatTimeKey` uses, so the hour column and the field that displays
 * the result can never disagree about the clock.
 */
export function usesTwelveHourClock(locale?: string): boolean {
  const resolved = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).resolvedOptions()
  return Boolean(resolved.hour12)
}

/** Formats an `HH:MM` key the way the locale writes times. */
export function formatTimeKey(key: string | null | undefined, locale?: string): string {
  const parsed = parseTimeKey(key)
  if (!parsed) return key ?? ''
  const date = new Date(2000, 0, 1, parsed[0], parsed[1])
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)
}

/**
 * Formats a date-time for a trigger. Today's entries read as "Today, 23:45" —
 * which is what almost every entry is, and the date adds nothing there.
 */
export function formatDateTimeKey(
  key: string | null | undefined,
  locale?: string,
  todayLabel?: string,
): string {
  const parts = splitDateTimeKey(key)
  if (!parts) return key ?? ''
  const time = formatTimeKey(parts.time, locale)
  if (todayLabel && parts.date === toDateKey(new Date())) return `${todayLabel}, ${time}`
  return `${formatDateKey(parts.date, locale, { day: 'numeric', month: 'short' })}, ${time}`
}

/**
 * BCP-47 tag for the active UI language — drives all `Intl` date formatting.
 *
 * The `-u-hc-h23` extension pins both languages to a 24-hour clock. Greek and
 * British English are written that way in practice, but CLDR resolves `el` to a
 * 12-hour clock with π.μ./μ.μ., which no Greek parent would expect to read at
 * 3am. Pinning it here means every `Intl` call downstream agrees.
 */
export function useDateLocale(): string {
  const locale = useAppStore((s) => s.locale)
  return locale === 'el' ? 'el-GR-u-hc-h23' : 'en-GB-u-hc-h23'
}

/** Formats a date key for display, falling back to the raw key. */
export function formatDateKey(
  key: string | null | undefined,
  locale?: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  const date = parseDateKey(key)
  if (!date) return key ?? ''
  return new Intl.DateTimeFormat(locale, options).format(date)
}
