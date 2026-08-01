import { test, expect } from '@playwright/test'
import { hideOverlays, hueGap, hueOf, seedStore } from './helpers'

/**
 * The design-system invariants that are cheap to break and expensive to notice:
 * activity hue separation, the theme × palette matrix, the control scale, and
 * the tab icons.
 */

test('the eight activity hues are all distinct', async ({ page }) => {
  await seedStore(page, {})
  await page.goto('design-system')

  const hues = await page.evaluate(() =>
    [...document.querySelectorAll('[data-hue]')].map((e) => e.textContent),
  )
  expect(hues).toHaveLength(8)
  const numbers = hues.map((h) => Number(String(h).replace('°', '')))
  expect(numbers.every((n) => Number.isFinite(n))).toBe(true)
  expect(new Set(numbers).size).toBe(8)

  // Hue is often the only thing telling these apart, so near-neighbours are a
  // bug — `care` and `feed` once sat 22° apart and read as the same colour.
  let min = 360
  let pair: [number, number] = [0, 0]
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const gap = hueGap(numbers[i], numbers[j])
      if (gap < min) {
        min = gap
        pair = [numbers[i], numbers[j]]
      }
    }
  }
  // The real floor is 27.6° (wind vs active at the 400 step), which is the best
  // any eight Tailwind families achieve once both painted steps are counted.
  // 26 leaves room for browser rounding while still catching the 22° care/feed
  // collision this search exists to prevent.
  expect(min, `closest hues: ${pair[0]}° and ${pair[1]}°`).toBeGreaterThanOrEqual(26)
})

test('activity colours do not follow the palette', async ({ page }) => {
  // An activity's colour is a fixed meaning: sleep is indigo whichever child
  // the app is set up for.
  const read = async (palette: 'blue' | 'red') => {
    await seedStore(page, { palette })
    await page.goto('design-system')
    return page.evaluate(() =>
      [...document.querySelectorAll('[data-hue]')].map((e) => e.textContent),
    )
  }
  const blue = await read('blue')
  const red = await read('red')
  expect(blue).toEqual(red)
})

for (const dark of [true, false]) {
  for (const palette of ['blue', 'red'] as const) {
    test(`renders in ${dark ? 'dark' : 'light'} × ${palette}`, async ({ page }) => {
      await seedStore(page, { dark, palette })
      await page.goto('schedule')

      const root = page.locator('html')
      await expect(root).toHaveAttribute('data-theme', dark ? 'dark' : 'light')
      await expect(root).toHaveAttribute('data-palette', palette)

      // Foreground and background must not collapse into each other.
      const { fg, bg } = await page.evaluate(() => {
        const s = getComputedStyle(document.body)
        return { fg: s.color, bg: s.backgroundColor }
      })
      expect(fg).not.toBe(bg)
      await expect(page.locator('h1')).toBeVisible()
    })
  }
}

test('controls in a row share one height', async ({ page }) => {
  // The control scale exists because a row used to be 36/44/44 on a phone and
  // 36/32/32 from `sm`.
  await seedStore(page, {})
  await page.goto('schedule')
  await hideOverlays(page)

  const heights = await page.locator('ol > li').first().evaluate((row) => {
    // Ids carry a per-row uid, not the index — the list re-sorts itself, so an
    // index-keyed id would follow the wrong moment.
    const sel = ['slot-time-', 'slot-mins-', 'slot-what-']
    return sel
      .map((prefix) => row.querySelector(`[id^="${prefix}"]`))
      .filter(Boolean)
      // The stepper's id is on its inner <input>; the control is the shell
      // around it, which is what has to match the row.
      .map((el) => el!.closest('[data-slot]') ?? el!)
      .map((el) => Math.round((el as HTMLElement).getBoundingClientRect().height))
  })
  expect(heights.length).toBeGreaterThan(1)
  expect(new Set(heights).size, `heights: ${heights.join(', ')}`).toBe(1)
})

test('the tab icons all resolve', async ({ page }) => {
  await seedStore(page, {})
  await page.goto('')

  const links = await page.locator('link[rel~="icon"]').evaluateAll((els) =>
    els.map((e) => (e as HTMLLinkElement).href),
  )
  expect(links.length).toBeGreaterThan(0)
  for (const href of links) {
    const res = await page.request.get(href)
    expect(res.status(), href).toBe(200)
    // The base path is applied once, not twice — a hand-written base doubled it
    // in dev and the tab icon 404'd.
    expect(href).not.toMatch(/early-development-architecture\/early-development-architecture/)
  }
})

test('SegmentedGroup is a radiogroup, not a row of buttons', async ({ page }) => {
  // A segmented control is a single-choice control: one Tab stop, arrows move
  // the selection, and a screen reader hears "2 of 9". A row of aria-pressed
  // buttons says none of that.
  await seedStore(page, {})
  await page.goto('schedule')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Create all nine/ }).click()

  const group = page.getByRole('radiogroup').first()
  await expect(group).toBeVisible()
  const options = group.getByRole('radio')
  await expect(options).toHaveCount(9)
  await expect(options.first()).toHaveAttribute('aria-checked', 'true')

  // Roving tabindex: the group costs one Tab stop, not nine.
  const tabbable = await options.evaluateAll(
    (els) => els.filter((e) => e.getAttribute('tabindex') === '0').length,
  )
  expect(tabbable).toBe(1)

  // The arrows move the selection.
  await options.first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(options.nth(1)).toHaveAttribute('aria-checked', 'true')
})

test('a segmented group is the same height as the fields beside it', async ({ page }) => {
  // The track carries the control height, not the items inside it. Sizing the
  // items instead left the group its own padding taller than everything it
  // stood next to — 40px against a 32px stepper, on the one row where the two
  // are always side by side.
  await seedStore(page, {})
  await page.goto('feed')
  await hideOverlays(page)

  const heights = await page.evaluate(() => {
    const segmented = document.querySelector('[role="radiogroup"]')
    const stepper = document.querySelector('[data-slot="number-input"]')
    return [segmented, stepper]
      .filter(Boolean)
      .map((el) => Math.round((el as HTMLElement).getBoundingClientRect().height))
  })
  expect(heights).toHaveLength(2)
  expect(new Set(heights).size, `heights: ${heights.join(', ')}`).toBe(1)
})

test('the in-use badge does not change the height of the row it sits in', async ({ page }) => {
  // It appears on exactly one program of the nine, so a badge taller than the
  // line it shares would make the whole panel below it jump as you step along
  // the axis.
  await seedStore(page, {})
  await page.goto('schedule')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Create all nine/ }).click()

  const options = page.getByRole('radiogroup').first().getByRole('radio')
  // The heading row the badge shares, not the whole panel: the summary and the
  // "next change" sentence below it wrap to different line counts per program
  // on a phone, which is content changing height, not layout jitter.
  const heading = page.locator('[data-slot="band-heading"]').first()
  const seen = new Set<number>()
  const count = await options.count()
  for (let i = 0; i < count; i++) {
    await options.nth(i).click()
    seen.add(Math.round((await heading.boundingBox())!.height))
  }
  expect(seen.size, `heading heights: ${[...seen].join(', ')}`).toBe(1)
})
