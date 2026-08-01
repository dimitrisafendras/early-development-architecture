import { test, expect } from '@playwright/test'
import { seedStore } from './helpers'

/**
 * The service worker must not serve development from cache.
 *
 * This is the bug that started the whole session: `sw.js` cached every
 * same-origin GET stale-while-revalidate, which is safe against Vite's hashed
 * production filenames but not against dev's `src/main.tsx?t=<hmr-timestamp>`.
 * A module graph from July was still being executed in August — the app looked
 * frozen, edits appeared to do nothing, and a whole redesign was invisible.
 *
 * These assertions are about the worker's *rules*, read from the served file
 * and from the live registration. Proving the stale-serving behaviour itself
 * would need two builds and a controlled reload, which belongs in a slower job.
 */

test('the worker refuses to answer from cache on localhost', async ({ page }) => {
  await seedStore(page, {})
  await page.goto('')

  const source = await page.request.get('sw.js').then((r) => r.text())
  // The dev bypass must exist and must sit in the fetch handler, not merely be
  // computed and ignored.
  expect(source).toContain('const isDev =')
  expect(source).toMatch(/if \(isDev\) return/)
  // And the cache version must have moved off v1, or the entries written under
  // the old rules would survive `activate`.
  expect(source).not.toContain("'eda-cache-v1'")
})

test('no cache is left behind in development', async ({ page }) => {
  await seedStore(page, {})
  await page.goto('')

  // Give the worker a chance to install and activate.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 10_000,
  }).catch(() => {
    // Not every run controls the page on first load; the cache assertion below
    // is the one that matters either way.
  })

  const caches = await page.evaluate(() => window.caches.keys())
  expect(caches, 'dev must leave no cache to go stale from').toEqual([])
})

test('the app is served live, not from a cached shell', async ({ page }) => {
  await seedStore(page, {})
  await page.goto('')
  // The header band is the surface that was missing for a week because the
  // cached build predated it. If a stale shell ever comes back, this is what
  // disappears first.
  await expect(page.locator('header').first()).toContainText('Today')
})
