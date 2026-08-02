import { expect, type Page } from '@playwright/test'

/**
 * Shared fixtures for driving the app's persisted state.
 *
 * Everything the app remembers lives in one localStorage key written by
 * zustand's `persist` (`eda-theme`, versioned). Seeding it through
 * `addInitScript` — before any app code runs — is the only way to start a test
 * in a chosen state; setting it after navigation would race the store's
 * hydration and be read back as the default.
 */

export const STORE_KEY = 'eda-theme'
export const FEEDS_KEY = 'eda-feeds-local'
export const SESSIONS_KEY = 'eda-tummy-local'

/** The persisted slice, as the app's `partialize` writes it. */
export interface SeedState {
  dark?: boolean
  palette?: 'blue' | 'red'
  locale?: 'en' | 'el'
  weatherOn?: boolean
  weatherDenied?: boolean
  weatherCoords?: { lat: number; lon: number } | null
  customSchedules?: unknown[]
  navCollapsed?: boolean
  timelineLayout?: 'side' | 'top'
}

/** Seed the store before the app boots. Call before `page.goto`. */
export async function seedStore(page: Page, state: SeedState, version = 1) {
  await page.addInitScript(
    ([key, payload]) => {
      localStorage.setItem(key as string, payload as string)
    },
    [STORE_KEY, JSON.stringify({ state, version })] as const,
  )
}

/** Seed the local-first feed log (used when signed out, which tests always are). */
export async function seedFeeds(page: Page, feeds: unknown[]) {
  await page.addInitScript(
    ([key, payload]) => localStorage.setItem(key as string, payload as string),
    [FEEDS_KEY, JSON.stringify(feeds)] as const,
  )
}

/** Seed the local-first tummy sessions. */
export async function seedSessions(page: Page, sessions: unknown[]) {
  await page.addInitScript(
    ([key, payload]) => localStorage.setItem(key as string, payload as string),
    [SESSIONS_KEY, JSON.stringify(sessions)] as const,
  )
}

/** Read the persisted store back, to assert on what the UI actually saved. */
export async function readStore(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key as string)
    return raw ? JSON.parse(raw).state : {}
  }, STORE_KEY)
}

/**
 * The install banner and the mobile tab bar are fixed overlays that sit on top
 * of page content and swallow clicks aimed at anything near the bottom. They
 * are real UI, not test noise — but a test about the schedule editor should
 * fail on the schedule editor, not on a banner. Hidden, never removed, so a
 * test that *is* about them can still find them.
 */
export async function hideOverlays(page: Page) {
  await page.addStyleTag({
    content: `
      nav[aria-label="App"],
      [aria-label="Add to your phone"] { visibility: hidden !important; pointer-events: none !important; }
    `,
  })
}

/** ISO instant for today at `hh:mm` local — log rows are stored as instants. */
export function todayAt(hours: number, minutes: number, dayOffset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

/** OKLCH hue of a computed colour string, or null if it isn't oklch. */
export function hueOf(color: string): number | null {
  const m = color.match(/oklch\([\d.]+ [\d.]+ ([\d.]+)/)
  return m ? Number(m[1]) : null
}

/** Smallest angle between two hues on the colour wheel. */
export function hueGap(a: number, b: number): number {
  const x = Math.abs(a - b) % 360
  return Math.min(x, 360 - x)
}

/**
 * Open the settings popover, whichever navigation is on screen.
 *
 * From `xl` the trigger sits in the desktop rail; below it, it lives inside the
 * top bar's hamburger. That is the app working as designed — two navigations,
 * one per breakpoint — so a test that only knew about the rail would fail on
 * the phone for no product reason.
 */
export async function openSettings(page: Page) {
  // Both navigations are in the DOM at every width; only one is visible. So the
  // filter is `visible=true`, not `.first()` — the rail's hidden trigger comes
  // first in document order and would be picked on a phone.
  const visibleTrigger = page.getByLabel('Settings').locator('visible=true')
  if ((await visibleTrigger.count()) === 0) {
    await page.getByLabel('Open menu').locator('visible=true').first().click()
  }
  await visibleTrigger.first().click()
}

/**
 * The fixture accounts and children `supabase/seed.sql` creates.
 *
 * Ages are offsets from today in the seed, so these are the *bands* they sit in
 * rather than dates: one child under a year, one over, because twelve months is
 * where the app changes what it measures.
 */
export const FIXTURES = {
  parent: { email: 'parent@example.test', password: 'devpassword' },
  partner: { email: 'partner@example.test', password: 'devpassword' },
  /** 4 months — tummy time, AAP ramp. */
  younger: 'Iris',
  /** 16 months — active play, WHO 180 minutes. */
  older: 'Theo',
  family: 'Test Family',
} as const

/**
 * Whether a local Supabase stack is configured for this run.
 *
 * The signed-in specs are the only ones that need a database, and they must
 * never run against the hosted project: they read the seeded fixtures and would
 * either fail loudly or — far worse — pass by reading somebody's real data. So
 * the gate is not "is Supabase configured" but "is it *local*".
 */
export function localSupabase(): boolean {
  const url = process.env.VITE_SUPABASE_URL ?? ''
  return /^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(url)
}

/**
 * Sign in as a fixture account and wait for the app to be signed in.
 *
 * Waits on the app's own reaction — the header stops offering "Sign in" — not
 * on the network call, because the session lands in storage before React has
 * re-rendered anything a test can see.
 */
export async function signIn(
  page: Page,
  who: { email: string; password: string } = FIXTURES.parent,
) {
  await page.goto('signin')
  await page.locator('#auth-email').fill(who.email)
  await page.locator('#auth-password').fill(who.password)
  await page.getByRole('button', { name: /^Sign in$/ }).click()
  // The route redirects home on success; an error renders in the form instead.
  await expect(page.locator('#auth-email')).toHaveCount(0, { timeout: 15_000 })
}

/**
 * Leave `/tracker` with no session running.
 *
 * The signed-in specs share one database, so a *running* session is state that
 * outlives the test that started it — and one aborted run left the console
 * reading `09:42 / 10:00` for every later test, which is not a number any
 * assertion about the day's total can parse. Stopping it is also what a person
 * would do, so this is not a fixture reaching behind the app.
 */
export async function ensureStopped(page: Page) {
  const stop = page.getByRole('button', { name: /Stop session/ })
  if (await stop.isVisible().catch(() => false)) {
    await stop.click()
    await expect(page.getByRole('button', { name: /Start session/ })).toBeVisible()
  }
}

/** Switch the active child on `/baby`, which is where the picker lives. */
export async function selectBaby(page: Page, name: string) {
  await page.goto('baby')
  await hideOverlays(page)
  // `ChoiceGroup` is a Base UI ToggleGroup — a `group` of pressed-state buttons,
  // not a radiogroup — so the state to wait on is `aria-pressed`, not `checked`.
  const picker = page.getByRole('group', { name: 'Baby' })
  // The picker only exists once the children have come back from the server, so
  // this is a network wait, not a render wait — see `NET` in signed-in.spec.ts.
  await expect(picker).toBeVisible({ timeout: 20_000 })
  const pill = picker.getByRole('button', { name })
  await pill.click()
  await expect(pill).toHaveAttribute('aria-pressed', 'true')
}

/**
 * Set a `NumberInput` the way a person does.
 *
 * `locator.fill()` does not drive it: Base UI's `NumberField` keeps the typed
 * string in its own state and re-renders the input from that, so a value poked
 * straight into the DOM node is overwritten on the next render and
 * `onValueChange` never fires. Select-all-and-type, then blur to commit —
 * which is also exactly the interaction being claimed to work.
 */
export async function setNumberInput(page: Page, id: string, value: number) {
  const field = page.locator(`#${id}`)
  await field.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type(String(value))
  await page.keyboard.press('Tab')
  await expect(field).toHaveValue(String(value))
}
