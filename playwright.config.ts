import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from './config/env.loader';

const envConfig = loadEnvConfig();
const slowMode = process.env.SLOW_MODE === 'true';

export default defineConfig({
  testDir: './tests',

  // Exécution séquentielle
  fullyParallel: false,
  workers: 1,

  // Timeout global pour chaque test (3 minutes)
  timeout: 180000,

  // Retries en cas d'échec
  retries: process.env.CI ? 2 : 0,

  // Reporter HTML
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  // Timeout pour les assertions expect()
  expect: {
    timeout: 30000,
  },

  use: {
    viewport: { width: 1920, height: 1080 },

    baseURL: envConfig.baseUrl,
    headless: !!process.env.CI, // headless en CI, avec fenêtre en local

    // Ralentir les actions si SLOW_MODE=true
    launchOptions: slowMode ? { slowMo: 1000 } : {},

    // Timeouts
    actionTimeout: 120000,
    navigationTimeout: 120000,

    // Captures d'écran et traces
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
