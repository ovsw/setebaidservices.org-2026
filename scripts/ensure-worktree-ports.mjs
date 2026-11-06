#!/usr/bin/env node

// Gives this worktree its port slot before Playwright starts, so the smoke
// test serves the Website on the same port as `pnpm dev:worktree` instead of
// 3000, which another worktree's dev server may hold.
//
// A worktree keeps its saved slot while the port is free or held by its own
// dev server. When another worktree holds that port, the saved slot is dropped
// and a free one is picked, so Playwright never tests another worktree's site.

import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  allocatePorts,
  defaultReservationRoot,
  isPortAvailable,
  RUNTIME_FILE,
} from "./worktree-config.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeFile = path.join(repoRoot, RUNTIME_FILE);

async function slotOwnerRoot(slot) {
  const ownerFile = path.join(
    await defaultReservationRoot(repoRoot),
    `slot-${slot}`,
    "owner.json",
  );
  try {
    return JSON.parse(await readFile(ownerFile, "utf8"))?.worktreeRoot;
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return undefined;
    throw error;
  }
}

if (existsSync(runtimeFile)) {
  const saved = JSON.parse(await readFile(runtimeFile, "utf8"));
  if (await isPortAvailable(saved.frontendPort)) process.exit(0);

  const owner = await slotOwnerRoot(saved.slot);
  if (owner === repoRoot) process.exit(0);

  console.log(
    `Port ${saved.frontendPort} is held by ${owner ?? "another process"}; picking a new slot.`,
  );
  await rm(runtimeFile);
}

const ports = await allocatePorts({ worktreeRoot: repoRoot });
await ports.release();
console.log(`Worktree slot ${ports.slot}: Website port ${ports.frontendPort}`);
