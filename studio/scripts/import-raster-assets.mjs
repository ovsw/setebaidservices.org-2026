import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const RASTER_API_VERSION = "2026-05-20";
const RASTER_LIBRARY_ID = "old";
const PAGE_SIZE = 50;
const APPLY = process.argv.includes("--apply");
const AUDIT = process.argv.includes("--audit");

if (APPLY && AUDIT) {
  throw new Error("Choose either --apply or --audit");
}

const envPath = fileURLToPath(new URL("../.env.local", import.meta.url));
const snapshotPath = fileURLToPath(
  new URL("../backups/raster-old-inventory.json", import.meta.url),
);

process.loadEnvFile(envPath);

const requiredEnvironment = [
  "SANITY_STUDIO_PROJECT_ID",
  "SANITY_STUDIO_DATASET",
  "SANITY_AUTH_TOKEN",
  "RASTER_API_KEY",
  "RASTER_ORG_ID",
];

for (const name of requiredEnvironment) {
  if (!process.env[name]?.trim()) {
    throw new Error(`Missing ${name} in ${envPath}`);
  }
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID.trim();
const dataset = process.env.SANITY_STUDIO_DATASET.trim();
const sanityToken = process.env.SANITY_AUTH_TOKEN.trim();
const rasterApiKey = process.env.RASTER_API_KEY.trim();
const rasterOrgId = process.env.RASTER_ORG_ID.trim();

if (projectId !== "bf76qlx9" || dataset !== "production") {
  throw new Error(
    `Refusing to run against ${projectId}/${dataset}; expected bf76qlx9/production`,
  );
}

const sanityClient = createClient({
  apiVersion: "2026-03-23",
  dataset,
  projectId,
  token: sanityToken,
  useCdn: false,
});

function rasterHeaders() {
  return {
    Authorization: `Bearer ${rasterApiKey}`,
    "Api-Version": RASTER_API_VERSION,
  };
}

async function fetchRasterJson(path) {
  const response = await fetch(`https://api.raster.app${path}`, {
    headers: rasterHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Raster ${response.status}: ${body}`);
  }

  return response.json();
}

async function listRasterAssets() {
  const assets = [];

  for (let page = 1; ; page += 1) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    const response = await fetchRasterJson(
      `/organizations/${encodeURIComponent(rasterOrgId)}/libraries/${RASTER_LIBRARY_ID}/assets?${params}`,
    );
    const pageAssets = Array.isArray(response.data) ? response.data : [];
    assets.push(...pageAssets);

    if (pageAssets.length < PAGE_SIZE) break;
  }

  return assets;
}

function normalizedTags(asset) {
  return [
    ...new Set(
      (Array.isArray(asset.tags) ? asset.tags : [])
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function sourceFilename(asset) {
  const name = typeof asset.name === "string" ? asset.name.trim() : "";
  if (name) return name;

  try {
    return decodeURIComponent(new URL(asset.url).pathname.split("/").at(-1) || "");
  } catch {
    return "";
  }
}

function tagDocumentId(tag) {
  return `media.tag.raster-${createHash("sha1").update(tag).digest("hex")}`;
}

function tagReference(tag) {
  const digest = createHash("sha1").update(tag).digest("hex");
  return {
    _key: digest.slice(0, 16),
    _ref: tagDocumentId(tag),
    _type: "reference",
    _weak: true,
  };
}

function migrationInventory(assets) {
  return assets.map((asset) => ({
    contentType: asset.contentType ?? null,
    filename: sourceFilename(asset),
    id: asset.id ?? null,
    tags: normalizedTags(asset),
    url: asset.url ?? null,
  }));
}

function summarize(inventory) {
  const images = inventory.filter(
    (asset) =>
      asset.contentType?.startsWith("image/") && asset.filename && asset.url,
  );
  const uniqueTags = new Set(images.flatMap((asset) => asset.tags));
  const invalidAssets = inventory.filter(
    (asset) =>
      !asset.contentType?.startsWith("image/") || !asset.filename || !asset.url,
  );

  return {
    images,
    invalidAssets,
    uniqueTags,
  };
}

async function createTags(tags) {
  const sortedTags = [...tags].sort((left, right) => left.localeCompare(right));

  for (let index = 0; index < sortedTags.length; index += 50) {
    const transaction = sortedTags
      .slice(index, index + 50)
      .reduce(
        (current, tag) =>
          current.createIfNotExists({
            _id: tagDocumentId(tag),
            _type: "media.tag",
            name: { _type: "slug", current: tag },
          }),
        sanityClient.transaction(),
      );

    await transaction.commit({ visibility: "sync" });
  }
}

async function importImage(asset) {
  const response = await fetch(asset.url);
  if (!response.ok) {
    throw new Error(`Image download failed with ${response.status}`);
  }

  const file = Buffer.from(await response.arrayBuffer());
  const uploaded = await sanityClient.assets.upload("image", file, {
    filename: asset.filename,
  });

  const references = asset.tags.map(tagReference);
  if (references.length) {
    await sanityClient
      .patch(uploaded._id)
      .setIfMissing({ opt: {} })
      .setIfMissing({ "opt.media": {} })
      .set({ "opt.media.tags": references })
      .commit({ visibility: "sync" });
  }

  return uploaded._id;
}

function comparableAsset(asset) {
  return JSON.stringify([
    asset.filename,
    [...asset.tags].sort((left, right) => left.localeCompare(right)),
  ]);
}

function countValues(values) {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map());
}

function missingValues(expected, actual) {
  const remaining = countValues(actual);
  return expected.filter((value) => {
    const count = remaining.get(value) ?? 0;
    if (count === 0) return true;
    remaining.set(value, count - 1);
    return false;
  });
}

async function auditImport(expectedImages, expectedTags) {
  const actualImages = await sanityClient.fetch(`
    *[_type == "sanity.imageAsset"]{
      "filename": originalFilename,
      "tags": coalesce(opt.media.tags[]->name.current, [])
    }
  `);
  const actualTags = await sanityClient.fetch(
    '*[_type == "media.tag"].name.current',
  );
  const brokenTagReferences = await sanityClient.fetch(
    'count(*[_type == "sanity.imageAsset" && count(opt.media.tags[!defined(@->._id)]) > 0])',
  );

  const expectedComparable = expectedImages.map(comparableAsset);
  const actualComparable = actualImages.map(comparableAsset);
  const missingAssets = missingValues(expectedComparable, actualComparable);
  const unexpectedAssets = missingValues(actualComparable, expectedComparable);
  const missingTags = missingValues([...expectedTags], actualTags);
  const unexpectedTags = missingValues(actualTags, [...expectedTags]);

  console.log(`Sanity images: ${actualImages.length}`);
  console.log(`Sanity tags: ${actualTags.length}`);
  console.log(`Missing or mismatched assets: ${missingAssets.length}`);
  console.log(`Unexpected assets: ${unexpectedAssets.length}`);
  console.log(`Missing tags: ${missingTags.length}`);
  console.log(`Unexpected tags: ${unexpectedTags.length}`);
  console.log(`Broken tag references: ${brokenTagReferences}`);

  if (
    missingAssets.length ||
    unexpectedAssets.length ||
    missingTags.length ||
    unexpectedTags.length ||
    brokenTagReferences
  ) {
    process.exitCode = 1;
  }
}

const rasterAssets = await listRasterAssets();
const inventory = migrationInventory(rasterAssets);
const { images, invalidAssets, uniqueTags } = summarize(inventory);

await mkdir(fileURLToPath(new URL("../backups", import.meta.url)), {
  recursive: true,
});
await writeFile(snapshotPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

console.log(`Mode: ${AUDIT ? "audit" : APPLY ? "apply" : "dry-run"}`);
console.log(`Raster library: ${RASTER_LIBRARY_ID}`);
console.log(`Assets returned: ${inventory.length}`);
console.log(`Images ready: ${images.length}`);
console.log(`Unique tags: ${uniqueTags.size}`);
console.log(`Skipped invalid/non-image assets: ${invalidAssets.length}`);
console.log(`Inventory: ${snapshotPath}`);

if (AUDIT) {
  await auditImport(images, uniqueTags);
  process.exit(process.exitCode ?? 0);
}

if (!APPLY) process.exit(0);

const existingImageCount = await sanityClient.fetch(
  'count(*[_type == "sanity.imageAsset"])',
);
if (existingImageCount !== 0) {
  throw new Error(
    `Refusing to import because Sanity contains ${existingImageCount} image assets`,
  );
}

await createTags(uniqueTags);

const failures = [];
let completed = 0;
let nextIndex = 0;

async function importWorker() {
  while (nextIndex < images.length) {
    const index = nextIndex;
    nextIndex += 1;
    const asset = images[index];

    try {
      await importImage(asset);
    } catch (error) {
      failures.push({
        filename: asset.filename,
        message: error instanceof Error ? error.message : String(error),
      });
      console.error(`[${index + 1}/${images.length}] FAILED ${asset.filename}`);
    }

    completed += 1;
    if (completed % 25 === 0 || completed === images.length) {
      console.log(`Processed: ${completed}/${images.length}`);
    }
  }
}

await Promise.all(Array.from({ length: 3 }, () => importWorker()));

console.log(`Imported: ${images.length - failures.length}`);
console.log(`Failed: ${failures.length}`);

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
