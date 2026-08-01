/* Service worker for The Architecture of Early Development (PWA).
   Strategy:
   - navigations  -> network-first, fall back to the cached app shell (offline).
   - static GETs  -> stale-while-revalidate (fast repeat loads, self-healing).
   Hashed asset filenames make runtime caching safe without a build manifest. */

/* Bump this whenever the caching rules below change. `activate` deletes every
   cache whose name differs, so a bump is the only way to evict entries already
   written under the old rules — the version had never moved, and a module graph
   cached months earlier was still being served. */
const CACHE = 'eda-cache-v2'
const BASE = '/early-development-architecture/'

/**
 * Development is never served from the cache.
 *
 * The stale-while-revalidate rule below is safe in production because Vite
 * emits hashed filenames: a new deploy is a new URL, so it can't hit a stale
 * entry. In dev the modules are `src/main.tsx?t=<hmr-timestamp>` and the entry
 * URL repeats, so the worker pinned a module graph and kept serving it — an app
 * built in July was still running in August, with edits appearing to do
 * nothing. The worker still registers and can be tested here; it just stops
 * answering from cache.
 *
 * Scoped to the *dev port*, not merely to localhost, so `npm run preview` (4173)
 * still caches — otherwise the offline behaviour this file exists for would be
 * impossible to check anywhere but production.
 */
const DEV_HOSTS = ['localhost', '127.0.0.1', '[::1]']
const DEV_PORT = '5173' // Vite's dev server; `npm run preview` uses 4173.
const isDev = DEV_HOSTS.includes(self.location.hostname) && self.location.port === DEV_PORT
const SHELL = BASE + 'index.html'
const PRECACHE = [
  BASE,
  SHELL,
  BASE + 'manifest.webmanifest',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
]

self.addEventListener('install', (event) => {
  // Nothing is precached in dev either: those entries are what the offline
  // fallback would later serve in place of the live server.
  if (isDev) {
    event.waitUntil(self.skipWaiting())
    return
  }
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
      // In dev drop *every* cache, including this version's: a developer who
      // ran an older worker still has its entries, and nothing here will ever
      // read them again.
      .then((keys) => Promise.all(keys.filter((k) => isDev || k !== CACHE).map((k) => caches.delete(k))))
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

  // Dev: stay out of the way entirely — no cache reads, no cache writes. Not
  // even the navigation branch, whose offline fallback would otherwise serve a
  // stale `index.html` shell over a running dev server.
  if (isDev) return

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
