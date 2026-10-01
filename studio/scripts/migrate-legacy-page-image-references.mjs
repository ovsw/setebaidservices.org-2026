#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";

const API_VERSION = "2026-03-23";
const EXPECTED_DATASET = "production";
const EXPECTED_PROJECT_ID = "bf76qlx9";
const IMAGE_ASSET_ID = /^image-([a-f0-9]{40})-/;
const IMAGE_POINTER =
  /^image@file:\/\/\.\/images\/([a-f0-9]{40})-(\d+x\d+)\.([a-z0-9]+)$/;

export function normalizeAssetFilename(filename) {
  return filename
    .normalize("NFC")
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .trim()
    .toLocaleLowerCase("en-US");
}

function groupBy(values, getKey) {
  return values.reduce((groups, value) => {
    const key = getKey(value);
    const group = groups.get(key) ?? [];
    group.push(value);
    groups.set(key, group);
    return groups;
  }, new Map());
}

export function createAssetResolver(sourceAssetMetadata, currentAssets) {
  const sourceImages = Object.entries(sourceAssetMetadata)
    .filter(([id]) => id.startsWith("image-"))
    .map(([id, metadata]) => ({
      id,
      hash: id.slice("image-".length),
      originalFilename: metadata.originalFilename,
    }));

  for (const asset of sourceImages) {
    if (!asset.originalFilename) {
      throw new Error(`${asset.id}: source asset has no original filename`);
    }
  }
  for (const asset of currentAssets) {
    if (!asset.originalFilename || !asset.sha1hash) {
      throw new Error(`${asset._id}: current asset metadata is incomplete`);
    }
  }

  const sourceByHash = new Map(sourceImages.map((asset) => [asset.hash, asset]));
  const sourceByFilename = groupBy(sourceImages, (asset) =>
    normalizeAssetFilename(asset.originalFilename),
  );
  const currentById = new Map(currentAssets.map((asset) => [asset._id, asset]));
  const currentByHash = groupBy(currentAssets, (asset) => asset.sha1hash);
  const currentByFilename = groupBy(currentAssets, (asset) =>
    normalizeAssetFilename(asset.originalFilename),
  );

  function resolveReference(referenceId) {
    const currentAsset = currentById.get(referenceId);
    if (currentAsset) {
      return {
        assetId: currentAsset._id,
        method: sourceByHash.has(currentAsset.sha1hash)
          ? "exact-hash"
          : "already-current",
        sourceHash: sourceByHash.has(currentAsset.sha1hash)
          ? currentAsset.sha1hash
          : undefined,
      };
    }

    const sourceHash = referenceId.match(IMAGE_ASSET_ID)?.[1];
    if (!sourceHash) {
      throw new Error(`Unsupported image reference: ${referenceId}`);
    }

    const sourceAsset = sourceByHash.get(sourceHash);
    if (!sourceAsset) {
      throw new Error(`No source metadata for ${referenceId}`);
    }

    const hashMatches = currentByHash.get(sourceHash) ?? [];
    if (hashMatches.length === 1) {
      return {
        assetId: hashMatches[0]._id,
        method: "exact-hash",
        sourceHash,
      };
    }

    const filename = normalizeAssetFilename(sourceAsset.originalFilename);
    const sourceFilenameMatches = sourceByFilename.get(filename) ?? [];
    const currentFilenameMatches = currentByFilename.get(filename) ?? [];

    if (
      sourceFilenameMatches.length === 1 &&
      currentFilenameMatches.length === 1
    ) {
      return {
        assetId: currentFilenameMatches[0]._id,
        method: "unique-filename",
        sourceHash,
      };
    }

    throw new Error(
      `${referenceId}: filename "${sourceAsset.originalFilename}" has ` +
        `${sourceFilenameMatches.length} source and ` +
        `${currentFilenameMatches.length} current matches`,
    );
  }

  return {
    currentAssetIds: new Set(currentAssets.map((asset) => asset._id)),
    resolveReference,
    sourceImages,
  };
}

export function transformImageReferences(value, resolveReference) {
  const matches = new Map();
  let imageReferences = 0;
  let referencesChanged = 0;

  function transform(current) {
    if (Array.isArray(current)) return current.map(transform);
    if (!current || typeof current !== "object") return current;

    if (
      current._type === "reference" &&
      typeof current._ref === "string" &&
      current._ref.startsWith("image-")
    ) {
      imageReferences += 1;
      const resolved = resolveReference(current._ref);
      const { _weak, ...reference } = current;
      const next = { ...reference, _ref: resolved.assetId };

      if (!isDeepStrictEqual(current, next)) referencesChanged += 1;
      if (resolved.sourceHash) matches.set(resolved.sourceHash, resolved.method);
      return next;
    }

    return Object.fromEntries(
      Object.entries(current).map(([field, fieldValue]) => [
        field,
        transform(fieldValue),
      ]),
    );
  }

  const transformedValue = transform(value);

  return {
    imageReferences,
    matches,
    referencesChanged,
    value: transformedValue,
  };
}

function countSourceImagePointers(value) {
  const hashes = new Set();
  let imagePointers = 0;

  function visit(current) {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (!current || typeof current !== "object") return;

    if (
      typeof current._sanityAsset === "string" &&
      current._sanityAsset.startsWith("image@")
    ) {
      const match = current._sanityAsset.match(IMAGE_POINTER);
      if (!match) {
        throw new Error(`Unsupported image pointer: ${current._sanityAsset}`);
      }
      imagePointers += 1;
      hashes.add(match[1]);
    }

    Object.values(current).forEach(visit);
  }

  visit(value);
  return { hashes, imagePointers };
}

function auditImageReferences(value, currentAssetIds) {
  let imageReferences = 0;
  let missingTargets = 0;
  let weakReferences = 0;

  function visit(current) {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (!current || typeof current !== "object") return;

    if (
      current._type === "reference" &&
      typeof current._ref === "string" &&
      current._ref.startsWith("image-")
    ) {
      imageReferences += 1;
      if (current._weak === true) weakReferences += 1;
      if (!currentAssetIds.has(current._ref)) missingTargets += 1;
    }

    Object.values(current).forEach(visit);
  }

  visit(value);
  return { imageReferences, missingTargets, weakReferences };
}

function archiveEntry(archivePath, suffix) {
  const entries = execFileSync("tar", ["-tzf", archivePath], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
  const matches = entries.filter((entry) => entry.endsWith(suffix));
  if (matches.length !== 1) {
    throw new Error(
      `${archivePath}: expected one ${suffix} entry, found ${matches.length}`,
    );
  }
  return matches[0];
}

function readArchiveEntry(archivePath, entry) {
  return execFileSync("tar", ["-xOzf", archivePath, entry], {
    encoding: "utf8",
    maxBuffer: 100 * 1024 * 1024,
  });
}

function pageOutsideMigration(page) {
  const { _rev, _updatedAt, migration, ...outsideMigration } = page;
  return outsideMigration;
}

function countMethods(matches) {
  return Object.fromEntries(
    [...matches.values()]
      .reduce((counts, method) => {
        counts.set(method, (counts.get(method) ?? 0) + 1);
        return counts;
      }, new Map())
      .entries(),
  );
}

async function run() {
  const apply = process.argv.includes("--apply");
  const sourceArgument = process.argv.find((argument) =>
    argument.startsWith("--source="),
  );

  if (!sourceArgument) {
    throw new Error("Pass the legacy Sanity export as --source=/absolute/path");
  }

  process.loadEnvFile(
    fileURLToPath(new URL("../.env.local", import.meta.url)),
  );
  const sourcePath = resolve(sourceArgument.slice("--source=".length));
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();

  if (projectId !== EXPECTED_PROJECT_ID || dataset !== EXPECTED_DATASET) {
    throw new Error(
      `Refusing to run against ${projectId}/${dataset}; expected ` +
        `${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}`,
    );
  }

  const assetsEntry = archiveEntry(sourcePath, "/assets.json");
  const dataEntry = archiveEntry(sourcePath, "/data.ndjson");
  const sourceAssetMetadata = JSON.parse(
    readArchiveEntry(sourcePath, assetsEntry),
  );
  const sourceDocuments = readArchiveEntry(sourcePath, dataEntry)
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const sourcePages = sourceDocuments.filter(
    (document) =>
      document._type === "page" && !document._id.startsWith("drafts."),
  );

  const currentPages = await client.fetch(
    `*[
      _type == "page" &&
      !(_id in path("drafts.**")) &&
      !(_id in path("versions.**"))
    ] | order(_id asc)`,
    {},
    { perspective: "raw" },
  );
  const currentAssets = await client.fetch(
    `*[_type == "sanity.imageAsset"]{
      _id,
      originalFilename,
      sha1hash
    }`,
    {},
    { perspective: "raw" },
  );

  if (sourcePages.length !== 46 || currentPages.length !== 46) {
    throw new Error(
      `Expected 46 source and current pages, found ` +
        `${sourcePages.length} and ${currentPages.length}`,
    );
  }

  const sourceIds = sourcePages.map((page) => page._id).sort();
  const currentIds = currentPages.map((page) => page._id).sort();
  if (!isDeepStrictEqual(sourceIds, currentIds)) {
    throw new Error("Source and current page IDs differ");
  }

  const sourcePointerAudit = sourcePages.reduce(
    (audit, page) => {
      const pageAudit = countSourceImagePointers(page.migration);
      audit.imagePointers += pageAudit.imagePointers;
      pageAudit.hashes.forEach((hash) => audit.hashes.add(hash));
      return audit;
    },
    { hashes: new Set(), imagePointers: 0 },
  );
  const resolver = createAssetResolver(sourceAssetMetadata, currentAssets);
  const plans = currentPages.map((page) => {
    const transformed = transformImageReferences(
      page.migration,
      resolver.resolveReference,
    );
    return {
      _id: page._id,
      _rev: page._rev,
      fieldsBefore: pageOutsideMigration(page),
      migration: transformed.value,
      transformed,
    };
  });
  const imageReferences = plans.reduce(
    (total, plan) => total + plan.transformed.imageReferences,
    0,
  );
  const referencesChanged = plans.reduce(
    (total, plan) => total + plan.transformed.referencesChanged,
    0,
  );
  const changedPlans = plans.filter(
    (plan) => plan.transformed.referencesChanged > 0,
  );
  const matches = new Map(
    plans.flatMap((plan) => [...plan.transformed.matches]),
  );

  if (sourcePointerAudit.imagePointers !== imageReferences) {
    throw new Error(
      `Source has ${sourcePointerAudit.imagePointers} image placements, ` +
        `current pages have ${imageReferences}`,
    );
  }

  const preflight = await client.fetch(
    `{
      "imageAssets": count(*[_type == "sanity.imageAsset"]),
      "mediaTags": count(*[_type == "media.tag"]),
      "brokenMediaTagReferences": count(*[
        _type == "sanity.imageAsset" &&
        count(opt.media.tags[!defined(@->._id)]) > 0
      ])
    }`,
    {},
    { perspective: "raw" },
  );

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        projectId,
        dataset,
        source: sourcePath,
        pages: plans.length,
        changedPages: changedPlans.length,
        imageReferences,
        referencesChanged,
        distinctSourceImages: sourcePointerAudit.hashes.size,
        matchedDistinctImages: countMethods(matches),
        sourceImageAssets: resolver.sourceImages.length,
        currentImageAssets: currentAssets.length,
        mediaTags: preflight.mediaTags,
        brokenMediaTagReferences: preflight.brokenMediaTagReferences,
      },
      null,
      2,
    ),
  );

  if (preflight.brokenMediaTagReferences !== 0) {
    throw new Error(
      `Found ${preflight.brokenMediaTagReferences} assets with broken tag references`,
    );
  }
  if (!apply || changedPlans.length === 0) return;

  for (let index = 0; index < changedPlans.length; index += 10) {
    let transaction = client.transaction();
    for (const plan of changedPlans.slice(index, index + 10)) {
      transaction = transaction.patch(
        client
          .patch(plan._id)
          .ifRevisionId(plan._rev)
          .set({ migration: plan.migration }),
      );
    }
    await transaction.commit({ visibility: "sync" });
  }

  const finalPages = await client.fetch(
    `*[
      _type == "page" &&
      !(_id in path("drafts.**")) &&
      !(_id in path("versions.**"))
    ] | order(_id asc)`,
    {},
    { perspective: "raw" },
  );
  const finalById = new Map(finalPages.map((page) => [page._id, page]));
  const finalAudit = { imageReferences: 0, missingTargets: 0, weakReferences: 0 };

  for (const plan of plans) {
    const finalPage = finalById.get(plan._id);
    if (!finalPage) throw new Error(`${plan._id}: missing after migration`);
    if (!isDeepStrictEqual(finalPage.migration, plan.migration)) {
      throw new Error(`${plan._id}: migrated image references differ from plan`);
    }
    if (!isDeepStrictEqual(pageOutsideMigration(finalPage), plan.fieldsBefore)) {
      throw new Error(`${plan._id}: a field outside migration changed`);
    }

    const pageAudit = auditImageReferences(
      finalPage.migration,
      resolver.currentAssetIds,
    );
    finalAudit.imageReferences += pageAudit.imageReferences;
    finalAudit.missingTargets += pageAudit.missingTargets;
    finalAudit.weakReferences += pageAudit.weakReferences;
  }

  const finalDatasetAudit = await client.fetch(
    `{
      "imageAssets": count(*[_type == "sanity.imageAsset"]),
      "mediaTags": count(*[_type == "media.tag"]),
      "brokenMediaTagReferences": count(*[
        _type == "sanity.imageAsset" &&
        count(opt.media.tags[!defined(@->._id)]) > 0
      ])
    }`,
    {},
    { perspective: "raw" },
  );

  if (
    finalAudit.imageReferences !== sourcePointerAudit.imagePointers ||
    finalAudit.missingTargets !== 0 ||
    finalAudit.weakReferences !== 0
  ) {
    throw new Error(`Final image reference audit failed: ${JSON.stringify(finalAudit)}`);
  }
  if (!isDeepStrictEqual(finalDatasetAudit, preflight)) {
    throw new Error("Image asset or media tag counts changed during migration");
  }

  console.log(
    `Migrated ${referencesChanged} image references across ` +
      `${changedPlans.length} pages; all ${finalAudit.imageReferences} ` +
      `references resolve to tagged Sanity assets.`,
  );
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
