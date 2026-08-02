import { test, expect } from '@playwright/test'
import { hideOverlays, seedStore } from './helpers'

/**
 * Greek is a first-class locale (`Messages = typeof en` makes the two
 * structurally identical at compile time), so what is left to test at runtime
 * is that no surface falls back to English and that dates/times stay on the
 * 24-hour clock the app pins both languages to.
 */

const PAGES = ['', 'schedule', 'tracker', 'feed', 'sleep', 'export'] as const

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

test('no destination in the expanded sidebar is cut off in Greek', async ({ page }) => {
  // The rail has two states and the expanded one exists *only* to name where
  // each link goes. In Greek three of eight names did not fit — "Καταγραφή
  // Ταΐσματ…", "Προγράμματα ημέρ…" — so the state whose whole job is the label
  // was the state that hid it. The `truncate` is a backstop, not the norm.
  await seedStore(page, { locale: 'el', navCollapsed: false })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('daily')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  const cut = await page.locator('aside').evaluate((nav) =>
    Array.from(nav.querySelectorAll('span'))
      .filter((s) => s.clientWidth > 0 && s.scrollWidth > s.clientWidth + 1)
      .map((s) => s.textContent),
  )
  expect(cut).toEqual([])
})

test('a saved day program follows the language, not the one it was saved in', async ({ page }) => {
  // A program stores its moments as *text*, so it kept whatever language it was
  // authored in: a day saved in English stayed English inside a Greek app, on
  // the app's own landing screen, beside a built-in day that did translate.
  //
  // App-written moments carry their i18n key and resolve on every read. A row
  // the caregiver named is theirs and is left exactly as typed — including one
  // named in the other language, which is a real thing a bilingual household
  // does and must not be "corrected".
  await seedStore(page, {
    locale: 'el',
    customSchedules: [
      {
        id: 'a',
        fromMonths: 0,
        slots: [
          // Saved in English, with no key — the shape every existing program has.
          { time: '07:00', type: 'feed', mins: 20, title: 'Wake & first feed', detail: '' },
          { time: '12:00', type: 'meal', mins: 30, title: "Dad's turn", detail: '' },
        ],
      },
    ],
  })
  await page.goto('schedule')
  await hideOverlays(page)

  const titles = page.locator('input[id^="slot-what"]')
  await expect(titles.first()).toHaveValue('Ξύπνημα & πρώτο τάισμα')
  await expect(titles.nth(1)).toHaveValue("Dad's turn")
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
