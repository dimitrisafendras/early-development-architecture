import { test, expect } from '@playwright/test'
import { hideOverlays, readStore, seedStore } from './helpers'

/** The day editor: the combined What field, presets, blueprints, drag, bands. */

test.beforeEach(async ({ page }) => {
  await seedStore(page, {})
})

test.describe('the What field', () => {
  test('activity and title are one control, not two', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)

    const row = page.locator('main > ol > li').first()
    await expect(row.getByText('What', { exact: true })).toBeVisible()
    // The old row asked twice: a "Type" pill group and a separate "Title" box.
    await expect(row.getByText('Type', { exact: true })).toHaveCount(0)
    await expect(row.getByText('Title', { exact: true })).toHaveCount(0)
    await expect(row.locator('[aria-label="Type"]')).toBeVisible()
    await expect(row.locator('input[id^="slot-what"]')).toBeVisible()
  })

  test('the menu offers all eight activities', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    await page.locator('[aria-label="Type"]').first().click()

    for (const label of [
      'Milk feed',
      'Meal / snack',
      'Sleep / nap',
      'Play & connect',
      'Tummy & floor time',
      'Active play',
      'Care',
      'Wind-down',
    ]) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })

  test('changing the activity renames a title the app wrote', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    const row = page.locator('main > ol > li').nth(2)

    await row.locator('[aria-label="Type"]').click()
    await page.getByRole('button', { name: 'Sleep / nap', exact: true }).click()
    await expect(row.locator('input[id^="slot-what"]')).toHaveValue('Sleep / nap')
  })

  test('a hand-typed title is never overwritten', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    const row = page.locator('main > ol > li').nth(2)
    const field = row.locator('input[id^="slot-what"]')

    await field.fill("Dad's turn")
    await row.locator('[aria-label="Type"]').click()
    await page.getByRole('button', { name: 'Care', exact: true }).click()
    await expect(field).toHaveValue("Dad's turn")
  })

  test('a moment links to the tool that logs it, and only when one exists', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    const row = page.locator('main > ol > li').first()

    await row.locator('[aria-label="Type"]').click()
    await page.getByRole('button', { name: 'Milk feed', exact: true }).click()
    await expect(row.getByRole('link', { name: /Logs in/ })).toHaveAttribute('href', /\/feed$/)

    await row.locator('[aria-label="Type"]').click()
    await page.getByRole('button', { name: 'Tummy & floor time', exact: true }).click()
    await expect(row.getByRole('link', { name: /Logs in/ })).toHaveAttribute('href', /\/tracker$/)

    // Sleep has no logger; the app must not invent one.
    await row.locator('[aria-label="Type"]').click()
    await page.getByRole('button', { name: 'Sleep / nap', exact: true }).click()
    await expect(row.getByRole('link', { name: /Logs in/ })).toHaveCount(0)
  })
})

test('a preset adds a fully-formed moment in one tap', async ({ page }) => {
  await page.goto('schedule')
  await hideOverlays(page)
  const before = await page.locator('main > ol > li').count()

  await page.getByRole('button', { name: /Add from your day/ }).click()
  const card = page.locator('section ul li button').first()
  const label = (await card.textContent())!.trim()
  await card.click()

  await expect(page.locator('main > ol > li')).toHaveCount(before + 1)
  const last = page.locator('input[id^="slot-what"]').last()
  expect(label).toContain(await last.inputValue())
})

test('a blueprint replaces the day', async ({ page }) => {
  await page.goto('schedule')
  await hideOverlays(page)
  page.on('dialog', (d) => d.accept())

  await page.getByRole('button', { name: /Day blueprints/ }).click()
  const cards = page.locator('section li').filter({ has: page.locator('ol') })
  await expect(cards).toHaveCount(5)
  // The band matching the child is marked, not filtered to.
  await expect(page.getByText('Matches your baby')).toHaveCount(1)

  await cards.last().getByRole('button', { name: 'Load this day' }).click()
  await expect(page.locator('main > ol > li')).toHaveCount(14)
})

test('dragging a moment reorders the day', async ({ page }) => {
  await page.goto('schedule')
  await hideOverlays(page)

  const titles = () => page.locator('input[id^="slot-what"]').evaluateAll((els) =>
    els.slice(0, 3).map((e) => (e as HTMLInputElement).value),
  )
  const before = await titles()

  const grip = page.locator('main > ol > li').first().getByTitle('Drag to reorder')
  const from = (await grip.boundingBox())!
  const to = (await page.locator('main > ol > li').nth(2).boundingBox())!
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width / 2, to.y + to.height * 0.75, { steps: 14 })
  await page.mouse.up()

  const after = await titles()
  expect(after).not.toEqual(before)
  expect(after[2]).toBe(before[0])
})

test('the arrow buttons stay as the keyboard-reachable path', async ({ page }) => {
  // Drag is unreachable by keyboard, so removing these would make reordering
  // mouse-only. They are not a leftover.
  await page.goto('schedule')
  await hideOverlays(page)
  const row = page.locator('main > ol > li').nth(1)
  const first = await page.locator('input[id^="slot-what"]').first().inputValue()

  await row.getByLabel('Move earlier').click()
  await expect(page.locator('input[id^="slot-what"]').first()).not.toHaveValue(first)
})

test.describe('age bands', () => {
  test('one day per built-in band can be created, covering birth to three', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)

    await page.getByRole('button', { name: /Create all five/ }).click()
    const store = await readStore(page)
    const bands = store.customSchedules as { fromMonths: number; slots: unknown[] }[]
    expect(bands.map((b) => b.fromMonths)).toEqual([0, 3, 6, 12, 24])
    expect(bands.every((b) => b.slots.length > 0)).toBe(true)
    // Programs state their range outright rather than only a start month.
    await expect(page.getByRole('button', { name: /0–3 mo/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /2 y\+/ })).toBeVisible()
  })

  test('any band can be opened and edited', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    await page.getByRole('button', { name: /Create all five/ }).click()

    await page.getByRole('button', { name: /2 y\+/ }).click()
    const field = page.locator('input[id^="slot-what"]').first()
    await field.fill('Toddler wake-up')
    await page.getByRole('button', { name: /Save schedule/ }).click()

    const store = await readStore(page)
    const bands = store.customSchedules as { fromMonths: number; slots: { title: string }[] }[]
    expect(bands.find((b) => b.fromMonths === 24)!.slots[0].title).toBe('Toddler wake-up')
    // Editing one band must not touch another.
    expect(bands.find((b) => b.fromMonths === 0)!.slots[0].title).not.toBe('Toddler wake-up')
  })

  test('the effective day follows the child’s age', async ({ page }) => {
    // Two bands with distinguishable first moments; the resolver must pick the
    // last one the child has reached, never merely the only one saved.
    const mk = (title: string) => [
      { time: '07:00', type: 'feed', mins: 25, title, detail: '' },
    ]
    await seedStore(page, {
      customSchedules: [
        { id: 'a', fromMonths: 0, slots: mk('Newborn morning') },
        { id: 'b', fromMonths: 12, slots: mk('Toddler morning') },
      ],
    })
    await page.goto('schedule')
    await hideOverlays(page)

    // No baby on file → the earliest band, which starts at 0.
    await expect(page.locator('input[id^="slot-what"]').first()).toHaveValue('Newborn morning')
    // Two programs, each stating its own span. Mixed units are spelled out on
    // both ends ("0 mo–1 y"), and the last program is open-ended ("1 y+").
    await expect(page.getByRole('button', { name: /0 mo–1 y/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /1 y\+/ })).toBeVisible()
  })

  test('deleting a band falls back rather than emptying the editor', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    await page.getByRole('button', { name: /Create all five/ }).click()

    await page.getByRole('button', { name: /0–3 mo/ }).click()
    await page.getByRole('button', { name: /Delete this program/ }).click()

    const store = await readStore(page)
    expect((store.customSchedules as unknown[]).length).toBe(4)
    await expect(page.locator('main > ol > li').first()).toBeVisible()
  })
})

test('a schedule saved before bands existed is migrated, not lost', async ({ page }) => {
  // v0 of the store held one un-aged `customSchedule`.
  await page.addInitScript(() => {
    localStorage.setItem(
      'eda-theme',
      JSON.stringify({
        version: 0,
        state: {
          customSchedule: [
            { time: '06:30', type: 'feed', mins: 20, title: 'Legacy first feed', detail: '' },
          ],
        },
      }),
    )
  })
  await page.goto('schedule')
  await hideOverlays(page)

  const store = await readStore(page)
  const bands = store.customSchedules as { fromMonths: number; slots: { title: string }[] }[]
  expect(bands).toHaveLength(1)
  expect(bands[0].fromMonths).toBe(0)
  expect(bands[0].slots[0].title).toBe('Legacy first feed')
})
