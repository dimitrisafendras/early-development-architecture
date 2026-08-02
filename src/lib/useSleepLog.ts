import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'
import { todayKey } from './schedule'
import {
  listSleepsSince,
  findOpenSleep,
  startSleep,
  endSleep,
  insertClosedSleep,
  updateSleep,
  deleteSleep,
  type SleepLog,
} from './db'

const LOCAL_KEY = 'eda-sleep-local'
/** The id of a sleep started while signed in, so a reload can still stop it. */
const RUNNING_REMOTE_ID = 'eda-sleep-running-id'
/** The start of a sleep running while signed out. */
const RUNNING_START = 'eda-sleep-running-start'

export interface SleepEntry {
  id: string
  started_at: string
  /** Null means the child is asleep right now. */
  ended_at: string | null
  note: string | null
  /** Absent only on rows written before this was scoped to a child. */
  baby_id?: string | null
}

function loadLocal(): SleepEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}
function saveLocal(list: SleepEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}
/** This child's sleeps, plus the legacy unassigned bucket — see `forBaby`. */
function localForBaby(babyId: string | null): SleepEntry[] {
  return loadLocal().filter((s) => (s.baby_id ?? null) === babyId || s.baby_id == null)
}

/** Thirty days back, which is what the history list and the week chart need. */
function windowStartISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 29)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/** Whole minutes between two instants, floored — a sleep of 89 seconds is 1 min. */
export function sleepMinutes(entry: { started_at: string; ended_at: string | null }): number {
  if (!entry.ended_at) return 0
  return Math.max(
    0,
    Math.floor((new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime()) / 60000),
  )
}

/**
 * The sleep log for one child. Local-first like the feed log and the tracker:
 * it works signed out against localStorage and syncs to `sleep_logs` when
 * signed in.
 *
 * **A sleep is an interval, not an event.** That is the difference from the feed
 * log and the reason this hook carries a running state at all: a feed is stamped
 * at a moment, a sleep has a start you know when it happens and an end you only
 * know later. So there are two ways in, and both are first-class — start it when
 * they go down and stop it when they wake, or log the whole thing afterwards
 * with both times, which is what you actually do for a night nobody was awake to
 * time.
 *
 * **A day's sleep is attributed to the day it *started*.** A night that runs
 * 21:00–06:30 belongs to the night it began, not split across two dates —
 * splitting it would report every family as sleeping half as much as they do,
 * twice.
 */
export function useSleepLog(babyId: string | null, householdId: string | null) {
  const { session } = useSession()
  const signedIn = isSupabaseEnabled && Boolean(session)
  const [sleeps, setSleeps] = useState<SleepEntry[]>([])
  const [running, setRunning] = useState<SleepEntry | null>(null)
  const [, tick] = useState(0)

  // The same stale-response guard the tracker and the feed log use: `babyId`
  // arrives asynchronously, so an unscoped load is always in flight beside the
  // scoped one and used to win.
  const latestRequest = useRef(0)

  const refresh = useCallback(async () => {
    const request = (latestRequest.current += 1)
    const apply = (rows: SleepEntry[]) => {
      if (request !== latestRequest.current) return
      setSleeps(rows.filter((s) => s.ended_at))
      setRunning(rows.find((s) => !s.ended_at) ?? null)
    }
    if (signedIn) {
      const rows = await listSleepsSince(windowStartISO(), babyId)
      const open = await findOpenSleep(babyId)
      const mapped: SleepEntry[] = rows.map((r: SleepLog) => ({
        id: r.id,
        started_at: r.started_at,
        ended_at: r.ended_at,
        note: r.note,
      }))
      // A sleep that began before the 30-day window and has not ended is still
      // running; the window query would miss it, so it is fetched separately.
      if (open && !mapped.some((m) => m.id === open.id)) {
        mapped.push({ id: open.id, started_at: open.started_at, ended_at: null, note: open.note })
      }
      apply(mapped)
    } else {
      const cutoff = new Date(windowStartISO()).getTime()
      apply(
        localForBaby(babyId)
          .filter((s) => !s.ended_at || new Date(s.started_at).getTime() >= cutoff)
          .sort((a, b) => b.started_at.localeCompare(a.started_at)),
      )
    }
  }, [signedIn, babyId])

  useEffect(() => {
    void refresh().catch(() => {})
  }, [refresh])

  // **Two rates, because there are two things being kept honest.**
  //
  // "Time since last sleep" is a fact about hours ago and moves once a minute at
  // most; a running sleep is a stopwatch, and at 30s it showed `0min` for a full
  // minute after Start, which is indistinguishable from a button that did
  // nothing. So the second hand runs only while a sleep is actually running —
  // the same gate `useTummyTracker` puts on its own 1s tick — and the page falls
  // back to the cheap rate the moment it stops.
  const isRunning = Boolean(running)
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), isRunning ? 1_000 : 30_000)
    return () => clearInterval(t)
  }, [isRunning])

  const start = useCallback(
    async (startedAt: string = new Date().toISOString()) => {
      if (running) return
      if (signedIn) {
        const row = await startSleep(babyId, startedAt, householdId).catch(() => null)
        if (row) localStorage.setItem(RUNNING_REMOTE_ID, row.id)
      } else {
        const entry: SleepEntry = {
          id: crypto.randomUUID(),
          started_at: startedAt,
          ended_at: null,
          note: null,
          baby_id: babyId,
        }
        saveLocal([...loadLocal(), entry])
        localStorage.setItem(RUNNING_START, startedAt)
      }
      await refresh().catch(() => {})
    },
    [running, signedIn, babyId, householdId, refresh],
  )

  const stop = useCallback(
    async (endedAt: string = new Date().toISOString()) => {
      if (!running) return
      if (signedIn) {
        await endSleep(running.id, endedAt).catch(() => {})
        localStorage.removeItem(RUNNING_REMOTE_ID)
      } else {
        saveLocal(loadLocal().map((s) => (s.id === running.id ? { ...s, ended_at: endedAt } : s)))
        localStorage.removeItem(RUNNING_START)
      }
      await refresh().catch(() => {})
    },
    [running, signedIn, refresh],
  )

  /** Log a sleep that has already finished, with both times. */
  const add = useCallback(
    async (input: { started_at: string; ended_at: string; note: string | null }) => {
      if (signedIn) {
        await insertClosedSleep({
          ...input,
          baby_id: babyId,
          household_id: householdId,
        }).catch(() => {})
      } else {
        saveLocal([...loadLocal(), { id: crypto.randomUUID(), ...input, baby_id: babyId }])
      }
      await refresh().catch(() => {})
    },
    [signedIn, babyId, householdId, refresh],
  )

  const update = useCallback(
    async (id: string, patch: { started_at?: string; ended_at?: string; note?: string | null }) => {
      if (signedIn) await updateSleep(id, patch).catch(() => {})
      else saveLocal(loadLocal().map((s) => (s.id === id ? { ...s, ...patch } : s)))
      await refresh().catch(() => {})
    },
    [signedIn, refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      if (signedIn) await deleteSleep(id).catch(() => {})
      else saveLocal(loadLocal().filter((s) => s.id !== id))
      await refresh().catch(() => {})
    },
    [signedIn, refresh],
  )

  const today = todayKey()
  // Attributed to the day the sleep *started* — see the note on this hook.
  const todaySleeps = sleeps.filter((s) => todayKey(new Date(s.started_at)) === today)
  const todayMinutes = todaySleeps.reduce((sum, s) => sum + sleepMinutes(s), 0)
  const longestToday = todaySleeps.reduce((max, s) => Math.max(max, sleepMinutes(s)), 0)
  const lastSleep = sleeps[0] ?? null
  // Seconds, because the only thing that reads this is a stopwatch. Every
  // number that *reports* a sleep — today's total, the longest one, the chart —
  // counts finished sleeps in minutes and does not go through here.
  const runningSeconds = running
    ? Math.max(0, Math.floor((Date.now() - new Date(running.started_at).getTime()) / 1000))
    : 0
  const minsSinceLast = lastSleep?.ended_at
    ? Math.floor((Date.now() - new Date(lastSleep.ended_at).getTime()) / 60000)
    : null

  return {
    signedIn,
    sleeps,
    todaySleeps,
    todayMinutes,
    longestToday,
    lastSleep,
    running,
    runningSeconds,
    minsSinceLast,
    start,
    stop,
    add,
    update,
    remove,
  }
}
