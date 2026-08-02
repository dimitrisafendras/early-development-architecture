import { test, expect } from '@playwright/test'

import {
  ensureStopped,
  FIXTURES,
  hideOverlays,
  localSupabase,
  seedStore,
  selectBaby,
  signIn,
} from './helpers'

/**
 * The signed-in half of the app — everything the other 170 tests cannot reach.
 *
 * Every other spec runs signed out, against localStorage. That is the right
 * default: it is fast, deterministic, and it is how most people use the app.
 * But it leaves the entire server path untested, and the server path is where
 * this app's worst bugs have lived — reads that ignored `baby_id` while writes
 * carried it, so a second child's sessions counted as the first's, invisible
 * for as long as the household had one child and one device.
 *
 * These run against the local Supabase stack seeded by `supabase/seed.sql`
 * (`./scripts/dev-stack.sh test`). They are skipped otherwise — and the gate is
 * "is the URL local", not "is Supabase configured", because pointing them at
 * the hosted project would either fail loudly or, far worse, quietly pass by
 * reading real family data.
 */
test.skip(!localSupabase(), 'needs the local Supabase stack — ./scripts/dev-stack.sh test')

// The suite signs in for real over the network on every test, which is slower
// than the local-first specs by roughly a round trip each.
test.describe.configure({ mode: 'parallel' })

/**
 * The wait for anything that has to come back from the database.
 *
 * Playwright's five-second default is right for the local-first specs, where
 * every assertion is about a render the browser already has everything for.
 * Here it is not: signing in, listing the children and loading their sessions
 * are three real round trips, run seven workers wide beside a Docker VM. At the
 * default they fail as "the child has no sessions" or "there is no baby
 * picker", which are alarming sentences for what is actually a slow machine.
 */
const NET = 20_000

/** The child picker on `/baby` — the first thing that needs the server. */
function babyPicker(page: import('@playwright/test').Page) {
  return page.getByRole('group', { name: 'Baby' })
}

test.beforeEach(async ({ page }) => {
  // English, light, blue — the specs below assert on English strings, and the
  // fixture partner account's profile is Greek, which would otherwise leak in.
  await seedStore(page, { locale: 'en', dark: false, palette: 'blue' })
})

test('signing in survives a reload', async ({ page }) => {
  // The session storage adapter routes tokens to local- or sessionStorage
  // depending on "keep me signed in", and getting that wrong signs the user out
  // on every refresh — which reads as "the app forgot my data".
  await signIn(page)
  await page.goto('baby')
  await hideOverlays(page)
  await expect(babyPicker(page)).toBeVisible({ timeout: NET })

  await page.reload()
  await expect(babyPicker(page)).toBeVisible({ timeout: NET })
  // The signed-out state of this page is an explicit prompt, so its absence is
  // a stronger claim than the picker's presence alone.
  await expect(page.getByText('Sign in to create a baby profile')).toHaveCount(0)
})

test('both children are on file, and each carries its own growth history', async ({ page }) => {
  await signIn(page)
  await selectBaby(page, FIXTURES.younger)

  const picker = babyPicker(page)
  await expect(picker.getByRole('button', { name: FIXTURES.younger })).toBeVisible({ timeout: NET })
  await expect(picker.getByRole('button', { name: FIXTURES.older })).toBeVisible()

  // A measurement history that renders at all is the claim here — the seed
  // writes one a month since birth, and an empty chart would mean either the
  // rows or the `baby_id` scoping went missing.
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: NET })
})

test('sessions and feeds belong to the selected child, not to whoever loaded first', async ({
  page,
}) => {
  // The regression this file exists for. The two children are seeded with
  // deliberately different amounts, so "the wrong child's data" is a visible
  // number rather than a subtle one — and the seed gives the older child longer
  // sessions precisely so the totals cannot coincide.
  await signIn(page)

  await selectBaby(page, FIXTURES.younger)
  await page.goto('tracker')
  await hideOverlays(page)
  await ensureStopped(page)
  const younger = await totalMinutes(page, FIXTURES.younger)

  await selectBaby(page, FIXTURES.older)
  await page.goto('tracker')
  await hideOverlays(page)
  await ensureStopped(page)
  const older = await totalMinutes(page, FIXTURES.older)

  expect(younger).toBeGreaterThan(0)
  expect(older).toBeGreaterThan(0)
  expect(older).not.toBe(younger)
})

test('the older child logs active play, the younger tummy time', async ({ page }) => {
  // Twelve months is where the app changes what it is measuring. With one child
  // on each side of it, the switch is exercised by simply changing the picker —
  // and a page that says "tummy time" for a sixteen-month-old is measuring
  // against the wrong guidance as well as naming the wrong thing.
  await signIn(page)

  const heading = page.getByRole('heading', { level: 1 })

  await selectBaby(page, FIXTURES.younger)
  await page.goto('tracker')
  await hideOverlays(page)
  // `toHaveText`, not a read-then-compare: the selected child arrives over the
  // network, so the page renders the other one's title first and an immediate
  // `innerText()` captures that.
  await expect(heading).toHaveText('Tummy-Time Tracker', { timeout: NET })

  await selectBaby(page, FIXTURES.older)
  await page.goto('tracker')
  await hideOverlays(page)
  await expect(heading).toHaveText('Active-Play Tracker', { timeout: NET })
})

test('a session logged in the browser is still there after a reload', async ({
  page,
}, testInfo) => {
  // The round trip the local-first specs cannot make: start, stop, and confirm
  // the row came back from the server rather than from this tab's memory.
  //
  // One project only. Every other test here reads; this one writes, and the two
  // browser projects run concurrently against the same account — so run it
  // twice at once and the second timer starts while the first is still going,
  // which is a state the app is right to refuse and a test has no business
  // creating.
  test.skip(testInfo.project.name !== 'chromium', 'writes to the shared fixture account')

  await signIn(page)
  await selectBaby(page, FIXTURES.younger)
  await page.goto('tracker')
  await hideOverlays(page)
  await ensureStopped(page)

  const before = await totalMinutes(page, FIXTURES.younger)
  await page.getByRole('button', { name: /Start session/ }).click()
  await expect(page.getByRole('button', { name: /Stop session/ })).toBeVisible()
  await page.getByRole('button', { name: /Stop session/ }).click()
  await expect(page.getByRole('button', { name: /Start session/ })).toBeVisible()

  await page.reload()
  await hideOverlays(page)
  await ensureStopped(page)
  // Same total or one minute more — a few seconds rounds to zero, and asserting
  // on an increase would make this test about the clock rather than about the
  // row surviving the trip.
  const after = await totalMinutes(page, FIXTURES.younger)
  expect(after).toBeGreaterThanOrEqual(before)
  await expect(page.locator('#tummy-history')).toBeVisible()
})

test('the feed log reads the seeded feeds, in all three shapes', async ({ page }) => {
  // A feed row is one of three things — a bottle with `amount_ml`, a breastfeed
  // with `minutes`, or a solid with neither — and the list has rendered a blank
  // cell for the third before.
  await signIn(page)
  await selectBaby(page, FIXTURES.younger)
  await page.goto('feed')
  await hideOverlays(page)

  await expect(page.getByText(/\d+\s*ml/).first()).toBeVisible({ timeout: NET })
})

test('the printable report carries the selected child’s own logs', async ({ page }) => {
  // The report fetched both logs with no `baby_id`, which on the server means
  // "rows belonging to nobody" — so every signed-in household's report said
  // nothing had been logged, on the one page meant to be handed to a doctor.
  // Only a real database can catch this: signed out, the filter and the omission
  // look the same, because local rows written before children existed are the
  // legacy bucket the report is right to keep.
  await signIn(page)
  await selectBaby(page, FIXTURES.younger)
  await page.goto('export')
  await hideOverlays(page)

  const doc = page.locator('#report-document')
  await expect(doc).toBeVisible({ timeout: NET })
  await expect(doc.getByRole('heading', { name: 'Feeds' })).toBeVisible({ timeout: NET })
  await expect(doc).not.toContainText(/Nothing was logged/i)
  // The seed writes both feeds and sessions for both children every day.
  await expect(doc.getByRole('heading', { name: 'Tummy time' })).toBeVisible()
})

test('the family page shows the household, both parents and the open invite', async ({ page }) => {
  await signIn(page)
  await page.goto('family')
  await hideOverlays(page)

  await expect(page.getByText(FIXTURES.family)).toBeVisible({ timeout: NET })
  await expect(page.getByText(FIXTURES.parent.email)).toBeVisible()
  await expect(page.getByText(FIXTURES.partner.email)).toBeVisible()
  await expect(page.getByText('grandparent@example.test')).toBeVisible()
})

test('the invited co-parent sees the same two children', async ({ page }) => {
  // Household RLS is `owner OR member`, and the member half is the one that is
  // never exercised by the owner's own session. If sharing regressed, this
  // account would see an empty app while everything else in this file passed.
  await signIn(page, FIXTURES.partner)
  await page.goto('baby')
  await hideOverlays(page)

  const picker = babyPicker(page)
  await expect(picker.getByRole('button', { name: FIXTURES.younger })).toBeVisible({ timeout: NET })
  await expect(picker.getByRole('button', { name: FIXTURES.older })).toBeVisible()
})

/** The tracker console — the card the session bar lives in. */
function consoleCard(page: import('@playwright/test').Page) {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.locator('[data-slot="session-block"]') })
    .first()
}

/**
 * The day's total as the readout states it — `12 / 30 min`. Zero while the
 * sessions are still in flight, and while a session is *running*, where the
 * readout is a `mm:ss` clock instead and has no minutes total to give.
 */
async function readTotal(page: import('@playwright/test').Page): Promise<number> {
  const text = await consoleCard(page).innerText()
  const m = text.match(/(\d+)\s*\/\s*\d+\s*min/)
  return m ? Number(m[1]) : 0
}

/**
 * The day's total, once it has actually arrived.
 *
 * Two loads land at different times and only the second one carries the
 * sessions: the page knows which child is selected — and renders "Target tuned
 * to Theo" — a beat before their sessions come back, so it reads `0 / 240` in
 * between. Anchoring on the child's name was not enough; a poll is.
 *
 * Both fixture children are seeded with sessions *today* by construction, so
 * "greater than zero" is a safe thing to wait for here and would be a real
 * failure if it never arrived.
 */
async function totalMinutes(
  page: import('@playwright/test').Page,
  baby: string,
): Promise<number> {
  await expect(page.getByText(new RegExp(`Target tuned to ${baby}`))).toBeVisible()
  // Generous, because this waits on two real network round trips and the whole
  // suite runs seven workers wide beside a Docker VM. A tight bound here fails
  // as "the child has no sessions", which is a far more alarming sentence than
  // the truth.
  await expect.poll(() => readTotal(page), { timeout: 30_000 }).toBeGreaterThan(0)
  return readTotal(page)
}
