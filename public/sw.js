/* Service worker for The Architecture of Early Development (PWA).
   Strategy:
   - navigations  -> network-first, fall back to the cached app shell (offline).
   - static GETs  -> stale-while-revalidate (fast repeat loads, self-healing).
   Hashed asset filenames make runtime caching safe without a build manifest. */

const CACHE = 'eda-cache-v1'
const BASE = '/early-development-architecture/'
const SHELL = BASE + 'index.html'
const PRECACHE = [
  BASE,
  SHELL,
  BASE + 'manifest.webmanifest',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

/* Clicking a notification opens the section it belongs to. An already-open tab
   is focused and told the route (the app navigates client-side, see
   NotificationsProvider); otherwise a new window opens directly on it. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const path = (event.notification.data && event.notification.data.path) || '/'
  const target = new URL(BASE.replace(/\/$/, '') + path, self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin + BASE)) {
          client.postMessage({ type: 'eda-navigate', path })
          return 'focus' in client ? client.focus() : undefined
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // App navigations: network-first with offline fallback to the cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(SHELL, copy))
          return res
        })
        .catch(() => caches.match(SHELL).then((r) => r || caches.match(BASE))),
    )
    return
  }

  // Everything else: serve cache immediately, refresh in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
