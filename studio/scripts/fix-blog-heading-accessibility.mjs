#!/usr/bin/env node

import process from "node:process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const API_VERSION = "2026-03-23";

export const PROMOTE_HEADING_SLUGS = new Set([
  "camper-staff-ratio",
  "important-unplugging-children",
  "internet-island-week-1",
  "summer-camp-counselor",
  "summer-camp-crafts",
  "summer-camp-fun",
]);

export const EMPTY_HEADING_KEYS = new Map([
  ["5-tips-on-being-an-outstanding-summer-camp-counselor-1", "3d83077192d4"],
  ["what-and-how-to-pack-for-overnight-summer-camp", "99ed874ea5d5"],
]);

const TARGET_SLUGS = [...PROMOTE_HEADING_SLUGS, ...EMPTY_HEADING_KEYS.keys()];
const HEADING_STYLES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const blockText = (block) =>
  (block.children ?? []).map((child) => child.text ?? "").join("");

export function createBlogHeadingPlan(document) {
  const slug = document.slug?.current;
  if (!TARGET_SLUGS.includes(slug)) {
    throw new Error(`${document._id}: unexpected blog post slug ${slug}`);
  }
  if (!Array.isArray(document.body)) {
    throw new Error(`${document._id}: body is not Portable Text`);
  }

  if (PROMOTE_HEADING_SLUGS.has(slug)) {
    const headings = document.body.filter(
      (block) => block?._type === "block" && HEADING_STYLES.has(block.style),
    );
    if (headings.length === 0) {
      throw new Error(`${document._id}: expected body headings`);
    }
    if (headings.every((block) => block.style === "h2")) return null;
    if (!headings.every((block) => block.style === "h3")) {
      throw new Error(`${document._id}: expected only H3 headings before migration`);
    }

    return {
      _id: document._id,
      _rev: document._rev,
      slug,
      set: Object.fromEntries(
        headings.map((block) => [`body[_key=="${block._key}"].style`, "h2"]),
      ),
      unset: [],
    };
  }

  const emptyHeadingKey = EMPTY_HEADING_KEYS.get(slug);
  const emptyHeading = document.body.find((block) => block?._key === emptyHeadingKey);
  if (!emptyHeading) return null;
  if (
    emptyHeading._type !== "block" ||
    !HEADING_STYLES.has(emptyHeading.style) ||
    blockText(emptyHeading).trim()
  ) {
    throw new Error(`${document._id}: expected ${emptyHeadingKey} to be an empty heading`);
  }

  return {
    _id: document._id,
    _rev: document._rev,
    slug,
    set: {},
    unset: [`body[_key=="${emptyHeadingKey}"]`],
  };
}

function assertExactTargets(documents) {
  const slugs = documents.map((document) => document.slug?.current);
  const missing = TARGET_SLUGS.filter((slug) => !slugs.includes(slug));
  const duplicated = TARGET_SLUGS.filter(
    (slug) => slugs.filter((candidate) => candidate === slug).length !== 1,
  );
  const drafts = documents.filter(({ _id }) => _id.startsWith("drafts."));

  if (missing.length || duplicated.length || drafts.length) {
    throw new Error(
      `Target mismatch: missing=${missing.join(",") || "none"}; duplicated=${duplicated.join(",") || "none"}; drafts=${drafts.map(({ _id }) => _id).join(",") || "none"}`,
    );
  }
}

async function run() {
  const apply = process.argv.includes("--apply");
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();

  assertCacProductionTarget({ dataset, projectId });

  const documents = await fetchTargets(client);
  assertExactTargets(documents);
  const plans = documents.map(createBlogHeadingPlan).filter(Boolean);
  const summary = {
    mode: apply ? "apply" : "dry-run",
    projectId,
    dataset,
    documents: plans.length,
    promotedHeadings: plans.reduce(
      (total, plan) => total + Object.keys(plan.set).length,
      0,
    ),
    removedEmptyHeadings: plans.reduce(
      (total, plan) => total + plan.unset.length,
      0,
    ),
    slugs: plans.map(({ slug }) => slug),
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!apply || plans.length === 0) return;

  let transaction = client.transaction();
  for (const plan of plans) {
    let patch = client.patch(plan._id).ifRevisionId(plan._rev);
    if (Object.keys(plan.set).length) patch = patch.set(plan.set);
    if (plan.unset.length) patch = patch.unset(plan.unset);
    transaction = transaction.patch(patch);
  }
  await transaction.commit({ visibility: "sync" });

  const auditedDocuments = await fetchTargets(client);
  assertExactTargets(auditedDocuments);
  const pending = auditedDocuments.map(createBlogHeadingPlan).filter(Boolean);
  if (pending.length) {
    throw new Error(`Migration audit found ${pending.length} pending document(s)`);
  }

  console.log(`Migrated and audited ${plans.length} blog posts.`);
}

async function fetchTargets(client) {
  return client.fetch(
    `*[_type == "post" && slug.current in $slugs] | order(slug.current asc, _id asc) {
      _id,
      _rev,
      slug,
      body
    }`,
    { slugs: TARGET_SLUGS },
    { perspective: "raw" },
  );
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
