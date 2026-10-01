#!/usr/bin/env node
// Remove the retired `headerImage` field from every page document.
// The Website never rendered it, the schema no longer declares it, and its
// alt-text rule blocked publishing on pages migrated without an alt.
//
// Dry run:  pnpm --dir studio migrate:remove-page-header-image
// Apply:    pnpm --dir studio migrate:remove-page-header-image --apply
//
// Apply first writes a raw dataset export to backups/ and stops unless it
// passes `gzip -t`. It unsets the field under each document's own id, so
// drafts stay drafts and published documents stay published. It never
// publishes a draft.

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const API_VERSION = "2026-03-23";
const studioDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backupDirectory = resolve(studioDirectory, "../backups");

/**
 * Return one plan per page that still carries `headerImage`. The caller must
 * apply `unset(["headerImage"])` with `ifRevisionId(plan._rev)`. Nothing else
 * on the document is touched.
 */
export function createRemoveHeaderImagePlans(pages) {
  return pages.flatMap((page) => {
    if (!page?._id || !page?._rev) throw new Error("A page must include _id and _rev");
    if (!("headerImage" in page) || page.headerImage === undefined) return [];
    return [{ _id: page._id, _rev: page._rev, asset: page.headerImage?.asset?._ref ?? null }];
  });
}

const exportVerifiedBackup = (dataset) => {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const backup = resolve(backupDirectory, `${dataset}-${stamp}-remove-page-header-image.tar.gz`);
  mkdirSync(backupDirectory, { recursive: true });
  execFileSync("pnpm", ["exec", "sanity", "datasets", "export", dataset, backup, "--raw"], {
    cwd: studioDirectory,
    stdio: "inherit",
  });
  execFileSync("gzip", ["-t", backup], { stdio: "inherit" });
  console.log(`Backup verified: ${backup}`);
};

// GROQ drops null-valued attributes from projections and `defined(null)` is
// false, so a page that stores `headerImage: null` would slip past a filter.
// Read the raw documents instead; they keep the key as stored.
async function fetchRawPages(client) {
  const ids = await client.fetch(`*[_type == "page"] | order(_id asc)._id`, {}, { perspective: "raw" });
  const pages = [];
  for (let index = 0; index < ids.length; index += 100) {
    pages.push(...(await client.getDocuments(ids.slice(index, index + 100))));
  }
  return pages.filter(Boolean);
}

async function run() {
  const apply = process.argv.includes("--apply");
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();
  assertCacProductionTarget({ dataset, projectId });

  const pages = await fetchRawPages(client);
  const plans = createRemoveHeaderImagePlans(pages);
  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        projectId,
        dataset,
        pages: plans.length,
        drafts: plans.filter(({ _id }) => _id.startsWith("drafts.")).length,
        ids: plans.map(({ _id }) => _id),
      },
      null,
      2,
    ),
  );
  if (!apply || plans.length === 0) return;

  exportVerifiedBackup(dataset);

  const transaction = client.transaction();
  for (const plan of plans) {
    transaction.patch(plan._id, (patch) => patch.ifRevisionId(plan._rev).unset(["headerImage"]));
  }
  await transaction.commit({ visibility: "sync" });

  const remaining = createRemoveHeaderImagePlans(await fetchRawPages(client)).map(({ _id }) => _id);
  if (remaining.length > 0) throw new Error(`Pages still with headerImage: ${remaining.join(", ")}`);
  console.log(`Removed headerImage from ${plans.length} page document(s).`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
