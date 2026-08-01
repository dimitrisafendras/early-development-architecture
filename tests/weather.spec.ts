import { test, expect } from '@playwright/test'
import { openSettings, readStore, seedStore } from './helpers'

/**
 * The header weather reading and its settings switch.
 *
 * Open-Meteo is stubbed at the network layer. A test that hit the real service
 * would be a test of somebody else's uptime, and would report a different
 * temperature every run.
 */

const FAKE_WEATHER = {
  current: { temperature_2m: 21.4, weather_code: 0 },
}

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 37.98, longitude: 23.73 })
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({ json: FAKE_WEATHER }),
  )
})

test('shows the reading in the header once location is allowed', async ({ page }) => {
  await seedStore(page, { weatherOn: true, weatherDenied: false })
  await page.goto('tracker')

  const header = page.locator('header').first()
  await expect(header).toContainText('21°C')
  await expect(header).toContainText('Clear')
  // SI only — no Fahrenheit anywhere, ever.
  await expect(header).not.toContainText('°F')
})

test('the switch removes the reading and clears the stored coordinates', async ({ page }) => {
  await seedStore(page, { weatherOn: true })
  await page.goto('tracker')
  await expect(page.locator('header').first()).toContainText('21°C')

  await openSettings(page)
  // The Liquid Glass toggle group renders its options as radios, not buttons.
  await page.getByRole('radio', { name: 'Off', exact: true }).last().click()

  await expect(page.locator('header').first()).not.toContainText('°C')
  const store = await readStore(page)
  expect(store.weatherOn).toBe(false)
  expect(store.weatherCoords).toBeNull()
  // The rest of the band survives — only the reading goes.
  await expect(page.locator('header').first()).toContainText('Today')
})

test('switching back on restores the reading without a reload', async ({ page }) => {
  // This is the bug the whole feature exists for: a per-load ask guard meant the
  // toggle appeared to do nothing until the page was reloaded.
  await seedStore(page, { weatherOn: false })
  await page.goto('tracker')
  await expect(page.locator('header').first()).not.toContainText('°C')

  await openSettings(page)
  await page.getByRole('radio', { name: 'On', exact: true }).last().click()

  await expect(page.locator('header').first()).toContainText('21°C')
})

test('a browser refusal is explained, and switching on clears it', async ({ page }) => {
  await seedStore(page, { weatherOn: true, weatherDenied: true, weatherCoords: null })
  await page.goto('tracker')

  await openSettings(page)
  await expect(page.getByText(/blocked location/i)).toBeVisible()

  // The Liquid Glass toggle group renders its options as radios, not buttons.
  await page.getByRole('radio', { name: 'Off', exact: true }).last().click()
  await page.getByRole('radio', { name: 'On', exact: true }).last().click()

  const store = await readStore(page)
  expect(store.weatherDenied).toBe(false)
  expect(store.weatherOn).toBe(true)
})

test('a failing weather service leaves the rest of the header intact', async ({ page }) => {
  await page.route('**/api.open-meteo.com/**', (route) => route.abort())
  await seedStore(page, { weatherOn: true })
  await page.goto('tracker')

  const header = page.locator('header').first()
  await expect(header).toContainText('Today')
  await expect(header).not.toContainText('°C')
})
