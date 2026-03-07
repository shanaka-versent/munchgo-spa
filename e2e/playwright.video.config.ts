import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for recording showcase videos of MunchGo E2E flows.
 *
 * Runs ONLY the tests/video/ showcase tests with slowMo for watchable output.
 *
 * Usage:
 *   npm run test:video                 # record showcase tests
 *   npm run test:video:headed          # watch live while recording
 */
export default defineConfig({
  testDir: './tests/video',
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
      slowMo: 300,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
