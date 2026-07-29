import { useEffect, useState } from 'react'

/**
 * A live clock, ticked on an interval. Shared so the header band, the Day
 * dashboard's "what's now" and the full-day timeline all read the same moment
 * instead of each keeping a private `setInterval` that drifts by up to a minute.
 *
 * @param everyMs how often to re-read the clock — 30s for anything showing a
 * countdown, 60s where only the minute matters.
 */
export function useNow(everyMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs)
    return () => clearInterval(id)
  }, [everyMs])
  return now
}
