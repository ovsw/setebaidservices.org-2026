#!/usr/bin/env node

import process from "node:process";
import { getCliClient } from "sanity/cli";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const APPLY = process.argv.includes("--apply");
const API_VERSION = "2026-03-23";
const BATCH_SIZE = 10;
const DROP = Symbol("drop-image-value");
const client = getCliClient({ apiVersion: API_VERSION });
const { dataset, projectId } = client.config();

assertCacProductionTarget({ dataset, projectId });

const imageAssets = await client.fetch(
  `*[_type == "sanity.imageAsset"] | order(_id asc) {_id}`,
  {},
  { perspective: "raw" },
);
const imageIds = new Set(imageAssets.map(({ _id }) => _id));
const documents = await client.fetch(
  `*[_type != "sanity.imageAsset" && _type != "sanity.fileAsset"]`,
  {},
  { perspective: "raw" },
);

let removedImageValues = 0;

function stripImageValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const next = stripImageValues(item);
      return next === DROP ? [] : [next];
    });
  }

  if (!value || typeof value !== "object") return value;

  if (value._type === "reference" && imageIds.has(value._ref)) {
    removedImageValues += 1;
    return DROP;
  }

  if (
    value.asset?._type === "reference" &&
    imageIds.has(value.asset._ref)
  ) {
    removedImageValues += 1;
    return DROP;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([field, fieldValue]) => {
      const next = stripImageValues(fieldValue);
      return next === DROP ? [] : [[field, next]];
    }),
  );
}

const plans = documents.flatMap((document) => {
  const set = {};
  const unset = [];

  for (const [field, value] of Object.entries(document)) {
    if (field.startsWith("_")) continue;
    const next = stripImageValues(value);
    if (next === DROP) {
      unset.push(field);
    } else if (JSON.stringify(next) !== JSON.stringify(value)) {
      set[field] = next;
    }
  }

  return Object.keys(set).length || unset.length
    ? [{ _id: document._id, _rev: document._rev, set, unset }]
    : [];
});

console.log(
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
      projectId,
      dataset,
      imageAssets: imageAssets.length,
      affectedDocuments: plans.length,
      removedImageValues,
      changes: plans.map(({ _id, set, unset }) => ({
        _id,
        fields: [...Object.keys(set), ...unset].sort(),
      })),
    },
    null,
    2,
  ),
);

if (!APPLY || imageAssets.length === 0) process.exit(0);

for (let index = 0; index < plans.length; index += BATCH_SIZE) {
  let transaction = client.transaction();
  for (const plan of plans.slice(index, index + BATCH_SIZE)) {
    let patch = client.patch(plan._id).ifRevisionId(plan._rev);
    if (Object.keys(plan.set).length) patch = patch.set(plan.set);
    if (plan.unset.length) patch = patch.unset(plan.unset);
    transaction = transaction.patch(patch);
  }
  await transaction.commit({ visibility: "sync" });
}

const remainingReferences = await client.fetch(
  `*[
    _type != "sanity.imageAsset" &&
    _type != "sanity.fileAsset" &&
    references($imageIds)
  ]{_id}`,
  { imageIds: [...imageIds] },
  { perspective: "raw" },
);

if (remainingReferences.length) {
  throw new Error(
    `Image references remain in: ${remainingReferences
      .map(({ _id }) => _id)
      .join(", ")}`,
  );
}

for (let index = 0; index < imageAssets.length; index += 100) {
  let transaction = client.transaction();
  for (const asset of imageAssets.slice(index, index + 100)) {
    transaction = transaction.delete(asset._id);
  }
  await transaction.commit({ visibility: "sync" });
}

const remainingAssets = await client.fetch(
  `count(*[_type == "sanity.imageAsset"])`,
  {},
  { perspective: "raw" },
);
if (remainingAssets !== 0) {
  throw new Error(`${remainingAssets} image assets remain after deletion`);
}

console.log(
  `Removed ${removedImageValues} image values and deleted ${imageAssets.length} image assets.`,
);
