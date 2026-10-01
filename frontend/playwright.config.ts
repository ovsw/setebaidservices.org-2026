import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // The route walk in e2e/cac.spec.ts is sharded into parallel tests. The
  // public-repo runner has four cores; use them all instead of the default half.
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_REUSE_BUILD
      ? "pnpm start"
      : "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer:
      !process.env.CI && !process.env.PLAYWRIGHT_REUSE_BUILD,
    timeout: 180_000,
  },
});
