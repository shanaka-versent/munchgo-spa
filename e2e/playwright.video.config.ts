import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for recording videos of MunchGo E2E tests.
 *
 * Records the actual test suite with slowMo for watchable output.
 *
 * Usage:
 *   npm run test:video                 # record all tests
 *   npm run test:video:headed          # watch live while recording
 *   npm run test:video -- tests/video  # record only showcase tests
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/video/**'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://dcqt91rhtte69.cloudfront.net',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    video: 'on',
    screenshot: 'on',
    trace: 'on',
    launchOptions: {
      slowMo: 500,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
