/**
 * OS-notification plumbing for the notification model in `notifications.ts`.
 *
 * Delivery is *local*: the page asks the service worker to show a notification
 * while the app is running (a background tab or a minimised installed PWA both
 * count). There is no push server, so nothing is delivered once the app has been
 * fully closed — that would need a VAPID subscription and a backend to push from.
 *
 * Notifications go through `registration.showNotification` rather than
 * `new Notification()` because the constructor is unavailable on Android Chrome
 * and in installed PWAs, and because the service worker is what handles the click
 * (see the `notificationclick` handler in `public/sw.js`, which focuses an open
 * tab and posts it the route, or opens a new window on that route).
 */

export type PushPermission = 'unsupported' | 'default' | 'granted' | 'denied'

/** Ids already fired at the OS, so a re-render or reload can't fire them twice. */
const FIRED_KEY = 'eda-notif-fired'

/** Message the service worker posts to an open tab on notification click. */
export const NAVIGATE_MESSAGE = 'eda-navigate'

export function pushPermission(): PushPermission {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported'
  return Notification.permission as PushPermission
}

export function pushSupported(): boolean {
  return pushPermission() !== 'unsupported'
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (!pushSupported()) return 'unsupported'
  try {
    return (await Notification.requestPermission()) as PushPermission
  } catch {
    return 'denied'
  }
}

export interface PushPayload {
  /** The notification id — used as the OS `tag` so a repeat replaces, not stacks. */
  tag: string
  title: string
  body: string
  /** In-app route to open on click; travels in `data` to the SW click handler. */
  path: string
}

export async function showPushNotification(payload: PushPayload): Promise<boolean> {
  if (pushPermission() !== 'granted') return false
  const icon = `${import.meta.env.BASE_URL}icon-192.png`
  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      data: { path: payload.path },
      icon,
      badge: icon,
    })
    return true
  } catch {
    return false
  }
}

export function loadFired(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FIRED_KEY) ?? '[]')
    return Array.isArray(raw) ? (raw as string[]) : []
  } catch {
    return []
  }
}

/** Persist the fired set, dropping anything not from `day` (ids carry their own). */
export function saveFired(ids: string[], day: string) {
  const kept = [...new Set(ids)].filter((id) => id.split(':')[1] === day)
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(kept))
  } catch {
    /* storage full or blocked — the worst case is a repeat notification */
  }
}
