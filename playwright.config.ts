import { defineConfig, devices } from '@playwright/test'

/**
 * The app is a static SPA served under a base path, so every test navigates
 * through `BASE` rather than `/` — a bare `/` is a 404 in dev and in production
 * alike, and hard-coding the path in each spec is how it drifts when the repo
 * is renamed.
 *
 * `webServer` owns the dev server: `reuseExistingServer` keeps a server you
 * already have running from being killed, and starts one in CI where there is
 * none.
 */
export const BASE = '/early-development-architecture/'
export const PORT = 5173

export default defineConfig({
  testDir: './tests',
  // The specs seed localStorage and assert on rendered state; running files in
  // parallel is safe because each Playwright worker gets its own context.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: 'on-first-retry',
    // The app pins itself to a 24-hour clock and en-GB/el-GR formatting; a
    // machine in a 12-hour locale would otherwise fail time assertions that are
    // correct in the product.
    locale: 'en-GB',
    timezoneId: 'Europe/Athens',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    // The app is phone-first and the bottom tab bar / stacked rows only exist
    // below `xl`, so the mobile layout is a distinct product, not a resize.
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
