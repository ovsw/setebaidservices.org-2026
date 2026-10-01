#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";
import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const APPLY = process.argv.includes("--apply");
const sourceArgument = process.argv.find((argument) =>
  argument.startsWith("--source="),
);

if (!sourceArgument) {
  throw new Error("Pass the pre-deletion NDJSON as --source=/absolute/path");
}

const sourcePath = sourceArgument.slice("--source=".length);
const client = getCliClient({ apiVersion: "2026-03-23" });
const { dataset, projectId } = client.config();
const DROP = Symbol("drop-image-value");

assertCacProductionTarget({ dataset, projectId });

let imageValueCount = 0;

function withoutImageValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const next = withoutImageValues(item);
      return next === DROP ? [] : [next];
    });
  }

  if (!value || typeof value !== "object") return value;

  if (
    typeof value._sanityAsset === "string" &&
    value._sanityAsset.startsWith("image@file://")
  ) {
    imageValueCount += 1;
    return DROP;
  }

  if (
    value._type === "reference" &&
    typeof value._ref === "string" &&
    value._ref.startsWith("image-")
  ) {
    imageValueCount += 1;
    return DROP;
  }

  if (
    value.asset?._type === "reference" &&
    typeof value.asset._ref === "string" &&
    value.asset._ref.startsWith("image-")
  ) {
    imageValueCount += 1;
    return DROP;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([field, fieldValue]) => {
      const next = withoutImageValues(fieldValue);
      return next === DROP ? [] : [[field, next]];
    }),
  );
}

function withImageReferences(value) {
  if (Array.isArray(value)) return value.map(withImageReferences);
  if (!value || typeof value !== "object") return value;

  if (typeof value._sanityAsset === "string") {
    const match = value._sanityAsset.match(
      /^image@file:\/\/\.\/images\/([a-f0-9]+)-(\d+x\d+)\.([a-z0-9]+)$/,
    );
    if (!match) {
      throw new Error(`Unsupported image pointer: ${value._sanityAsset}`);
    }

    const [, hash, dimensions, extension] = match;
    const { _sanityAsset, ...image } = value;
    return {
      ...withImageReferences(image),
      asset: {
        _type: "reference",
        _ref: `image-${hash}-${dimensions}-${extension}`,
        _weak: true,
      },
    };
  }

  return Object.fromEntries(
    Object.entries(value).map(([field, fieldValue]) => [
      field,
      withImageReferences(fieldValue),
    ]),
  );
}

function currentFields(page) {
  return {
    title: page.title,
    slug: page.slug,
    description: page.description,
    blocks: page.blocks,
    meta: page.meta,
  };
}

const backupDocuments = (await readFile(sourcePath, "utf8"))
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const backupPages = new Map(
  backupDocuments
    .filter(
      (document) =>
        document._type === "page" && !document._id.startsWith("drafts."),
    )
    .map((document) => [document._id, document]),
);
const currentPages = await client.fetch(
  `*[_type == "page" && !(_id in path("drafts.**"))]`,
  {},
  { perspective: "raw" },
);

if (backupPages.size !== 46 || currentPages.length !== 46) {
  throw new Error(
    `Expected 46 backup and current pages, found ${backupPages.size} and ${currentPages.length}`,
  );
}

const plans = currentPages.map((page) => {
  const backupPage = backupPages.get(page._id);
  if (!backupPage) throw new Error(`${page._id}: missing from backup`);

  const strippedBackupMigration = withoutImageValues(backupPage.migration);
  if (!isDeepStrictEqual(page.migration, strippedBackupMigration)) {
    throw new Error(
      `${page._id}: current migration differs from the backup beyond image removal`,
    );
  }

  return {
    _id: page._id,
    _rev: page._rev,
    migration: withImageReferences(backupPage.migration),
    fieldsBefore: currentFields(page),
  };
});

const imageAssets = await client.fetch(
  `count(*[_type == "sanity.imageAsset"])`,
  {},
  { perspective: "raw" },
);
if (imageAssets !== 0) {
  throw new Error(`Expected zero image assets, found ${imageAssets}`);
}

console.log(
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
      projectId,
      dataset,
      pages: plans.length,
      legacyImageValues: imageValueCount,
      imageAssets,
    },
    null,
    2,
  ),
);

if (!APPLY) process.exit(0);

for (let index = 0; index < plans.length; index += 10) {
  let transaction = client.transaction();
  for (const plan of plans.slice(index, index + 10)) {
    transaction = transaction.patch(
      client
        .patch(plan._id)
        .ifRevisionId(plan._rev)
        .set({ migration: plan.migration }),
    );
  }
  await transaction.commit({ visibility: "sync" });
}

const restoredPages = await client.fetch(
  `*[_type == "page" && !(_id in path("drafts.**"))]`,
  {},
  { perspective: "raw" },
);
const restoredById = new Map(restoredPages.map((page) => [page._id, page]));

for (const plan of plans) {
  const restored = restoredById.get(plan._id);
  if (!restored || !isDeepStrictEqual(restored.migration, plan.migration)) {
    throw new Error(`${plan._id}: legacy image data was not restored exactly`);
  }
  if (!isDeepStrictEqual(currentFields(restored), plan.fieldsBefore)) {
    throw new Error(`${plan._id}: a current schema field changed`);
  }
}

const finalImageAssets = await client.fetch(
  `count(*[_type == "sanity.imageAsset"])`,
  {},
  { perspective: "raw" },
);
if (finalImageAssets !== 0) {
  throw new Error(`Image assets were restored unexpectedly: ${finalImageAssets}`);
}

console.log(
  `Restored ${imageValueCount} legacy image values across ${plans.length} pages with zero image assets.`,
);
