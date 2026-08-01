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
