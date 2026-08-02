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

test('the tracker console draws the sessions the day program plans', async ({ page }) => {
  // The target is age-derived and the day program is authored by hand, so the
  // two can disagree — the newborn sample day plans 15 min against a 5 min
  // target. They used to live on separate pages, where that was invisible.
  await seedStore(page, {})
  await page.goto('tracker')
  await hideOverlays(page)

  const card = page.locator('[data-slot="card"]', { hasText: /Start session|Stop session/ }).first()
  // Counted in sessions, because the bar is: one block per planned session.
  // And exactly one scale is named — the plan's, when the day has one. Both at
  // once ("Day plans 15 · Daily target: 5") made every glance ask which of the
  // two the console was actually measuring.
  await expect(card).toContainText(/of \d+ sessions planned/)
  await expect(card).toContainText(/Day plan: \d+ min/)
  await expect(card).not.toContainText(/Daily target/)
})

test('the dashboard and /tracker run the same tummy console', async ({ page }) => {
  // They had drifted into two different instruments — a session bar on the page
  // and a progress ring with its own clock and labels on the dashboard. Feeds
  // were already shared (FeedProgress + AddFeedForm); this is the other half.
  await seedStore(page, {})

  await page.goto('tracker')
  await hideOverlays(page)
  const onPage = page.locator('[data-slot="card"]', { hasText: /Start session|Stop session/ }).first()
  const caption = (await onPage.textContent())!.match(/of (\d+) sessions planned/)
  expect(caption, 'the tracker states the plan').not.toBeNull()

  await page.goto('')
  await hideOverlays(page)
  // The dashboard shows the console only while a tummy moment is selected.
  // Wait for the timeline to hydrate first — clicking into a half-rendered list
  // selects nothing and the assertion below then measures the wrong card.
  const moment = page.getByRole('button', { name: /Tummy time/i }).first()
  await expect(moment).toBeVisible()
  await moment.click()
  const onDash = page.locator('[data-slot="card"]', { hasText: /Start session|Stop session/ }).first()
  await expect(onDash).toContainText(`of ${caption![1]} sessions planned`)
  await expect(onDash).toContainText(/Day plan: \d+ min/)
})

test('tummy minutes pour across the planned blocks, continuing where they left off', async ({
  page,
}) => {
  // Sessions used to map one-to-one onto blocks, so stopping a five-minute block
  // at one minute left it a fifth full for ever and pressing Start again opened
  // the *next* block. Minutes fill in order instead.
  await seedStore(page, {})
  await page.addInitScript(() => {
    const now = Date.now()
    const mk = (agoMin: number, len: number) => ({
      id: 's' + agoMin,
      started_at: new Date(now - agoMin * 60000).toISOString(),
      ended_at: new Date(now - (agoMin - len) * 60000).toISOString(),
    })
    // 4 minutes banked, in two sittings — and today, not before midnight.
    localStorage.setItem('eda-tummy-local', JSON.stringify([mk(6, 3), mk(2, 1)]))
  })
  await page.goto('tracker')
  await hideOverlays(page)

  const blocks = page.locator('[data-slot="session-block"]')
  await expect(blocks.first()).toBeVisible()
  const solid = await blocks.evaluateAll((els) =>
    els.map((e) => Number((e as HTMLElement).dataset.solid)),
  )
  // Two sittings, one block: 4 of the first block's 5 minutes, not 3 in block
  // one and 1 in block two.
  expect(solid.length).toBeGreaterThan(1)
  expect(solid[0]).toBeGreaterThan(solid[1])
  expect(solid[1]).toBe(0)
})

test('a planned session that filled goes green, and the caption dates it', async ({ page }) => {
  // Every block in the accent said only "some progress"; which of the planned
  // sessions are actually behind you was left to the caption alone. And the
  // caption used to put a bare "01:46–01:48" after a count of sessions, which
  // read as a duration, or as the window they fall in — anything but the one
  // fact it carries.
  await seedStore(page, {})
  await page.addInitScript(() => {
    const now = Date.now()
    const mk = (agoMin: number, len: number) => ({
      id: 's' + agoMin,
      started_at: new Date(now - agoMin * 60000).toISOString(),
      ended_at: new Date(now - (agoMin - len) * 60000).toISOString(),
    })
    // 12 minutes against the no-baby day's three 10-minute sessions: the first
    // filled exactly, and 2 minutes spilled into the second.
    localStorage.setItem('eda-tummy-local', JSON.stringify([mk(40, 10), mk(3, 2)]))
  })
  await page.goto('tracker')
  await hideOverlays(page)

  const blocks = page.locator('[data-slot="session-block"]')
  await expect(blocks.first()).toBeVisible()
  // The first is done and says so; the one it spilled into is not.
  await expect(blocks.nth(0)).toHaveAttribute('data-filled', '')
  await expect(blocks.nth(1)).not.toHaveAttribute('data-filled', '')

  const console_ = page
    .locator('[data-slot="card"]')
    .filter({ has: blocks })
    .first()
  // Labelled, one instant, and on a 24-hour clock — no stray AM/PM inline.
  await expect(console_).toContainText(/last at [0-2]\d:\d\d/)
  await expect(console_).not.toContainText(/\d\d:\d\d[–-]\d\d:\d\d/)
})

test('the day layout setting moves the schedule from the side to the top', async ({ page }) => {
  // Two layouts of the same two things. The strip is not a second component —
  // same steps, same rail, same content — so the thing worth asserting is that
  // the axis actually changes and that the day is still all there.
  await seedStore(page, {})
  await page.goto('')
  await hideOverlays(page)

  const list = page.locator('ol').filter({ has: page.locator('li') }).first()
  await expect(list).toBeVisible()
  const steps = await list.locator('> li').count()
  expect(steps).toBeGreaterThan(5)
  // Side by side: the list stacks, so it is not a flex row.
  expect(await list.evaluate((el) => getComputedStyle(el).flexDirection === 'row' && getComputedStyle(el).display === 'flex')).toBe(false)

  await seedStore(page, { timelineLayout: 'top' })
  await page.goto('')
  await hideOverlays(page)

  const strip = page.locator('ol').filter({ has: page.locator('li') }).first()
  await expect(strip).toBeVisible()
  // Across the top: a flex row, the same number of moments, and a viewport that
  // scrolls sideways rather than down.
  expect(await strip.evaluate((el) => getComputedStyle(el).display)).toBe('flex')
  expect(await strip.evaluate((el) => getComputedStyle(el).flexDirection)).toBe('row')
  expect(await strip.locator('> li').count()).toBe(steps)
  expect(
    await strip.evaluate((el) => getComputedStyle(el.parentElement!).overflowX),
  ).toBe('auto')
})

test('the running clock reads elapsed against the planned session length', async ({ page }) => {
  // The plan already says how long this sitting should be; a bare elapsed time
  // gave the number nothing to measure itself against.
  await seedStore(page, {})
  await page.goto('tracker')
  await hideOverlays(page)

  // Scoped by the bar, not by the button: filtering the card on "Stop session"
  // makes the locator stop matching the moment the session ends.
  const console_ = page
    .locator('[data-slot="card"]')
    .filter({ has: page.locator('[data-slot="session-block"]') })
    .first()

  await page.getByRole('button', { name: /Start session/ }).click()
  await expect(console_).toContainText(/\d\d:\d\d\s*\/\s*\d\d:\d\d/)

  await page.getByRole('button', { name: /Stop session/ }).click()
  // Stopped, it goes back to the day's total against the target.
  await expect(console_).toContainText(/\d+\s*\/\s*\d+\s*min/)
})

test('the plan governs the console, and the age guidance judges the plan', async ({ page }) => {
  // The console used to serve two masters — the bar scaled by the day program,
  // "done" and the green fill scaled by the age target — so the newborn day
  // announced the target met with two of its three blocks still empty.
  await seedStore(page, {})
  await page.goto('tracker')
  await hideOverlays(page)

  const console_ = page
    .locator('[data-slot="card"]')
    .filter({ has: page.locator('[data-slot="session-block"]') })
    .first()
  // One scale is named, and it is the plan's.
  await expect(console_).toContainText(/Day plan: \d+ min/)
  await expect(console_).not.toContainText(/Daily target/)

  // The age target has not vanished — it judges the plan where the plan is
  // written, which is the only place the plan can still be changed.
  await page.goto('schedule')
  await hideOverlays(page)
  await page.getByRole('button', { name: /Create all nine/ }).click()
  await expect(page.getByText(/the guidance at this age is \d+ min/)).toBeVisible()
})

test('the console’s two readings of the day cannot contradict each other', async ({ page }) => {
  // The big figure printed a *rounded* total while "to go" was computed from the
  // raw one, so a day 24 seconds short of its plan read "30 / 30 min" and
  // "1 MIN TO GO" on the same line. Both come off one displayed total now.
  await seedStore(page, {})
  await page.addInitScript(() => {
    const now = Date.now()
    // 29 minutes 40 seconds: rounds up to the goal, is not the goal.
    localStorage.setItem(
      'eda-tummy-local',
      JSON.stringify([
        {
          id: 'nearly',
          started_at: new Date(now - 60 * 60000).toISOString(),
          ended_at: new Date(now - 60 * 60000 + 29 * 60000 + 40 * 1000).toISOString(),
        },
      ]),
    )
  })
  await page.goto('tracker')
  await hideOverlays(page)

  const console_ = page
    .locator('[data-slot="card"]')
    .filter({ has: page.locator('[data-slot="session-block"]') })
    .first()
  const text = await console_.innerText()
  const readout = text.match(/(\d+)\s*\/\s*(\d+)\s*min/)
  expect(readout).not.toBeNull()
  const [, done, goal] = readout!.map(Number)
  const toGo = Number(text.match(/(\d+)\s*min to go/i)?.[1] ?? 0)
  // Whatever the numbers are, the two statements have to be the same statement.
  expect(done + toGo).toBe(goal)
})

test('every label on the day timeline clears 4.5:1', async ({ page }) => {
  // The Wiki chip on the focused moment took `color: a.accent` — the 500 the
  // rail and the card edge are drawn in. That is a line colour: behind the
  // chip's own 8% tint of the same hue it measured 1.82:1 for play and 4.05:1
  // for sleep, i.e. all eight activities failing on 13px text. The design system
  // already keeps a readable pair per hue (700 light / 400 dark) and the time on
  // the same card was using it.
  //
  // Composited, not naive: the chip's background is translucent, so reading the
  // first non-transparent ancestor colour reports a ratio of 1 against itself.
  for (const dark of [false, true]) {
    await seedStore(page, { dark, palette: 'blue' })
    await page.goto('daily')
    await hideOverlays(page)

    const worst = await page.evaluate(() => {
      const parse = (c: string) => {
        const m = c.match(/rgba?\(([^)]+)\)/)
        if (!m) return null
        const p = m[1].split(',').map(Number)
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
      }
      const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
        const f = (v: number) => {
          v /= 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      /** Flatten every translucent layer above the element onto opaque white/black. */
      const backdrop = (el: Element) => {
        const stack: { r: number; g: number; b: number; a: number }[] = []
        let n: Element | null = el
        while (n) {
          const c = parse(getComputedStyle(n).backgroundColor)
          if (c && c.a > 0) {
            stack.push(c)
            if (c.a === 1) break
          }
          n = n.parentElement
        }
        let out = stack.length && stack[stack.length - 1].a === 1 ? stack.pop()! : { r: 255, g: 255, b: 255, a: 1 }
        for (let i = stack.length - 1; i >= 0; i--) {
          const c = stack[i]
          out = {
            r: c.r * c.a + out.r * (1 - c.a),
            g: c.g * c.a + out.g * (1 - c.a),
            b: c.b * c.a + out.b * (1 - c.a),
            a: 1,
          }
        }
        return out
      }
      let min = 99
      let label = ''
      for (const el of Array.from(document.querySelectorAll('ol li *'))) {
        const text = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3 && n.textContent?.trim())
          .map((n) => n.textContent!.trim())
          .join('')
        if (!text) continue
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) continue
        const cs = getComputedStyle(el)
        const fg = parse(cs.color)
        if (!fg) continue
        const l1 = lum(fg)
        const l2 = lum(backdrop(el))
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
        if (ratio < min) {
          min = ratio
          label = text.slice(0, 30)
        }
      }
      return { min: Math.round(min * 100) / 100, label }
    })

    expect(worst.min, `${dark ? 'dark' : 'light'}: "${worst.label}"`).toBeGreaterThanOrEqual(4.5)
  }
})

test('sessions are scoped to one baby', async ({ page }) => {
  // Reads had no baby filter while writes carried one, so a second child's
  // tummy time filled the first's bar and was judged against the first's age.
  await seedStore(page, {})
  await page.addInitScript(() => {
    const now = Date.now()
    localStorage.setItem(
      'eda-tummy-local',
      JSON.stringify([
        {
          id: 'other',
          baby_id: 'some-other-baby',
          started_at: new Date(now - 30 * 60000).toISOString(),
          ended_at: new Date(now - 20 * 60000).toISOString(),
        },
      ]),
    )
  })
  await page.goto('tracker')
  await hideOverlays(page)

  // No baby on file here, so another baby's session must not be counted.
  const history = page.locator('[data-slot="card"]', { hasText: /Log a past session/ }).first()
  await expect(history).toContainText(/No tummy sessions logged yet/)
})
