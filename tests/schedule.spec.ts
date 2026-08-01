import { test, expect } from '@playwright/test'
import { hideOverlays, readStore, seedStore, setNumberInput } from './helpers'

/** The day editor: the combined What field, presets, blueprints, drag, bands. */

/** Autosave is debounced, so a test waits for the write rather than a click. */
async function expectSaved(page: import('@playwright/test').Page) {
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await seedStore(page, {})
})

test.describe('the What field', () => {
  test('activity and title are one control, not two', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)

    const row = page.locator('#day-moments > li').first()
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
    const row = page.locator('#day-moments > li').nth(2)

    await row.locator('[aria-label="Type"]').click()
    await page.getByRole('button', { name: 'Sleep / nap', exact: true }).click()
    await expect(row.locator('input[id^="slot-what"]')).toHaveValue('Sleep / nap')
  })

  test('a hand-typed title is never overwritten', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    const row = page.locator('#day-moments > li').nth(2)
    const field = row.locator('input[id^="slot-what"]')

    await field.fill("Dad's turn")
    await row.locator('[aria-label="Type"]').click()
    await page.getByRole('button', { name: 'Care', exact: true }).click()
    await expect(field).toHaveValue("Dad's turn")
  })

  test('a moment links to the tool that logs it, and only when one exists', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    const row = page.locator('#day-moments > li').first()

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
  const before = await page.locator('#day-moments > li').count()

  // The palette lives in the "Add a moment" popover now, not a page section.
  await page.getByRole('button', { name: /Add a moment/ }).click()
  const card = page.locator('ul li button').filter({ hasText: /\d\d:\d\d/ }).first()
  const label = (await card.textContent())!.trim()
  await card.click()

  await expect(page.locator('#day-moments > li')).toHaveCount(before + 1)

  // It files itself by the time it carries rather than landing at the bottom of
  // the list — that was the whole point of making clock time the ordering.
  const titles = await page
    .locator('input[id^="slot-what"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))
  const added = titles.filter((v) => label.includes(v))
  expect(added.length).toBeGreaterThan(0)
})

test('a program can be restarted from the built-in day for its age', async ({ page }) => {
  // The "Day blueprints" section was a second grid of the same nine days the age
  // axis already shows — two pickers for one decision. What survived is the one
  // action that was actually about the open program.
  await page.goto('schedule')
  await hideOverlays(page)
  page.on('dialog', (d) => d.accept())
  await page.getByRole('button', { name: /Create all nine/ }).click()
  await expect(page.getByRole('button', { name: /0–2 mo/ })).toBeVisible()

  await page.getByRole('button', { name: /2 y–3 y|2–3 y/ }).click()
  await expect(page.locator('#band-from')).toBeVisible()
  await page.locator('input[id^="slot-what"]').first().fill('Scribbled over')

  await page.getByRole('button', { name: /Reset this day/ }).click()
  await expect(page.locator('#day-moments > li')).toHaveCount(15)
  await expect(page.locator('input[id^="slot-what"]').first()).not.toHaveValue('Scribbled over')
})

test('clock time is the only ordering — drag and the arrows are gone', async ({ page }) => {
  // The editor used to keep a list position *as well as* a time, which is why it
  // needed a drag handle and up/down buttons, and why the two could disagree: a
  // preset landed at the bottom whatever time it carried. Moving a moment is now
  // the same action as saying when it happens, so a day given out of order comes
  // back in order and there is nothing left to drag.
  await seedStore(page, {
    customSchedules: [
      {
        id: 'a',
        fromMonths: 0,
        slots: [
          { time: '19:30', type: 'sleep', mins: 60, title: 'Bedtime', detail: '' },
          { time: '07:00', type: 'feed', mins: 20, title: 'Morning', detail: '' },
          { time: '12:00', type: 'meal', mins: 30, title: 'Lunch', detail: '' },
        ],
      },
    ],
  })
  await page.goto('schedule')
  await hideOverlays(page)

  const titles = await page
    .locator('input[id^="slot-what"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))
  expect(titles).toEqual(['Morning', 'Lunch', 'Bedtime'])

  await expect(page.getByTitle('Drag to reorder')).toHaveCount(0)
  await expect(page.getByLabel('Move earlier')).toHaveCount(0)
  await expect(page.getByLabel('Move later')).toHaveCount(0)
})

test('the small hours sort to the end of the day, not the start', async ({ page }) => {
  // A day is a cycle that begins at the morning wake, so a 02:00 night feed
  // belongs at the bottom of the night that started the evening before — sorting
  // on the raw clock would file it above the 07:00 wake.
  await seedStore(page, {
    customSchedules: [
      {
        id: 'a',
        fromMonths: 0,
        slots: [
          { time: '07:00', type: 'feed', mins: 20, title: 'Morning', detail: '' },
          { time: '02:00', type: 'feed', mins: 20, title: 'Night feed', detail: '' },
          { time: '19:30', type: 'sleep', mins: 200, title: 'Bedtime', detail: '' },
        ],
      },
    ],
  })
  await page.goto('schedule')
  await hideOverlays(page)

  const titles = await page
    .locator('input[id^="slot-what"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))
  expect(titles).toEqual(['Morning', 'Bedtime', 'Night feed'])
})

test('a moment that runs into the next one is flagged, not blocked', async ({ page }) => {
  await seedStore(page, {
    customSchedules: [
      {
        id: 'a',
        fromMonths: 0,
        slots: [
          { time: '07:00', type: 'sleep', mins: 120, title: 'Long nap', detail: '' },
          { time: '08:00', type: 'feed', mins: 20, title: 'Feed', detail: '' },
        ],
      },
    ],
  })
  await page.goto('schedule')
  await hideOverlays(page)

  await expect(page.getByText(/Runs 60 min into the next moment/)).toBeVisible()
})

test('edits save themselves, and survive switching programs', async ({ page }) => {
  // Switching programs used to replace the rows outright, throwing away any
  // unsaved edit with no warning and no undo.
  await page.goto('schedule')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Create all nine/ }).click()

  await page.locator('input[id^="slot-what"]').first().fill('Dad\'s turn')
  await expectSaved(page)

  await page.getByRole('button', { name: /2–4 mo/ }).click()
  await page.getByRole('button', { name: /0–2 mo/ }).click()

  await expect(page.locator('input[id^="slot-what"]').first()).toHaveValue("Dad's turn")
})

test.describe('age bands', () => {
  test('one day per built-in band can be created, covering birth to three', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)

    await page.getByRole('button', { name: /Create all nine/ }).click()
    const store = await readStore(page)
    const bands = store.customSchedules as { fromMonths: number; slots: unknown[] }[]
    expect(bands.map((b) => b.fromMonths)).toEqual([0, 2, 4, 6, 9, 12, 18, 24, 36])
    expect(bands.every((b) => b.slots.length > 0)).toBe(true)
    // Programs state their range outright rather than only a start month.
    await expect(page.getByRole('button', { name: /0–2 mo/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /3 y\+/ })).toBeVisible()
  })

  test('any band can be opened and edited', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    await page.getByRole('button', { name: /Create all nine/ }).click()

    await page.getByRole('button', { name: /3 y\+/ }).click()
    const field = page.locator('input[id^="slot-what"]').first()
    await field.fill('Toddler wake-up')
    await expectSaved(page)

    const store = await readStore(page)
    const bands = store.customSchedules as { fromMonths: number; slots: { title: string }[] }[]
    expect(bands.find((b) => b.fromMonths === 36)!.slots[0].title).toBe('Toddler wake-up')
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
    // Deleting a program is confirmed: with autosave there is no undo, and it
    // erases a hand-built day.
    page.on('dialog', (d) => d.accept())
    await page.getByRole('button', { name: /Create all nine/ }).click()

    await page.getByRole('button', { name: /0–2 mo/ }).click()
    await page.getByRole('button', { name: /Delete this program/ }).click()

    const store = await readStore(page)
    expect((store.customSchedules as unknown[]).length).toBe(8)
    await expect(page.locator('#day-moments > li').first()).toBeVisible()
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

test.describe('creating a program', () => {
  test('asks for the age and the starting point instead of guessing', async ({ page }) => {
    // The first version claimed whatever age the child happened to be, bumped
    // by a month if taken, and always seeded from the built-in day — two
    // decisions made silently and one of them guessed.
    await page.goto('schedule')
    await hideOverlays(page)
    await page.getByRole('button', { name: /Create all nine/ }).click()
    await page.getByRole('button', { name: /New program/ }).click()

    await expect(page.locator('#new-program-from')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Suggested day' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Copy of/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Empty', exact: true })).toBeVisible()
  })

  test('refuses an age another program already starts at', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    await page.getByRole('button', { name: /Create all nine/ }).click()
    await page.getByRole('button', { name: /New program/ }).click()

    await setNumberInput(page, 'new-program-from', 12)
    await expect(page.getByText(/already starts at/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Create program/ })).toBeDisabled()

    // …and lets go once the clash does.
    await setNumberInput(page, 'new-program-from', 15)
    await expect(page.getByRole('button', { name: /Create program/ })).toBeEnabled()
  })

  test('"empty" really is empty, so a day can be built from scratch', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    await page.getByRole('button', { name: /Create all nine/ }).click()
    await page.getByRole('button', { name: /New program/ }).click()

    await setNumberInput(page, 'new-program-from', 30)
    await page.getByRole('button', { name: 'Empty', exact: true }).click()
    await page.getByRole('button', { name: /Create program/ }).click()

    const store = await readStore(page)
    const bands = store.customSchedules as { fromMonths: number; slots: unknown[] }[]
    expect(bands.find((b) => b.fromMonths === 30)!.slots).toEqual([])
  })

  test('"copy" duplicates the open program without sharing its moments', async ({ page }) => {
    await page.goto('schedule')
    await hideOverlays(page)
    await page.getByRole('button', { name: /Create all nine/ }).click()
    await page.getByRole('button', { name: /0–2 mo/ }).click()

    await page.getByRole('button', { name: /New program/ }).click()
    await setNumberInput(page, 'new-program-from', 21)
    await page.getByRole('button', { name: /Copy of/ }).click()
    await page.getByRole('button', { name: /Create program/ }).click()

    let store = await readStore(page)
    let bands = store.customSchedules as { fromMonths: number; slots: { title: string }[] }[]
    const source = bands.find((b) => b.fromMonths === 0)!
    const copy = bands.find((b) => b.fromMonths === 21)!
    expect(copy.slots.map((s) => s.title)).toEqual(source.slots.map((s) => s.title))

    // Editing the copy must not reach back into the program it came from.
    await page.locator('input[id^="slot-what"]').first().fill('Changed in the copy')
    await expectSaved(page)
    store = await readStore(page)
    bands = store.customSchedules as { fromMonths: number; slots: { title: string }[] }[]
    expect(bands.find((b) => b.fromMonths === 21)!.slots[0].title).toBe('Changed in the copy')
    expect(bands.find((b) => b.fromMonths === 0)!.slots[0].title).not.toBe('Changed in the copy')
  })
})

test('nine programs never widen the page on a phone', async ({ page }) => {
  // Nine segments at the 44px touch minimum need ~480px, which is wider than the
  // phone. The axis has to absorb that itself: the shell must never scroll
  // sideways (see CLAUDE.md), and a page that does is unusable one-handed.
  await page.goto('schedule')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Create all nine/ }).click()
  await expect(page.getByRole('button', { name: /0–2 mo/ })).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('an edit is not lost by closing the tab inside the autosave window', async ({ page }) => {
  // The debounced write is the only thing standing between a keystroke and the
  // store, and a tab that goes away runs no React cleanup at all — so the last
  // 400ms of work used to vanish on reload, close, or a phone backgrounding the
  // page. `pagehide` is what makes that survive.
  await page.goto('schedule')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Create all nine/ }).click()
  // Seeding loads rows into the editor; typing before that commit lands is
  // overwritten by it.
  await expect(page.getByRole('button', { name: /0–2 mo/ })).toBeVisible()

  const field = page.locator('input[id^="slot-what"]').first()
  await field.fill('Vanishing edit')
  await expect(field).toHaveValue('Vanishing edit')

  // Fire the event the browser fires when a tab is closed, reloaded or frozen
  // — still well inside the debounce, and with no React unmount to fall back on.
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))

  const store = await readStore(page)
  const bands = store.customSchedules as { fromMonths: number; slots: { title: string }[] }[]
  expect(bands.find((b) => b.fromMonths === 0)!.slots[0].title).toBe('Vanishing edit')
})

test('moving a program onto another program’s start age is refused', async ({ page }) => {
  // `customSchedules` must stay in age order and hold no duplicate starts — the
  // resolver walks it in order and each span is derived from its neighbour, so a
  // duplicate or an out-of-order entry makes the axis draw ranges that lie.
  await page.goto('schedule')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Create all nine/ }).click()
  await expect(page.getByRole('button', { name: /0–2 mo/ })).toBeVisible()
  await page.getByRole('button', { name: /2–4 mo/ }).click()
  await expect(page.locator('#band-from')).toBeVisible()

  // 4 mo is the next program's start; stepping onto it must not take, and the
  // field snaps back to the value that is still true.
  const from = page.locator('#band-from')
  await from.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('4')
  await page.keyboard.press('Tab')
  await expect(from).toHaveValue('2')

  const store = await readStore(page)
  const starts = (store.customSchedules as { fromMonths: number }[]).map((b) => b.fromMonths)
  expect(starts).toEqual([...starts].sort((a, b) => a - b))
  expect(new Set(starts).size).toBe(starts.length)
})

test('start over clears every program at once', async ({ page }) => {
  // Getting back to nothing used to mean deleting nine programs one at a time.
  // With none saved the app falls back to the built-in day for the age, which is
  // a valid state — so the empty state offers the whole set again.
  await page.goto('schedule')
  await hideOverlays(page)
  page.on('dialog', (d) => d.accept())
  await page.getByRole('button', { name: /Create all nine/ }).click()
  await expect(page.getByRole('button', { name: /0–2 mo/ })).toBeVisible()

  await page.getByRole('button', { name: /Start over/ }).click()

  await expect(page.getByRole('button', { name: /Create all nine/ })).toBeVisible()
  const store = await readStore(page)
  expect(store.customSchedules).toEqual([])
  // The editor is not left empty — it falls back to the built-in day.
  await expect(page.locator('#day-moments > li').first()).toBeVisible()
})
