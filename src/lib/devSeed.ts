/**
 * Local test-data seeder (dev aid). The tummy tracker and feed log are
 * local-first — signed out, they persist to `localStorage` under fixed keys — so
 * this fills those keys with a realistic backlog to exercise the dashboards and
 * charts without a Supabase account.
 *
 * Usage (dev): visit any page with `?seed` in the URL, or call
 * `window.seedTestData()` / `window.clearTestData()` from the console.
 *
 * Note: babies, growth measurements, and households are Supabase-only, so those
 * screens still need a real signed-in account — this seeds what works offline.
 */
const TUMMY_KEY = 'eda-tummy-local'
const FEED_KEY = 'eda-feeds-local'

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))

/** Populate ~90 days of tummy sessions and ~7 days of feeds. */
export function seedTestData(): void {
  const now = new Date()

  // Tummy sessions: 1–3 per day for the last 90 days, 4–28 min each.
  const sessions: { id: string; started_at: string; ended_at: string }[] = []
  for (let d = 0; d < 90; d++) {
    const count = randInt(1, 3)
    for (let s = 0; s < count; s++) {
      const start = new Date(now)
      start.setDate(now.getDate() - d)
      start.setHours(8 + s * 4 + randInt(0, 1), randInt(0, 59), 0, 0)
      if (start.getTime() > now.getTime()) continue
      const end = new Date(start.getTime() + randInt(4, 28) * 60_000)
      sessions.push({ id: uid(), started_at: start.toISOString(), ended_at: end.toISOString() })
    }
  }
  localStorage.setItem(TUMMY_KEY, JSON.stringify(sessions))

  // Feeds: 5–8 per day for the last 8 days (the feed view keeps 7 days).
  const methods = ['bottle', 'breast', 'solid'] as const
  const feeds: {
    id: string
    fed_at: string
    method: (typeof methods)[number]
    amount_ml: number | null
    minutes: number | null
    note: string | null
  }[] = []
  for (let d = 0; d < 8; d++) {
    const count = randInt(5, 8)
    for (let f = 0; f < count; f++) {
      const t = new Date(now)
      t.setDate(now.getDate() - d)
      t.setHours(6 + f * 3, randInt(0, 59), 0, 0)
      if (t.getTime() > now.getTime()) continue
      const method = methods[randInt(0, 2)]
      feeds.push({
        id: uid(),
        fed_at: t.toISOString(),
        method,
        amount_ml: method === 'breast' ? null : randInt(90, 180),
        minutes: method === 'breast' ? randInt(8, 25) : null,
        note: null,
      })
    }
  }
  localStorage.setItem(FEED_KEY, JSON.stringify(feeds))
}

/** Remove the seeded local data. */
export function clearTestData(): void {
  localStorage.removeItem(TUMMY_KEY)
  localStorage.removeItem(FEED_KEY)
}
