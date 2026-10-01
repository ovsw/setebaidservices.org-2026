#!/usr/bin/env node
// Migrate closing ctaBanner blocks to directorCta sections.
//
// What this changes in each targeted block:
//   1. _type: "ctaBanner" → "directorCta"
//   2. title: plain string → minimalRichText (one Portable Text block)
//   3. image: adds the director portrait
//   4. variant: removed (directorCta has no variant field)
//
// Dry run (default):  pnpm sanity:migrate-cta-to-director-cta
// Apply:              pnpm sanity:migrate-cta-to-director-cta --apply

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
  "../backups/cta-to-director-cta.json",
);

/** Portrait shared by every directorCta section. */
const DIRECTOR_IMAGE = {
  _type: "image",
  alt: "Justin Gerson, Camp Director, smiling in a Canadian Adventure Camp polo",
  asset: {
    _ref: "image-b957be2c9885867da14350e4d59dca7c5b830463-911x771-png",
    _type: "reference",
  },
};

/**
 * The blocks to convert, keyed by document _id.
 * Only blocks at the end or second-to-last position qualify.
 */
const TARGETS = [
  { _id: "activities", _key: "activities-handoff" },
  { _id: "drafts.accomodationFacilities", _key: "facilities-closing" },
  { _id: "drafts.generalProgram", _key: "closing" },
  { _id: "drafts.healthSafety", _key: "health-safety-cta" },
  { _id: "drafts.internationalCampersTravel", _key: "airportTalkToDirectors" },
  { _id: "drafts.specialtyPrograms", _key: "closing" },
  { _id: "uniqueLocation", _key: "islandTalkToDirectors" },
];

/** Deterministic key from the document and block context. */
const createKey = (documentId, sectionKey, suffix) =>
  Buffer.from(`${documentId}:${sectionKey}:${suffix}`)
    .toString("base64url")
    .slice(0, 24);

/** Convert a plain string title to a single minimalRichText block. */
const stringToPortableText = (text, documentId, sectionKey) => [
  {
    _key: createKey(documentId, sectionKey, "block"),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: createKey(documentId, sectionKey, "span"),
        _type: "span",
        marks: [],
        text,
      },
    ],
  },
];

/** Extract plain text from a Portable Text array. */
const portableTextToPlain = (blocks) =>
  blocks
    .map((block) =>
      (block.children ?? []).map((child) => child.text ?? "").join(""),
    )
    .join("\n");

/** Build the migration plan for one document + block. */
function createPlan(document, targetKey) {
  const block = (document.blocks ?? []).find(
    (b) => b?._key === targetKey && b?._type === "ctaBanner",
  );
  if (!block) return null;

  if (typeof block.title !== "string" || !block.title.trim()) {
    throw new Error(`${document._id}/${targetKey}: title is not a non-empty string`);
  }

  return {
    _id: document._id,
    _rev: document._rev,
    _key: targetKey,
    originalTitle: block.title,
    originalVariant: block.variant ?? null,
    title: stringToPortableText(block.title, document._id, targetKey),
    path: `blocks[_key=="${targetKey}"]`,
  };
}

const backupPathFromArgs = () => {
  const argument = process.argv.find((value) => value.startsWith("--backup="));
  return argument ? resolve(argument.slice("--backup=".length)) : defaultBackupPath;
};

const assertBackupMatchesPlans = (backup, plans, projectId, dataset) => {
  if (backup.projectId !== projectId || backup.dataset !== dataset) {
    throw new Error("Backup target does not match the configured Sanity dataset");
  }

  const expected = plans.map(({ _id, _rev, _key, originalTitle, originalVariant }) => ({
    _id,
    _rev,
    _key,
    title: originalTitle,
    variant: originalVariant,
  }));
  if (!isDeepStrictEqual(backup.documents, expected)) {
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
    const plan = createPlan(doc, target._key);
    if (!plan) {
      console.warn(`⚠ Block ${target._key} not found in ${target._id} — skipping`);
      return [];
    }
    return [plan];
  });

  const summary = {
    mode: apply ? "apply" : "dry-run",
    projectId,
    dataset,
    blocks: plans.length,
    targets: plans.map(({ _id, _key }) => `${_id} → ${_key}`),
    backupPath,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (plans.length === 0) return;

  if (!apply) {
    const backup = {
      projectId,
      dataset,
      createdAt: new Date().toISOString(),
      documents: plans.map(({ _id, _rev, _key, originalTitle, originalVariant }) => ({
        _id,
        _rev,
        _key,
        title: originalTitle,
        variant: originalVariant,
      })),
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
        [`${plan.path}._type`]: "directorCta",
        [`${plan.path}.title`]: plan.title,
        [`${plan.path}.image`]: DIRECTOR_IMAGE,
      })
      .unset([`${plan.path}.variant`])
      .commit({ visibility: "sync" });

    console.log(`✔ ${plan._id} / ${plan._key}`);
  }

  // --- Verify ---
  const migrated = await client.fetch(
    `*[_id in $ids] | order(_id asc) { _id, blocks }`,
    { ids: plans.map(({ _id }) => _id) },
    { perspective: "raw" },
  );
  const migratedById = new Map(migrated.map((d) => [d._id, d]));

  for (const plan of plans) {
    const doc = migratedById.get(plan._id);
    if (!doc) throw new Error(`${plan._id}: missing after migration`);

    const block = doc.blocks?.find(
      (b) => b?._key === plan._key && b?._type === "directorCta",
    );
    if (!block) {
      throw new Error(`${plan._id}/${plan._key}: block not found or _type not changed`);
    }
    if (!Array.isArray(block.title)) {
      throw new Error(`${plan._id}/${plan._key}: title is not rich text`);
    }
    if (portableTextToPlain(block.title) !== plan.originalTitle) {
      throw new Error(`${plan._id}/${plan._key}: title text changed`);
    }
    if (!block.image?.asset?._ref) {
      throw new Error(`${plan._id}/${plan._key}: image not set`);
    }
    if (block.variant !== undefined) {
      throw new Error(`${plan._id}/${plan._key}: variant not removed`);
    }
  }

  console.log(`\nMigrated and verified ${plans.length} ctaBanner → directorCta block(s).`);
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
