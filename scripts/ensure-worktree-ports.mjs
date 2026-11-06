#!/usr/bin/env node

// Gives this worktree its port slot before Playwright starts, so the smoke
// test serves the Website on the same port as `pnpm dev:worktree` instead of
// 3000, which another worktree's dev server may hold. A worktree that already
// has a slot keeps it; a new one gets a free slot, saved to .worktree-ports.json.

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allocatePorts, RUNTIME_FILE } from "./worktree-config.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (!existsSync(path.join(repoRoot, RUNTIME_FILE))) {
  const ports = await allocatePorts({ worktreeRoot: repoRoot });
  await ports.release();
  console.log(`Worktree slot ${ports.slot}: Website port ${ports.frontendPort}`);
}
