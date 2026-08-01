import { test, expect } from '@playwright/test'
import { hideOverlays, seedStore } from './helpers'

/**
 * Greek is a first-class locale (`Messages = typeof en` makes the two
 * structurally identical at compile time), so what is left to test at runtime
 * is that no surface falls back to English and that dates/times stay on the
 * 24-hour clock the app pins both languages to.
 */

const PAGES = ['', 'schedule', 'tracker', 'feed', 'export'] as const

for (const path of PAGES) {
  test(`/${path} is fully translated in Greek`, async ({ page }) => {
    await seedStore(page, { locale: 'el' })
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('lang', 'el')

    // Greek characters must actually appear — a page that silently fell back to
    // English would still render fine.
    await expect(page.locator('h1')).toHaveText(/[Ͱ-Ͽ]/)
  })
}

test('the report is translated, including its table headers', async ({ page }) => {
  await seedStore(page, { locale: 'el' })
  await page.addInitScript(() => {
    const iso = (h: number) => {
      const d = new Date()
      d.setHours(h, 15, 0, 0)
      return d.toISOString()
    }
    localStorage.setItem(
      'eda-feeds-local',
      JSON.stringify([
        { id: 'f1', fed_at: iso(9), method: 'bottle', amount_ml: 120, minutes: null, note: null },
      ]),
    )
  })
  await page.goto('export')

  const doc = page.locator('#report-document')
  await expect(doc.getByRole('heading', { name: 'Αναφορά φροντίδας' })).toBeVisible()
  await expect(doc.getByRole('heading', { name: 'Ταΐσματα' })).toBeVisible()
  await expect(doc).toContainText('Ώρα')
  await expect(doc).toContainText('Ποσότητα')
})

test('the schedule editor is translated', async ({ page }) => {
  await seedStore(page, { locale: 'el' })
  await page.goto('schedule')
  await hideOverlays(page)

  await expect(page.getByText('Τι', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Προσθήκη στιγμής/ })).toBeVisible()
  await expect(page.getByText(/Τα προγράμματα της μέρας σας/)).toBeVisible()
})

test('both languages use a 24-hour clock', async ({ page }) => {
  // CLDR resolves `el` to a 12-hour clock with π.μ./μ.μ., which no Greek parent
  // expects to read at 3am — the app pins `-u-hc-h23` for exactly this.
  for (const locale of ['en', 'el'] as const) {
    await seedStore(page, { locale })
    await page.goto('tracker')
    const header = page.locator('header').first()
    await expect(header).not.toContainText(/\b(AM|PM)\b/)
    await expect(header).not.toContainText(/π\.μ\.|μ\.μ\./)
  }
})

test('units stay metric in both languages', async ({ page }) => {
  for (const locale of ['en', 'el'] as const) {
    await seedStore(page, { locale })
    await page.goto('feed')
    await expect(page.locator('body')).not.toContainText(/\b(oz|fl oz|lb|°F)\b/)
  }
})
