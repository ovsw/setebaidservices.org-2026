import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

// Serve on this worktree's own Website port (the one `pnpm dev:worktree` uses),
// so the smoke test never collides with another worktree's server on 3000.
// The test scripts run scripts/ensure-worktree-ports.mjs first to assign it.
const portsFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".worktree-ports.json",
);
const port: number = existsSync(portsFile)
  ? JSON.parse(readFileSync(portsFile, "utf8")).frontendPort
  : 3000;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  // The route walk in e2e/site.spec.ts is sharded into parallel tests. The
  // public-repo runner has four cores; use them all instead of the default half.
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_REUSE_BUILD
      ? `pnpm start --port ${port}`
      : `pnpm build && pnpm start --port ${port}`,
    url: baseURL,
    reuseExistingServer:
      !process.env.CI && !process.env.PLAYWRIGHT_REUSE_BUILD,
    timeout: 180_000,
  },
});
