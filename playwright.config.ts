import { defineConfig } from "@playwright/test";

const PLAYWRIGHT_PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: `http://127.0.0.1:${PLAYWRIGHT_PORT}`,
  },
  webServer: {
    command: `npm run build && npm run start -- --hostname 127.0.0.1 --port ${PLAYWRIGHT_PORT}`,
    url: `http://127.0.0.1:${PLAYWRIGHT_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
