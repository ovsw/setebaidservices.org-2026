#!/usr/bin/env node
// Move the headline price of an includedExtras section out of its Extras
// list and into the new `prices` field.
//
// What this changes in each targeted block:
//   1. prices: set to one or more price tiers { name, price, unit, note }
//   2. extras.items: the rows that held the headline price are removed
//
// The page keeps its draft or published state: the script patches the exact
// document id listed in TARGETS.
//
// Dry run (default):  pnpm migrate:included-extras-prices
// Apply:              pnpm migrate:included-extras-prices --apply

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const API_VERSION = "2026-03-23";
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultBackupPath = resolve(
  scriptDirectory,
  "../backups/included-extras-prices.json",
);

/**
 * One entry per document. `removeExtraKeys` lists the Extras rows that held
 * the headline price; `prices` is the tier list that replaces them.
 */
export const TARGETS = [
  {
    _id: "adultCamp",
    removeExtraKeys: ["ad-ext-1"],
    prices: [
      {
        _key: "ad-price-1",
        _type: "includedExtrasPrice",
        name: "Adult camp weekend, per person",
        price: "$725",
        unit: "plus tax",
        note: "Sept 3 to 6, 2027. Previous season’s price (camp to confirm)",
      },
    ],
  },
  {
    _id: "drafts.travelByBus",
    removeExtraKeys: ["tbb-ex-1", "tbb-ex-2"],
    prices: [
      {
        _key: "tbb-price-1",
        _type: "includedExtrasPrice",
        name: "Camp bus, round trip",
        price: "$265",
        unit: "plus HST",
        note: "Toronto or Huntsville to the dock and back (camp to confirm)",
      },
      {
        _key: "tbb-price-2",
        _type: "includedExtrasPrice",
        name: "Camp bus, one way",
        price: "$175",
        unit: "plus HST",
        note: "Either direction (camp to confirm)",
      },
    ],
  },
  {
    _id: "drafts.nccpCourses",
    removeExtraKeys: [],
    prices: [
      {
        _key: "nccp-price-1",
        _type: "includedExtrasPrice",
        name: "Competition 1",
        price: "$1,100",
        unit: "plus tax",
        note: "Previous season’s fee (camp to confirm)",
      },
      {
        _key: "nccp-price-2",
        _type: "includedExtrasPrice",
        name: "Competition 2",
        price: "$1,250",
        unit: "plus tax",
        note: "Previous season’s fee (camp to confirm)",
      },
    ],
  },
];

/** Build the migration plan for one document. */
export function createPlan(document, target) {
  const block = (document.blocks ?? []).find((b) => b?._type === "includedExtras");
  if (!block) return null;

  const extraItems = block.extras?.items ?? [];
  const missing = target.removeExtraKeys.filter(
    (key) => !extraItems.some((item) => item?._key === key),
  );
  if (missing.length > 0) {
    throw new Error(
      `${document._id}: extras rows ${missing.join(", ")} not found; the content changed since the plan was written`,
    );
  }

  const remainingExtras = extraItems.filter(
    (item) => !target.removeExtraKeys.includes(item?._key),
  );
  if (remainingExtras.length < 1) {
    throw new Error(`${document._id}: the Extras column would be empty`);
  }

  return {
    _id: document._id,
    _rev: document._rev,
    _key: block._key,
    path: `blocks[_key=="${block._key}"]`,
    originalPrices: block.prices ?? null,
    originalExtras: extraItems,
    prices: target.prices,
    extras: remainingExtras,
  };
}

const backupPathFromArgs = () => {
  const argument = process.argv.find((value) => value.startsWith("--backup="));
  return argument ? resolve(argument.slice("--backup=".length)) : defaultBackupPath;
};

const backupDocuments = (plans) =>
  plans.map(({ _id, _rev, _key, originalPrices, originalExtras }) => ({
    _id,
    _rev,
    _key,
    prices: originalPrices,
    extras: originalExtras,
  }));

const assertBackupMatchesPlans = (backup, plans, projectId, dataset) => {
  if (backup.projectId !== projectId || backup.dataset !== dataset) {
    throw new Error("Backup target does not match the configured Sanity dataset");
  }
  if (!isDeepStrictEqual(backup.documents, backupDocuments(plans))) {
    throw new Error("Backup does not match the current migration plan; run a new dry run");
  }
};

async function run() {
  const apply = process.argv.includes("--apply");
  const backupPath = backupPathFromArgs();
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();

  assertCacProductionTarget({ dataset, projectId });

  const ids = TARGETS.map((t) => t._id);
  const documents = await client.fetch(
    `*[_id in $ids] | order(_id asc) { _id, _rev, blocks }`,
    { ids },
    { perspective: "raw" },
  );

  const docById = new Map(documents.map((d) => [d._id, d]));
  const plans = TARGETS.flatMap((target) => {
    const doc = docById.get(target._id);
    if (!doc) {
      console.warn(`⚠ Document ${target._id} not found — skipping`);
      return [];
    }
    const plan = createPlan(doc, target);
    if (!plan) {
      console.warn(`⚠ No includedExtras block in ${target._id} — skipping`);
      return [];
    }
    return [plan];
  });

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        projectId,
        dataset,
        blocks: plans.length,
        targets: plans.map(
          ({ _id, _key, prices, extras }) =>
            `${_id} → ${_key}: ${prices.length} price(s), ${extras.length} extra(s) kept`,
        ),
        backupPath,
      },
      null,
      2,
    ),
  );
  if (plans.length === 0) return;

  if (!apply) {
    const backup = {
      projectId,
      dataset,
      createdAt: new Date().toISOString(),
      documents: backupDocuments(plans),
    };
    await mkdir(dirname(backupPath), { recursive: true });
    await writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, {
      flag: "wx",
    });
    console.log(`Backup written to ${backupPath}`);
    return;
  }

  // --- Apply ---
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  assertBackupMatchesPlans(backup, plans, projectId, dataset);

  for (const plan of plans) {
    await client
      .patch(plan._id)
      .ifRevisionId(plan._rev)
      .set({
        [`${plan.path}.prices`]: plan.prices,
        [`${plan.path}.extras.items`]: plan.extras,
      })
      .commit({ visibility: "sync" });

    console.log(`✔ ${plan._id} / ${plan._key}`);
  }

  // --- Verify ---
  const migrated = await client.fetch(
    `*[_id in $ids] | order(_id asc) { _id, blocks }`,
    { ids },
    { perspective: "raw" },
  );
  for (const plan of plans) {
    const doc = migrated.find((d) => d._id === plan._id);
    const block = doc?.blocks?.find((b) => b._key === plan._key);
    if (
      !isDeepStrictEqual(block?.prices, plan.prices) ||
      !isDeepStrictEqual(block?.extras?.items, plan.extras)
    ) {
      throw new Error(`Verification failed for ${plan._id} / ${plan._key}`);
    }
  }

  console.log(`\nMigrated and verified ${plans.length} includedExtras block(s).`);
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
