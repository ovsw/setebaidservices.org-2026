#!/usr/bin/env node
// One-off migration for spec #138: flag the published "Final" documents from
// the 2026-11-06 audit as Hidden, so the public Website treats them as missing
// until the client accepts them.
//
// The list is fixed here, not read from Basecamp:
// - the pages listed in HIDDEN_PAGE_PATHS;
// - every story (`post`), every category, and the stories index (`blogIndex`).
//
// Sets `hidden: true` on the published document and on its draft when one
// exists. Never publishes or unpublishes. Prints the plan; writes only with
// --apply. Running it again changes nothing.
// Usage: node --env-file=.env.local scripts/hide-final-documents.mjs [--apply]

import process from "node:process";
import { fileURLToPath } from "node:url";
import { assertSetebaidProductionTarget } from "./assert-setebaid-production-target.mjs";

/** Page paths from the audit, as the spec lists them. */
export const HIDDEN_PAGE_PATHS = [
  "/donate/campaigns",
  "/donate/campaigns/year-end",
  "/donate/impact",
  "/donate/memorial",
  "/get-involved",
];

/** Document types hidden in full. */
export const HIDDEN_DOCUMENT_TYPES = ["post", "category", "blogIndex"];

export const CANDIDATES_QUERY = `*[_type in ["page", "post", "category", "blogIndex"]]{
  _id, _rev, _type, "slug": slug.current, hidden
}`;

const DRAFT_PREFIX = "drafts.";

function publishedId(id) {
  return id.startsWith(DRAFT_PREFIX) ? id.slice(DRAFT_PREFIX.length) : id;
}

/** Published documents and drafts only; release versions are left alone. */
function isPublishedOrDraft(id) {
  return !id.startsWith("versions.");
}

function isListed(document) {
  if (HIDDEN_DOCUMENT_TYPES.includes(document._type)) return true;
  return document._type === "page" && HIDDEN_PAGE_PATHS.includes(`/${document.slug}`);
}

/**
 * The document versions to flag Hidden, from the raw candidates. A document
 * is listed when any of its versions matches, so the published document and
 * its draft are flagged together. Versions already hidden are skipped.
 */
export function planHiddenPatches(documents) {
  const versions = documents.filter((document) => isPublishedOrDraft(document._id));
  const listedIds = new Set(
    versions.filter(isListed).map((document) => publishedId(document._id)),
  );
  return versions
    .filter((document) => listedIds.has(publishedId(document._id)))
    .filter((document) => document.hidden !== true)
    .map(({ _id, _rev, _type }) => ({ _id, _rev, _type }));
}

/** Listed page paths that matched no document. */
export function missingPagePaths(documents) {
  const found = new Set(
    documents.filter((document) => document._type === "page").map((document) => `/${document.slug}`),
  );
  return HIDDEN_PAGE_PATHS.filter((path) => !found.has(path));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: "2026-03-23" });
  const { dataset, projectId } = client.config();
  assertSetebaidProductionTarget({ dataset, projectId });
  console.log(`Target: ${projectId}/${dataset}`);

  const documents = await client.fetch(CANDIDATES_QUERY, {}, { perspective: "raw" });
  for (const path of missingPagePaths(documents)) {
    console.log(`warning: no page found for ${path}`);
  }

  const patches = planHiddenPatches(documents);
  for (const patch of patches) {
    console.log(`${apply ? "hide" : "would hide"} ${patch._type} ${patch._id}`);
  }
  console.log(`${patches.length} document versions to flag Hidden.`);
  if (!apply || !patches.length) return;

  const transaction = client.transaction();
  for (const patch of patches) {
    transaction.patch(patch._id, (builder) =>
      builder.ifRevisionId(patch._rev).set({ hidden: true }),
    );
  }
  const result = await transaction.commit();
  console.log(`Committed transaction ${result.transactionId}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
