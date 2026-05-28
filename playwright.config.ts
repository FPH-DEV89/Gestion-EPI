import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration de Playwright adaptée pour s'exécuter sur le port 3005
 * afin d'éviter tout conflit avec d'autres serveurs locaux (ex: port 3000 déjà utilisé).
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90 * 1000, // Laisser le temps au serveur Next.js de compiler au premier appel
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3005', // Port 3005 isolé
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Test sur Chromium et Firefox (WebKit désactivé pour éviter l'erreur de binaire locale) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Démarrage automatique de l'application sur le port 3005 */
  webServer: {
    command: 'npx next dev --webpack -p 3005',
    url: 'http://localhost:3005',
    reuseExistingServer: false, // Forcer le démarrage d'une nouvelle instance propre pour ce test
    timeout: 120 * 1000,
  },
});
