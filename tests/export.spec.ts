import { test, expect } from '@playwright/test'
import { hideOverlays, seedFeeds, seedSessions, seedStore, todayAt } from './helpers'

/**
 * The printable report.
 *
 * The assertions that matter are about *print*, not about the preview: the page
 * is only correct if the app around it disappears, the sheet is light whatever
 * the theme, and a day's rows are not split across a page break. All three were
 * broken at some point and none is visible on screen.
 */

const feeds = [
  { id: 'f1', fed_at: todayAt(7, 15), method: 'bottle', amount_ml: 90, minutes: null, note: null },
  { id: 'f2', fed_at: todayAt(12, 22), method: 'breast', amount_ml: null, minutes: 20, note: 'sleepy' },
  { id: 'f3', fed_at: todayAt(17, 5, -1), method: 'bottle', amount_ml: 130, minutes: null, note: null },
]
const sessions = [
  { id: 's1', started_at: todayAt(10, 0), ended_at: todayAt(10, 8) },
  { id: 's2', started_at: todayAt(10, 0, -1), ended_at: todayAt(10, 6, -1) },
]

test.beforeEach(async ({ page }) => {
  await seedStore(page, { dark: true, palette: 'red' })
  await seedFeeds(page, feeds)
  await seedSessions(page, sessions)
})

test('the preview shows the cover figures and both logs', async ({ page }) => {
  await page.goto('export')
  const doc = page.locator('#report-document')
  await expect(doc).toBeVisible()
  await expect(doc.getByRole('heading', { name: 'Care report' })).toBeVisible()
  await expect(doc.getByRole('heading', { name: 'Feeds' })).toBeVisible()
  await expect(doc.getByRole('heading', { name: 'Tummy time' })).toBeVisible()
  await expect(doc).toContainText('Feeds / day')
  // SI only.
  await expect(doc).not.toContainText(/\boz\b|\blb\b|°F/)
})

test('the report is a light sheet even though the app is dark', async ({ page }) => {
  await page.goto('export')
  const doc = page.locator('#report-document')
  await expect(doc).toHaveCSS('background-color', 'oklch(1 0 0)')
  await expect(doc).toHaveCSS('color', 'oklch(0.145 0 0)')
  // …while the app around it stays dark. The body's colour is alpha-composited
  // by the aurora, so assert it is dark rather than matching an exact string.
  const bodyLightness = await page.evaluate(() => {
    const m = getComputedStyle(document.body).backgroundColor.match(/okl(?:ch|ab)\(([\d.]+)/)
    return m ? Number(m[1]) : 1
  })
  expect(bodyLightness).toBeLessThan(0.3)
})

test('range and section switches change what the document contains', async ({ page }) => {
  await page.goto('export')
  await hideOverlays(page)
  const doc = page.locator('#report-document')

  await expect(doc.getByRole('heading', { name: 'Feeds' })).toBeVisible()
  await page.getByRole('button', { name: 'Feeds & tummy time' }).click()
  await expect(doc.getByRole('heading', { name: 'Feeds' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Summary', exact: true }).click()
  await expect(doc).not.toContainText('Feeds / day')

  // The range is a `SegmentedGroup` — one setting with three positions — so its
  // options are radios. The section switches beside it stay buttons: those are
  // independent on/off toggles, not one choice.
  await page.getByRole('radio', { name: '7 days' }).click()
  await expect(doc).toBeVisible()
})

test('printing hides the whole app and keeps only the document', async ({ page }) => {
  await page.goto('export')
  await page.emulateMedia({ media: 'print' })

  const leaked = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((el) => !el.closest('#report-document') && getComputedStyle(el).visibility === 'visible')
      .map((el) => el.tagName)
      .slice(0, 5),
  )
  expect(leaked, 'app chrome leaked into the printed page').toEqual([])
  await expect(page.locator('#report-document')).toHaveCSS('visibility', 'visible')
})

test('a printed sheet is white and paginates without splitting a day', async ({ page }) => {
  await page.goto('export')
  await page.emulateMedia({ media: 'print' })

  const check = await page.evaluate(() => {
    const days = [...document.querySelectorAll('#report-document tbody.report-day')]
    return {
      bodyBg: getComputedStyle(document.body).backgroundColor,
      dayCount: days.length,
      allAvoidBreaks: days.every((d) => getComputedStyle(d).breakInside === 'avoid'),
      headerRepeats: [...document.querySelectorAll('#report-document thead')].every(
        (h) => getComputedStyle(h).display === 'table-header-group',
      ),
      transitionsOff: getComputedStyle(document.querySelector('#report-document')!).transitionDuration,
    }
  })
  expect(check.bodyBg).toBe('rgb(255, 255, 255)')
  expect(check.dayCount).toBeGreaterThan(0)
  expect(check.allAvoidBreaks).toBe(true)
  expect(check.headerRepeats).toBe(true)
  expect(check.transitionsOff).toBe('0s')

  // The real artefact: a multi-page PDF with selectable text.
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  expect(pdf.byteLength).toBeGreaterThan(10_000)
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
})

test('with nothing logged the report says so instead of rendering empty tables', async ({ page }) => {
  await seedFeeds(page, [])
  await seedSessions(page, [])
  await page.goto('export')
  await expect(page.locator('#report-document')).toContainText(/Nothing was logged/i)
})

test('growth is explained rather than shown empty when signed out', async ({ page }) => {
  await page.goto('export')
  await expect(page.locator('#report-document')).toContainText(/live in your account/i)
})

test('another child’s rows are not in this child’s report', async ({ page }) => {
  // The report fetched both logs with no baby filter at all, which on the
  // server resolved to "rows belonging to nobody" — so a signed-in household
  // got a report stating zero feeds and zero tummy time for a child with months
  // of both. Signed out the same omission pooled two children into one sheet.
  //
  // Rows with no `baby_id` are the legacy bucket and stay, exactly as they do in
  // every other read; a row stamped with a *different* child does not.
  await seedFeeds(page, [
    { ...feeds[0], baby_id: 'someone-else' },
    { ...feeds[1], id: 'f-legacy' },
  ])
  await seedSessions(page, [
    { ...sessions[0], baby_id: 'someone-else' },
    { ...sessions[1], id: 's-legacy' },
  ])
  await page.goto('export')
  const doc = page.locator('#report-document')
  await expect(doc).toBeVisible()
  // 90 ml is the other child's bottle; the 20-minute breastfeed is unassigned.
  await expect(doc).not.toContainText('90 ml')
  await expect(doc).toContainText('20 min')
})
