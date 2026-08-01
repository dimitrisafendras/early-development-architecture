import { test, expect } from '@playwright/test'
import { seedStore } from './helpers'

/**
 * Every route renders, and none of them logs an error.
 *
 * The console assertion is the point: this app is a client-rendered SPA where a
 * thrown render error leaves a blank page that still returns HTTP 200, so
 * "the page loaded" proves nothing on its own.
 */

const ROUTES = [
  { path: '', heading: /Your Day|Today/i },
  { path: 'schedule', heading: /Edit your day/i },
  { path: 'wiki', heading: /.+/ },
  { path: 'tracker', heading: /Tracker/i },
  { path: 'feed', heading: /Feed/i },
  { path: 'baby', heading: /Baby/i },
  { path: 'family', heading: /Family|Household/i },
  { path: 'export', heading: /Export/i },
  { path: 'design-system', heading: /Liquid Glass/i },
]

for (const route of ROUTES) {
  test(`/${route.path || ''} renders without console errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(String(err)))

    await seedStore(page, {})
    await page.goto(route.path)

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).toHaveText(route.heading)

    // A service worker registration failure is environmental (the dev server
    // does not always serve `sw.js` on the first load) and says nothing about
    // the page under test.
    const real = errors.filter((e) => !/service ?worker|sw\.js|Failed to load resource/i.test(e))
    expect(real, `console errors on /${route.path}`).toEqual([])
  })
}

test('an unknown route redirects home rather than 404ing', async ({ page }) => {
  await seedStore(page, {})
  await page.goto('does-not-exist')
  await expect(page).toHaveURL(/early-development-architecture\/$/)
  await expect(page.locator('h1')).toBeVisible()
})

test('the page frame is identical across routes', async ({ page }) => {
  // The frame exists precisely because titles used to jump between routes by up
  // to 256px. One assertion keeps that from regressing.
  await seedStore(page, {})
  const lefts: number[] = []
  for (const path of ['', 'tracker', 'feed', 'export']) {
    await page.goto(path)
    const box = await page.locator('h1').boundingBox()
    lefts.push(Math.round(box!.x))
  }
  expect(new Set(lefts).size, `h1 left edges: ${lefts.join(', ')}`).toBe(1)
})
