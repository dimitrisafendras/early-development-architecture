import { test, expect } from '@playwright/test'
import { hideOverlays, seedStore, todayAt } from './helpers'

/**
 * The sleep log.
 *
 * A sleep is an *interval*, which is what separates this from the feed log: a
 * feed is stamped at a moment, a sleep has a start you know when it happens and
 * an end you only learn later. So there are two ways in — start/stop for a sleep
 * you are in the middle of, and both-times-at-once for the night nobody was
 * awake to time — and both have to work.
 */

const SLEEPS_KEY = 'eda-sleep-local'

async function seedSleeps(page: import('@playwright/test').Page, rows: unknown[]) {
  await page.addInitScript(
    ([key, payload]) => localStorage.setItem(key as string, payload as string),
    [SLEEPS_KEY, JSON.stringify(rows)] as const,
  )
}

test('a finished sleep is logged with both times and totalled', async ({ page }) => {
  await seedStore(page, {})
  await seedSleeps(page, [
    { id: 'a', started_at: todayAt(13, 0), ended_at: todayAt(14, 30), note: null },
    { id: 'b', started_at: todayAt(9, 15), ended_at: todayAt(10, 0), note: null },
  ])
  await page.goto('sleep')
  await hideOverlays(page)

  const rows = page.locator('#sleep-today li')
  await expect(rows).toHaveCount(2)
  // Both ends of the interval, and its length — the three facts a sleep is.
  await expect(rows.first()).toContainText('13:00')
  await expect(rows.first()).toContainText('14:30')
  await expect(rows.first()).toContainText('1h 30min')
  // 90 + 45, in one figure.
  await expect(page.getByText('2h 15min').first()).toBeVisible()
})

test('a night is one sleep on the day it began, not two half-nights', async ({ page }) => {
  // The regression this attribution rule exists for. A night that runs 21:00 to
  // 06:30 crosses midnight; counting it against the calendar day each *part*
  // falls in would report every family as sleeping half as much as they do,
  // twice — so a sleep belongs to the day it started.
  await seedStore(page, {})
  await seedSleeps(page, [
    { id: 'night', started_at: todayAt(21, 0, -1), ended_at: todayAt(6, 30), note: null },
  ])
  await page.goto('sleep')
  await hideOverlays(page)

  // It started yesterday, so it is not in *today's* list…
  await expect(page.locator('#sleep-today li')).toHaveCount(0)
  // …and it is a night, not a nap, and it is nine and a half hours long — the
  // week chart is where it lands.
  await expect(page.getByText(/Sleep this week/)).toBeVisible()
})

test('the start/stop path records a sleep you are in the middle of', async ({ page }) => {
  await seedStore(page, {})
  await seedSleeps(page, [])
  await page.goto('sleep')
  await hideOverlays(page)

  await page.getByRole('button', { name: 'Start sleep' }).click()
  // While it runs the page says so, and the only offer is the way out of it.
  await expect(page.getByRole('button', { name: 'They woke up' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start sleep' })).toHaveCount(0)
  await expect(page.getByText('Asleep now').first()).toBeVisible()

  await page.getByRole('button', { name: 'They woke up' }).click()
  await expect(page.getByRole('button', { name: 'Start sleep' })).toBeVisible()
  await expect(page.locator('#sleep-today li')).toHaveCount(1)
})

test('a wake time before the sleep began is refused, with a reason', async ({ page }) => {
  // Refused rather than clamped: a wrong time is a fact about the night, and
  // silently moving it would file a sleep the caregiver never had. The *end* is
  // what is wrong, so that is the field marked — not both of them.
  await seedStore(page, {})
  await seedSleeps(page, [
    { id: 'a', started_at: todayAt(13, 0), ended_at: todayAt(14, 30), note: null },
  ])
  await page.goto('sleep')
  await hideOverlays(page)
  await page.getByRole('button', { name: 'Edit' }).first().click()

  await page.locator('[id^="s-end-"]').click()
  // 02:00, well before the 13:00 start. The hour cells carry more than their
  // number in the accessible name, so match the visible label.
  await page
    .locator('[data-slot="popover-content"] button')
    .filter({ hasText: /^02$/ })
    .first()
    .click()

  await expect(page.locator('[id^="s-end-"]')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled()
  await expect(page.getByText(/must be after they fell asleep/i)).toBeVisible()
})

test('the form opens on a sleep that is already valid', async ({ page }) => {
  // An hour ago to now. Opening on "now to now" greeted the caregiver with the
  // form's own validation error before they had touched anything.
  await seedStore(page, {})
  await seedSleeps(page, [])
  await page.goto('sleep')
  await hideOverlays(page)

  await expect(page.getByRole('button', { name: 'Log sleep' })).toBeEnabled()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('a logged sleep can be corrected at both ends', async ({ page }) => {
  await seedStore(page, {})
  await seedSleeps(page, [
    { id: 'a', started_at: todayAt(13, 0), ended_at: todayAt(14, 30), note: null },
  ])
  await page.goto('sleep')
  await hideOverlays(page)

  await page.getByRole('button', { name: 'Edit' }).first().click()
  // Both ends are editable together — correcting one without seeing the other is
  // how you end up with a nap that finishes before it starts.
  await expect(page.locator('[id^="s-start-"]')).toBeVisible()
  await expect(page.locator('[id^="s-end-"]')).toBeVisible()
})

test('sleep is scoped to the selected child', async ({ page }) => {
  // Same defect the tracker and the feed log each had: reads that ignore
  // `baby_id` while writes carry it. Signed out there is no baby, so another
  // child's row must not count; rows with no id are the legacy bucket and stay.
  await seedStore(page, {})
  await seedSleeps(page, [
    { id: 'other', baby_id: 'some-other-baby', started_at: todayAt(13, 0), ended_at: todayAt(15, 0), note: null },
    { id: 'mine', started_at: todayAt(9, 0), ended_at: todayAt(10, 0), note: null },
  ])
  await page.goto('sleep')
  await hideOverlays(page)

  await expect(page.locator('#sleep-today li')).toHaveCount(1)
  await expect(page.locator('#sleep-today')).toContainText('09:00')
})

test('the sleep moment offers the sleep log, not just its rules', async ({ page }) => {
  // The Day dashboard's tool zone is the promise that the thing you need is
  // where the moment is. A sleep moment used to render the safe-sleep rules and
  // nothing else — the one moment of the day with a timer to start offered
  // nothing to press, because the mapping from activity kind to widget had no
  // branch for it. `momentWidgets` is exhaustive by type now, so a kind with a
  // logger cannot be left unwired.
  await seedStore(page, {
    customSchedules: [
      {
        id: 'a',
        fromMonths: 0,
        slots: [{ time: '00:00', type: 'sleep', mins: 1439, title: 'Night', detail: '' }],
      },
    ],
  })
  await page.goto('daily')
  await hideOverlays(page)

  // Both halves of the logger, and the way to the full page.
  await expect(page.getByRole('button', { name: 'Start sleep' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Log sleep' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Sleep Log/ })).toBeVisible()
  // The rules stay — they are a safety directive, and this is the moment they
  // apply to.
  await expect(page.getByText(/Back to sleep/i).first()).toBeVisible()
})

test('the dashboard and /sleep run the same console', async ({ page }) => {
  // The rule that stopped the tummy widget being two different instruments: a
  // widget on both a page and the dashboard is one component, so both screens
  // offer the same control with the same name.
  await seedStore(page, {
    customSchedules: [
      {
        id: 'a',
        fromMonths: 0,
        slots: [{ time: '00:00', type: 'sleep', mins: 1439, title: 'Night', detail: '' }],
      },
    ],
  })
  await page.goto('daily')
  await hideOverlays(page)
  await page.getByRole('button', { name: 'Start sleep' }).click()
  await expect(page.getByRole('button', { name: 'They woke up' })).toBeVisible()

  // The same running sleep, seen from the page.
  await page.goto('sleep')
  await hideOverlays(page)
  await expect(page.getByRole('button', { name: 'They woke up' })).toBeVisible()
  await expect(page.getByText('Asleep now').first()).toBeVisible()
})

test('the running clock counts seconds, and reads as a clock', async ({ page }) => {
  // A sleep you have just started is a stopwatch, and it was formatted with
  // `formatDuration` — the helper that writes *quantities* (`45min`, `1h 20m`)
  // and rounds to the minute. So the first sixty seconds of every sleep read
  // `0min`, which is exactly what a button that did nothing also shows. The
  // tummy console has always read `mm:ss`; both go through `formatClock` now.
  await seedStore(page, {})
  await seedSleeps(page, [])
  await page.goto('sleep')
  await hideOverlays(page)

  await page.getByRole('button', { name: 'Start sleep' }).click()

  const clock = page.locator('#sleep-clock')
  await expect(clock).toHaveText(/^\d{2}:\d{2}$/)
  const first = await clock.textContent()
  // It moves within a couple of seconds — the interval is 1s while running, and
  // was 30s, so a clock that shows seconds but only updates twice a minute
  // would pass the format check above and still be wrong.
  await expect(clock).not.toHaveText(first!, { timeout: 4_000 })
})
