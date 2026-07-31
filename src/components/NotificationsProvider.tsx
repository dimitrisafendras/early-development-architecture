import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { useT } from '../i18n'
import { useNow } from '../lib/useNow'
import { useBabies } from '../lib/useBabies'
import { useHousehold } from '../lib/household'
import { useSchedule } from '../lib/useSchedule'
import { useTummyTracker } from '../lib/useTummyTracker'
import { useFeedLog } from '../lib/useFeedLog'
import { useDailyChecklist } from '../lib/useDailyChecklist'
import { ageInMonths, todayKey } from '../lib/schedule'
import { buildNotifications, type AppNotification } from '../lib/notifications'
import {
  loadFired,
  saveFired,
  showPushNotification,
  pushPermission,
  NAVIGATE_MESSAGE,
} from '../lib/push'

export interface NotificationCenter {
  /** Today's notifications, urgent first, dismissed ones already removed. */
  items: AppNotification[]
  unreadIds: string[]
  unreadCount: number
  markAllSeen: () => void
  markSeen: (id: string) => void
  dismiss: (id: string) => void
}

const NotificationsContext = createContext<NotificationCenter | null>(null)

/**
 * Owns the notification model for the whole app.
 *
 * The bell renders in two navigation surfaces (the desktop rail and the mobile
 * bar) and both are mounted at every breakpoint, so the state lives here — one
 * set of tracker/feed/baby subscriptions for the app instead of one per bell,
 * per the hook-first rule in CLAUDE.md.
 *
 * Mounted inside `Layout`, which is inside the router, so the service-worker
 * click bridge below can navigate.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const t = useT()
  // A minute is the finest granularity anything here reads (a slot's remaining
  // minutes, time since the last feed), so ticking faster would only re-render.
  const now = useNow(60_000)
  const { currentBaby, currentBabyId, babies, session } = useBabies()
  const { household, pending } = useHousehold()
  const schedule = useSchedule()
  const tummy = useTummyTracker(currentBabyId, household?.id ?? null)
  const feed = useFeedLog(currentBabyId, household?.id ?? null)
  const checklist = useDailyChecklist()

  const seen = useAppStore((s) => s.notifSeen)
  const dismissed = useAppStore((s) => s.notifDismissed)
  const markNotificationsSeen = useAppStore((s) => s.markNotificationsSeen)
  const dismissNotification = useAppStore((s) => s.dismissNotification)
  const pushOn = useAppStore((s) => s.notifPush)

  const months = currentBaby ? ageInMonths(currentBaby.birth_date) : null

  const items = useMemo(() => {
    const built = buildNotifications({
      t,
      now,
      months,
      signedIn: Boolean(session),
      hasBaby: babies.length > 0,
      pendingInvites: pending.length,
      schedule,
      tummyMinutes: tummy.completedMinutes,
      tummyRunning: tummy.isRunning,
      feedsToday: feed.todayFeeds.length,
      minsSinceLastFeed: feed.minsSinceLast,
      checklistDone: checklist.checked.length,
      checklistTotal: checklist.total,
    })
    return built
      .filter((item) => !dismissed.includes(item.id))
      .sort((a, b) => Number(Boolean(b.urgent)) - Number(Boolean(a.urgent)))
  }, [
    t,
    now,
    months,
    session,
    babies.length,
    pending.length,
    schedule,
    tummy.completedMinutes,
    tummy.isRunning,
    feed.todayFeeds.length,
    feed.minsSinceLast,
    checklist.checked.length,
    checklist.total,
    dismissed,
  ])

  const unreadIds = items.filter((item) => !seen.includes(item.id)).map((item) => item.id)

  // Mirror to the OS once each, when the user has opted in and the browser has
  // granted permission. Keyed on the id list rather than the array identity so a
  // minute tick that changes nothing can't re-fire anything.
  const day = todayKey(now)
  const pushableKey = items
    .filter((item) => item.push)
    .map((item) => item.id)
    .join('|')
  useEffect(() => {
    if (!pushOn || pushPermission() !== 'granted') return
    const fired = loadFired()
    const toFire = items.filter((item) => item.push && !fired.includes(item.id))
    if (!toFire.length) return
    // Recorded up front: showNotification is async and the effect can re-run
    // before it resolves, which would otherwise fire the same id twice.
    saveFired([...fired, ...toFire.map((item) => item.id)], day)
    void (async () => {
      for (const item of toFire) {
        await showPushNotification({
          tag: item.id,
          title: item.title,
          body: item.body,
          path: item.to,
        })
      }
    })()
    // `items` is intentionally absent: `pushableKey` is its meaningful identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushOn, pushableKey, day])

  useNotificationClickRouting()

  const value: NotificationCenter = {
    items,
    unreadIds,
    unreadCount: unreadIds.length,
    markAllSeen: () => markNotificationsSeen(unreadIds),
    markSeen: (id) => markNotificationsSeen([id]),
    dismiss: dismissNotification,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotificationCenter(): NotificationCenter {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotificationCenter must be used inside <NotificationsProvider>')
  return ctx
}

/**
 * Clicking an OS notification focuses this tab and the service worker posts the
 * route it belongs to; turn that into a client-side navigation so the app moves
 * to the section instead of reloading (see `notificationclick` in `sw.js`).
 */
function useNotificationClickRouting() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; path?: string } | null
      if (data?.type === NAVIGATE_MESSAGE && data.path) navigate(data.path)
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [navigate])
}
