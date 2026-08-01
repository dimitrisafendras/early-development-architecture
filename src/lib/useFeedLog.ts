import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'
import { todayKey } from './schedule'
import { listFeedsSince, addFeed, updateFeed, deleteFeed, type FeedMethod, type FeedLog } from './db'

const LOCAL_KEY = 'eda-feeds-local'

export interface FeedEntry {
  id: string
  fed_at: string
  method: FeedMethod
  amount_ml: number | null
  minutes: number | null
  note: string | null
  /** Absent on rows written before feeds were scoped to a child. */
  baby_id?: string | null
}

function loadLocal(): FeedEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}

/**
 * This child's feeds, plus any from before feeds were scoped to a child.
 *
 * The signed-out list was undifferentiated, so a second baby inherited the
 * first's whole feed history — and the age-banded "feeds per day" range it was
 * being judged against belonged to whichever baby was selected. Unassigned rows
 * are the legacy bucket; `add` stamps every new one, so it drains.
 */
function localForBaby(babyId: string | null): FeedEntry[] {
  return loadLocal().filter((f) => (f.baby_id ?? null) === babyId || f.baby_id == null)
}
function saveLocal(list: FeedEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}
function sevenDaysAgoISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export interface AddFeedInput {
  fed_at: string
  method: FeedMethod
  amount_ml: number | null
  minutes: number | null
  note: string | null
}

/**
 * Feed log for the current baby. Local-first (works signed out via
 * localStorage); syncs to `feed_logs` when signed in. Returns the last 7 days,
 * newest first, plus today's subset for the totals.
 */
export function useFeedLog(babyId: string | null, householdId: string | null) {
  const { session } = useSession()
  const signedIn = isSupabaseEnabled && Boolean(session)
  const [feeds, setFeeds] = useState<FeedEntry[]>([])
  const [, tick] = useState(0)

  // Same stale-response guard as the tracker: `refresh` depends on `babyId`,
  // which arrives asynchronously, so two loads are in flight and the unscoped
  // one must not win.
  const latestRequest = useRef(0)

  const refresh = useCallback(async () => {
    const request = (latestRequest.current += 1)
    const apply = (rows: FeedEntry[]) => {
      if (request === latestRequest.current) setFeeds(rows)
    }
    if (signedIn) {
      const rows = await listFeedsSince(sevenDaysAgoISO(), babyId)
      apply(
        rows.map((r: FeedLog) => ({
          id: r.id,
          fed_at: r.fed_at,
          method: r.method,
          amount_ml: r.amount_ml,
          minutes: r.minutes,
          note: r.note,
        })),
      )
    } else {
      const cutoff = new Date(sevenDaysAgoISO()).getTime()
      apply(
        localForBaby(babyId)
          .filter((f) => new Date(f.fed_at).getTime() >= cutoff)
          .sort((a, b) => b.fed_at.localeCompare(a.fed_at)),
      )
    }
  }, [signedIn, babyId])

  useEffect(() => {
    void refresh().catch(() => {})
  }, [refresh])

  // Live "time since last feed".
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  const add = useCallback(
    async (input: AddFeedInput) => {
      if (signedIn) {
        await addFeed({ ...input, baby_id: babyId, household_id: householdId }).catch(() => {})
      } else {
        const local = loadLocal()
        local.push({ id: crypto.randomUUID(), ...input, baby_id: babyId })
        saveLocal(local)
      }
      await refresh().catch(() => {})
    },
    [signedIn, babyId, householdId, refresh],
  )

  const update = useCallback(
    async (id: string, patch: Partial<AddFeedInput>) => {
      if (signedIn) await updateFeed(id, patch).catch(() => {})
      else saveLocal(loadLocal().map((f) => (f.id === id ? { ...f, ...patch } : f)))
      await refresh().catch(() => {})
    },
    [signedIn, refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      if (signedIn) await deleteFeed(id).catch(() => {})
      else saveLocal(loadLocal().filter((f) => f.id !== id))
      await refresh().catch(() => {})
    },
    [signedIn, refresh],
  )

  const today = todayKey()
  const todayFeeds = feeds.filter((f) => todayKey(new Date(f.fed_at)) === today)
  const todayMl = todayFeeds.reduce((s, f) => s + (f.amount_ml ?? 0), 0)
  const lastFeed = feeds[0] ?? null
  const minsSinceLast = lastFeed
    ? Math.floor((Date.now() - new Date(lastFeed.fed_at).getTime()) / 60000)
    : null

  return { signedIn, feeds, todayFeeds, todayMl, lastFeed, minsSinceLast, add, update, remove }
}
