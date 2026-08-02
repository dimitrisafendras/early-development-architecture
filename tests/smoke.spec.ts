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
  { path: 'sleep', heading: /Sleep/i },
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

test('a render error shows a screen instead of a blank page', async ({ page }) => {
  // A thrown render error in an SPA unmounts the whole tree and still returns
  // HTTP 200 — a white page with nothing to press and, on an app whose job is
  // to hold a record of a baby's day, nothing saying that record is still there.
  //
  // Provoked the way it would actually happen: a persisted value the code did
  // not anticipate. An activity kind nobody wrote makes the timeline look up a
  // meta entry that does not exist.
  const crashes: string[] = []
  page.on('console', (m) => m.type() === 'error' && crashes.push(m.text()))
  await seedStore(page, {
    customSchedules: [
      {
        id: 'broken',
        fromMonths: 0,
        slots: [{ time: '07:00', type: 'not-an-activity', mins: 20, title: 'x', detail: '' }],
      },
    ],
  })
  await page.goto('daily')

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible()
  // The reassurance is the reason this screen exists rather than a bare message.
  await expect(page.getByRole('alert')).toContainText(/Nothing you have logged is affected/)
  await expect(page.getByRole('button', { name: /Reload the page/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Back to your day/ })).toBeVisible()
  // Caught, not swallowed: the crash is still on the console, so the per-route
  // smoke checks above keep failing on anything this boundary would hide.
  expect(crashes.some((c) => /Unhandled render error/.test(c))).toBe(true)
})

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

test('both navigations reach the day programs and the report', async ({ page }) => {
  // /schedule was reachable only from a single link on the Day page, and
  // /export only from the rail. Neither is an `appAreas` entry — that list is
  // the five-column mobile tab bar — so they are easy to drop by accident.
  await seedStore(page, {})
  await page.goto('')

  const openNavIfCollapsed = async () => {
    const menu = page.getByLabel('Open menu').locator('visible=true')
    if ((await menu.count()) > 0) await menu.first().click()
  }
  await openNavIfCollapsed()

  for (const href of ['/schedule', '/export']) {
    const link = page.locator(`a[href$="${href}"]`).locator('visible=true')
    await expect(link.first(), `no visible nav link to ${href}`).toBeVisible()
  }

  await page.locator('a[href$="/schedule"]').locator('visible=true').first().click()
  await expect(page).toHaveURL(/\/schedule$/)
  await expect(page.locator('h1')).toBeVisible()
})
