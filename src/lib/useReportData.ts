import { useCallback, useEffect, useState } from 'react'
import { isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'
import { listFeedsSince, listSessionsSince, listMeasurements } from './db'
import type { FeedLog, Measurement, TummySession } from './db'
import type { FeedEntry } from './useFeedLog'
import type { TrackerSession } from './useTummyTracker'
import { toDateKey } from './dates'

/**
 * Everything the printable report shows, over an arbitrary range.
 *
 * **Why this exists rather than reusing the page hooks.** `useFeedLog` fetches
 * the last 7 days and `useTummyTracker` the last 90 — windows sized for what
 * those pages actually draw. The report offers 30-day and all-time ranges, so
 * reusing them would silently produce a report missing most of its rows. The
 * alternative, widening those windows, would make `/feed` and `/tracker` pay on
 * every load for data only this page wants. So the report fetches its own, and
 * the page hooks keep their tuned windows.
 *
 * Local-first like the rest of the app: signed out, feeds and tummy sessions
 * come from the same localStorage keys the trackers write. Measurements are
 * Supabase-only — there is no local growth store to read — so `growthAvailable`
 * lets the report say so rather than render an empty section that looks like
 * "you have never measured your baby".
 */

const LOCAL_FEEDS = 'eda-feeds-local'
const LOCAL_SESSIONS = 'eda-tummy-local'

export type ReportRange = '7d' | '30d' | 'all'

/** Days each range covers, or `null` for "everything there is". */
const RANGE_DAYS: Record<ReportRange, number | null> = { '7d': 7, '30d': 30, all: null }

/**
 * Start of the range as an ISO instant.
 *
 * All-time resolves to the baby's birth date rather than the epoch: no entry can
 * predate the child, and it keeps the query bounded instead of asking the
 * database for every row anyone ever wrote.
 */
export function rangeStartISO(range: ReportRange, birthDate: string | null): string {
  const days = RANGE_DAYS[range]
  if (days == null) {
    const born = birthDate ? new Date(`${birthDate}T00:00:00`) : null
    if (born && !Number.isNaN(born.getTime())) return born.toISOString()
    // No baby on file: fall back to a wide but finite window.
    const d = new Date()
    d.setFullYear(d.getFullYear() - 5)
    return d.toISOString()
  }
  const d = new Date()
  d.setDate(d.getDate() - (days - 1))
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function loadLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

export interface ReportData {
  feeds: FeedEntry[]
  sessions: TrackerSession[]
  measurements: Measurement[]
  /** False when signed out — growth lives only in Supabase. */
  growthAvailable: boolean
  loading: boolean
}

export function useReportData(babyId: string | null, sinceISO: string): ReportData {
  const { session } = useSession()
  const signedIn = isSupabaseEnabled && Boolean(session)
  const [feeds, setFeeds] = useState<FeedEntry[]>([])
  const [sessions, setSessions] = useState<TrackerSession[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (!signedIn) {
        // Local rows carry no baby id, so they are filtered by date only.
        setFeeds(loadLocal<FeedEntry>(LOCAL_FEEDS).filter((f) => f.fed_at >= sinceISO))
        setSessions(loadLocal<TrackerSession>(LOCAL_SESSIONS).filter((s) => s.started_at >= sinceISO))
        setMeasurements([])
        return
      }
      const [feedRows, sessionRows, measureRows] = await Promise.all([
        listFeedsSince(sinceISO),
        listSessionsSince(sinceISO),
        babyId ? listMeasurements(babyId) : Promise.resolve([] as Measurement[]),
      ])
      setFeeds(
        feedRows.map((r: FeedLog) => ({
          id: r.id,
          fed_at: r.fed_at,
          method: r.method,
          amount_ml: r.amount_ml,
          minutes: r.minutes,
          note: r.note,
        })),
      )
      // A session still running has no `ended_at` and therefore no duration —
      // it belongs to the timer on /tracker, not to a record of what happened.
      setSessions(
        sessionRows
          .filter((r: TummySession): r is TummySession & { ended_at: string } => Boolean(r.ended_at))
          .map((r) => ({ id: r.id, started_at: r.started_at, ended_at: r.ended_at })),
      )
      // `listMeasurements` returns the baby's whole history; the range applies
      // here so growth is clipped the same way the two logs are.
      setMeasurements(measureRows.filter((m) => `${m.measured_on}T00:00:00` >= sinceISO.slice(0, 19)))
    } finally {
      setLoading(false)
    }
  }, [signedIn, babyId, sinceISO])

  useEffect(() => {
    void load()
  }, [load])

  return { feeds, sessions, measurements, growthAvailable: signedIn, loading }
}

/** Local day keys from `sinceISO` to today, oldest first — the report's spine. */
export function dayKeysInRange(sinceISO: string): string[] {
  const start = new Date(sinceISO)
  start.setHours(0, 0, 0, 0)
  const keys: string[] = []
  const cursor = new Date(start)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Guard against a pathological range (a birth date typo years out) producing
  // a report with tens of thousands of rows.
  while (cursor <= today && keys.length < 400) {
    keys.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}
