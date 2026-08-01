import { useCallback, useEffect, useState } from 'react'
import { isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'
import { todayKey } from './schedule'
import {
  listSessionsSince,
  findOpenSession,
  openSession,
  closeSession,
  insertClosedSession,
  updateSession,
  deleteSession,
  type TummySession,
} from './db'

const ACTIVE_START = 'eda-tummy-active'
const ACTIVE_REMOTE_ID = 'eda-tummy-active-id'
const LOCAL_SESSIONS = 'eda-tummy-local'
const STALE_MS = 3 * 60 * 60 * 1000 // 3h — forgotten sessions auto-discard

interface LocalSession {
  id: string
  started_at: string
  ended_at: string
}

function loadLocal(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSIONS) ?? '[]')
  } catch {
    return []
  }
}
function saveLocal(list: LocalSession[]) {
  localStorage.setItem(LOCAL_SESSIONS, JSON.stringify(list))
}

/** Start of the history window kept in memory (90 days). The week chart and
 *  streak still derive their own 7-day slice from this set. */
function historyStartISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 89)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export interface TrackerSession {
  id: string
  started_at: string
  ended_at: string
}

export function useTummyTracker(babyId: string | null, householdId: string | null = null) {
  const { session } = useSession()
  const signedIn = isSupabaseEnabled && Boolean(session)
  const [activeStart, setActiveStart] = useState<Date | null>(null)
  const [sessions, setSessions] = useState<TrackerSession[]>([])
  const [, setTick] = useState(0)

  const refreshSessions = useCallback(async () => {
    if (signedIn) {
      const rows = await listSessionsSince(historyStartISO())
      setSessions(
        rows
          .filter((r): r is TummySession & { ended_at: string } => Boolean(r.ended_at))
          .map((r) => ({ id: r.id, started_at: r.started_at, ended_at: r.ended_at })),
      )
    } else {
      const cutoff = new Date(historyStartISO()).getTime()
      setSessions(loadLocal().filter((s) => new Date(s.started_at).getTime() >= cutoff))
    }
  }, [signedIn])

  // Bootstrap: resume an in-progress session or discard a stale one.
  useEffect(() => {
    let cancelled = false
    async function boot() {
      const storedStart = localStorage.getItem(ACTIVE_START)
      if (storedStart) {
        const start = new Date(storedStart)
        if (Date.now() - start.getTime() > STALE_MS) {
          // Forgotten — drop it (and any matching open remote row).
          localStorage.removeItem(ACTIVE_START)
          const rid = localStorage.getItem(ACTIVE_REMOTE_ID)
          if (signedIn && rid) await deleteSession(rid).catch(() => {})
          localStorage.removeItem(ACTIVE_REMOTE_ID)
        } else if (!cancelled) {
          setActiveStart(start)
        }
      } else if (signedIn) {
        // A session opened on another device counts as active here too — but it
        // gets the same staleness check as a local one. It used to be adopted
        // unconditionally, so a row left open by a sign-out (stop takes the
        // local branch and never closes the remote row) would be picked up days
        // later and shown as a session running for four thousand minutes.
        const open = await findOpenSession().catch(() => null)
        if (open && !cancelled) {
          const started = new Date(open.started_at)
          if (Date.now() - started.getTime() > STALE_MS) {
            await deleteSession(open.id).catch(() => {})
          } else {
            setActiveStart(started)
            localStorage.setItem(ACTIVE_START, open.started_at)
            localStorage.setItem(ACTIVE_REMOTE_ID, open.id)
          }
        }
      }
      await refreshSessions().catch(() => {})
    }
    void boot()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn])

  // Live elapsed clock while a session runs.
  useEffect(() => {
    if (!activeStart) return
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [activeStart])

  const start = useCallback(async () => {
    const now = new Date()
    setActiveStart(now)
    localStorage.setItem(ACTIVE_START, now.toISOString())
    if (signedIn) {
      const row = await openSession(babyId, now.toISOString(), householdId).catch(() => null)
      if (row) localStorage.setItem(ACTIVE_REMOTE_ID, row.id)
    }
  }, [signedIn, babyId, householdId])

  const stop = useCallback(async () => {
    if (!activeStart) return
    const endedAt = new Date().toISOString()
    const startedAt = activeStart.toISOString()
    // A mis-tap — Start then Stop — used to bank a zero-minute session that
    // every reading then believed: history showed "0 min", the session count
    // included it, and it became the "last session" the pacing line reported.
    // Below half a minute there is nothing to record.
    const tooShort = new Date(endedAt).getTime() - activeStart.getTime() < 30_000
    setActiveStart(null)
    localStorage.removeItem(ACTIVE_START)
    if (tooShort) {
      const rid = localStorage.getItem(ACTIVE_REMOTE_ID)
      localStorage.removeItem(ACTIVE_REMOTE_ID)
      if (signedIn && rid) await deleteSession(rid).catch(() => {})
      await refreshSessions().catch(() => {})
      return
    }
    const rid = localStorage.getItem(ACTIVE_REMOTE_ID)
    localStorage.removeItem(ACTIVE_REMOTE_ID)
    if (signedIn && rid) {
      await closeSession(rid, endedAt).catch(() => {})
    } else {
      const local = loadLocal()
      local.push({ id: crypto.randomUUID(), started_at: startedAt, ended_at: endedAt })
      saveLocal(local)
    }
    await refreshSessions().catch(() => {})
  }, [activeStart, signedIn, refreshSessions])

  /**
   * Log a session that has already happened — the one you forgot to time.
   *
   * Same two paths as `stop`, so a hand-logged session is indistinguishable
   * from a timed one everywhere downstream: same table, same local list, same
   * `household_id`, so the rest of the household sees it too.
   */
  const addManual = useCallback(
    async (startedAt: string, endedAt: string) => {
      if (signedIn) {
        await insertClosedSession(babyId, startedAt, endedAt, householdId).catch(() => {})
      } else {
        const local = loadLocal()
        local.push({ id: crypto.randomUUID(), started_at: startedAt, ended_at: endedAt })
        saveLocal(local)
      }
      await refreshSessions().catch(() => {})
    },
    [signedIn, babyId, householdId, refreshSessions],
  )

  const update = useCallback(
    async (id: string, patch: { started_at?: string; ended_at?: string }) => {
      if (signedIn) {
        await updateSession(id, patch).catch(() => {})
      } else {
        saveLocal(loadLocal().map((s) => (s.id === id ? { ...s, ...patch } : s)))
      }
      await refreshSessions().catch(() => {})
    },
    [signedIn, refreshSessions],
  )

  const remove = useCallback(
    async (id: string) => {
      if (signedIn) {
        await deleteSession(id).catch(() => {})
      } else {
        saveLocal(loadLocal().filter((s) => s.id !== id))
      }
      await refreshSessions().catch(() => {})
    },
    [signedIn, refreshSessions],
  )

  const today = todayKey()
  const todaySessions = sessions.filter((s) => todayKey(new Date(s.started_at)) === today)

  // Not counting the running session yet; it lands on stop.
  const completedMinutes = todaySessions.reduce((sum, s) => {
    const ms = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()
    return sum + Math.max(0, ms) / 60000
  }, 0)

  const elapsedSeconds = activeStart
    ? Math.floor((Date.now() - activeStart.getTime()) / 1000)
    : 0

  return {
    signedIn,
    isRunning: Boolean(activeStart),
    /** When the running session started, so a hand-logged one can refuse to
     *  overlap it — those minutes get banked again on stop. */
    activeStart,
    elapsedSeconds,
    sessions,
    todaySessions,
    /** Exact, deliberately unrounded: rounding here made two displays of one
     *  fact disagree — the readout could show "5 / 5 min" off 4:35 of real
     *  time, and `remaining` could round to 0 while the target was not met.
     *  Callers round at the last moment. */
    completedMinutes,
    start,
    stop,
    addManual,
    update,
    remove,
    refreshSessions,
  }
}

/** Cumulative minutes per day for the last 7 days (oldest → newest). */
export function useWeeklyMinutes(sessions: TrackerSession[], signedIn: boolean) {
  void signedIn
  const days: { key: string; minutes: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ key: todayKey(d), minutes: 0 })
  }
  for (const s of sessions) {
    const key = todayKey(new Date(s.started_at))
    const bucket = days.find((d) => d.key === key)
    if (bucket) {
      const ms = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()
      bucket.minutes += Math.max(0, ms) / 60000
    }
  }
  return days
}
