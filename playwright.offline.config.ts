import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/offline',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:4322',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'OFFLINE_E2E=true pnpm run build && OFFLINE_E2E=true pnpm exec astro preview --host 127.0.0.1 --port 4322',
    url: 'http://127.0.0.1:4322/en/app',
    reuseExistingServer: false,
    timeout: 180000,
  },
});
