import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from './config/env.loader';

const envConfig = loadEnvConfig();
const slowMode = process.env.SLOW_MODE === 'true';

export default defineConfig({
  testDir: './tests',
  
  // Exécution séquentielle
  fullyParallel: false,
  workers: 1,
  
  // Timeout global pour chaque test (2 minutes)
  timeout: 120000,
  
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
    timeout: 15000,
  },
  
  use: {
    baseURL: envConfig.baseUrl,
    headless: !!process.env.CI, // headless en CI, avec fenêtre en local
    
    // Ralentir les actions si SLOW_MODE=true
    launchOptions: slowMode ? { slowMo: 1000 } : {},
    
    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 60000,
    
    // Captures d'écran et traces
    trace: 'on-first-retry',
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
