import { test, expect } from '@playwright/test'
import { hideOverlays, seedFeeds, seedSessions, seedStore, todayAt } from './helpers'

/**
 * Editing a logged feed or tummy session — specifically the date, which the
 * rows could not change at all before: both held the entry's calendar day fixed
 * and rewrote only its clock time, so an entry stamped on the wrong day was
 * uncorrectable.
 */

test.describe('feed log', () => {
  test.beforeEach(async ({ page }) => {
    await seedStore(page, {})
    await seedFeeds(page, [
      { id: 'f1', fed_at: todayAt(9, 44), method: 'bottle', amount_ml: 120, minutes: null, note: null },
    ])
  })

  test('the editor offers a full date and time, not a bare clock', async ({ page }) => {
    await page.goto('feed')
    await hideOverlays(page)
    await page.getByLabel('Edit').first().click()

    const picker = page.locator('#f-when-f1')
    await expect(picker).toBeVisible()
    await expect(picker).toContainText('09:44')
    // The old control was `<input type="time">`; the DS picker is what should
    // be here, and it carries the date.
    await expect(picker).toContainText(/Today|\d{1,2} \w{3}/)
  })

  test('a feed can be moved to another day, keeping its time and amount', async ({ page }) => {
    await page.goto('feed')
    await hideOverlays(page)
    await page.getByLabel('Edit').first().click()
    await page.locator('#f-when-f1').click()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const key = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    await page.locator(`button[data-day="${key}"]`).click()
    await page.getByRole('button', { name: 'Save' }).click()

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('eda-feeds-local')!))
    expect(stored[0].fed_at.startsWith(key)).toBe(true)
    expect(stored[0].amount_ml).toBe(120)
    // The row stays, filed under Yesterday. It used to vanish — `/feed` listed
    // today only, so the one edit whose whole purpose is moving an entry to
    // another day made it disappear, and the caregiver had no way to see the
    // correction had landed where they meant.
    await expect(page.getByLabel('Edit')).toHaveCount(1)
    await expect(page.getByText('Yesterday')).toBeVisible()
  })

  test('a future date cannot be chosen', async ({ page }) => {
    await page.goto('feed')
    await hideOverlays(page)
    await page.getByLabel('Edit').first().click()
    await page.locator('#f-when-f1').click()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const key = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
    await expect(page.locator(`button[data-day="${key}"]`)).toBeDisabled()
  })
})

test.describe('tummy sessions', () => {
  test.beforeEach(async ({ page }) => {
    await seedStore(page, {})
    await seedSessions(page, [
      { id: 's1', started_at: todayAt(10, 0), ended_at: todayAt(10, 8) },
    ])
  })

  test('one date governs both times, and the duration survives the move', async ({ page }) => {
    await page.goto('tracker')
    await hideOverlays(page)
    await page.getByLabel('Edit').first().click()

    // One date field, two time fields — a session is one sitting, so start and
    // stop cannot drift onto different days.
    await expect(page.locator('#s-s1-date')).toBeVisible()
    await expect(page.locator('#s-s1-start')).toBeVisible()
    await expect(page.locator('#s-s1-end')).toBeVisible()

    await page.locator('#s-s1-date').click()
    await page.getByRole('button', { name: 'Yesterday' }).click()
    await page.getByRole('button', { name: 'Save' }).click()

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('eda-tummy-local')!))
    const mins = Math.round(
      (new Date(stored[0].ended_at).getTime() - new Date(stored[0].started_at).getTime()) / 60000,
    )
    expect(mins).toBe(8)
    await expect(page.getByText('Yesterday')).toBeVisible()
  })

  test('a stop before the start is refused, with a reason', async ({ page }) => {
    await page.goto('tracker')
    await hideOverlays(page)
    await page.getByLabel('Edit').first().click()

    await page.locator('#s-s1-end').click()
    // Pick an hour well before the 10:00 start.
    // The hour column's cells carry more than their number in the accessible
    // name, so match the visible label inside the open picker.
    await page.locator('[data-slot="popover-content"] button').filter({ hasText: /^02$/ }).first().click()

    await expect(page.locator('#s-s1-end')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled()
    await expect(page.getByText(/stop time has to come after/i)).toBeVisible()
  })
})

test('a past tummy session can be logged by hand', async ({ page }) => {
  // The timer is still how you record a session; this is how you record the one
  // you forgot to time. It lives in History, beside the list it lands in.
  await page.goto('tracker')
  await hideOverlays(page)

  const before = await page.locator('#tummy-history li').count()
  await page.getByRole('button', { name: /Log a past session/ }).click()
  await expect(page.locator('#s-new-date')).toBeVisible()
  // The default draft is the last ten minutes, so it saves without edits.
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.locator('#tummy-history li')).toHaveCount(before + 1)
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('eda-tummy-local') ?? '[]'),
  )
  expect(stored.length).toBe(before + 1)
})

test('a hand-logged session cannot end in the future', async ({ page }) => {
  await page.goto('tracker')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Log a past session/ }).click()

  // Push the stop time to 23:59, which is ahead of the frozen test clock.
  await page.locator('#s-new-end').click()
  await page.locator('[data-slot="popover-content"] button').filter({ hasText: /^23$/ }).first().click()
  await expect(page.getByText(/cannot end in the future/i)).toBeVisible()
})

/**
 * Every logging page ends in the same history: what you have recorded, newest
 * first, grouped by day, capped and scrolled. Two of the three showed *today
 * only* and grew with it — so a feed at 23:50 or a night that ran to 06:00 left
 * the page at midnight, and a newborn's eight feeds pushed the chart and the
 * guidance off the bottom of a phone. `HistoryList` is the one list now.
 */
test.describe('history', () => {
  const pages = [
    {
      path: 'feed',
      id: '#feed-history',
      seed: (page: import('@playwright/test').Page) =>
        seedFeeds(page, [
          { id: 'a', fed_at: todayAt(9, 0), method: 'bottle', amount_ml: 120, minutes: null, note: null },
          { id: 'b', fed_at: todayAt(20, 0, -1), method: 'bottle', amount_ml: 90, minutes: null, note: null },
          { id: 'c', fed_at: todayAt(20, 0, -3), method: 'bottle', amount_ml: 90, minutes: null, note: null },
        ]),
    },
    {
      path: 'tracker',
      id: '#tummy-history',
      seed: (page: import('@playwright/test').Page) =>
        seedSessions(page, [
          { id: 'a', started_at: todayAt(9, 0), ended_at: todayAt(9, 5) },
          { id: 'b', started_at: todayAt(20, 0, -1), ended_at: todayAt(20, 8, -1) },
          { id: 'c', started_at: todayAt(20, 0, -3), ended_at: todayAt(20, 8, -3) },
        ]),
    },
  ]

  for (const { path, id, seed } of pages) {
    test(`/${path} shows other days, labelled and capped`, async ({ page }) => {
      await seed(page)
      await page.goto(path)
      await hideOverlays(page)

      const list = page.locator(id)
      await expect(list.locator('li')).toHaveCount(3)
      // Today and Yesterday by name, and the older one by its date — a bare
      // `20:00` means nothing once the list runs past midnight.
      await expect(list.getByText('Today', { exact: true })).toBeVisible()
      await expect(list.getByText('Yesterday', { exact: true })).toBeVisible()
      await expect(list.locator('p')).toHaveCount(3)

      // One scroll region, one cap, on every page that has a history.
      const capped = await list.evaluate((el) => {
        const viewport = el.parentElement as HTMLElement
        return {
          overflow: getComputedStyle(viewport).overflowY,
          max: getComputedStyle(viewport).maxHeight,
        }
      })
      expect(capped.overflow).toBe('auto')
      expect(capped.max).toBe('288px')
    })
  }
})
