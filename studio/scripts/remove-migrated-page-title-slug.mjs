#!/usr/bin/env node

import process from "node:process";
import { getCliClient } from "sanity/cli";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const APPLY = process.argv.includes("--apply");
const client = getCliClient({ apiVersion: "2026-03-23" });
const { dataset, projectId } = client.config();

assertCacProductionTarget({ dataset, projectId });

const pages = await client.fetch(`
  *[
    _type == "page" &&
    !(_id in path("drafts.**")) &&
    (
      defined(migration.legacy.content.title) ||
      defined(migration.legacy.content.slug)
    )
  ] | order(_id asc) {
    _id,
    _rev,
    title,
    slug,
    "legacyTitle": migration.legacy.content.title,
    "legacySlug": migration.legacy.content.slug
  }
`);

for (const page of pages) {
  if (page.legacyTitle !== page.title) {
    throw new Error(`${page._id}: legacy title does not match current title`);
  }
  if (page.legacySlug?.current !== page.slug?.current) {
    throw new Error(`${page._id}: legacy slug does not match current slug`);
  }
}

console.log(
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
      projectId,
      dataset,
      documents: pages.length,
      ids: pages.map(({ _id }) => _id),
    },
    null,
    2,
  ),
);

if (!APPLY || pages.length === 0) process.exit(0);

let transaction = client.transaction();
for (const page of pages) {
  transaction = transaction.patch(
    client
      .patch(page._id)
      .ifRevisionId(page._rev)
      .unset([
        "migration.legacy.content.title",
        "migration.legacy.content.slug",
      ]),
  );
}

await transaction.commit({ visibility: "sync" });
console.log(`Cleaned ${pages.length} pages.`);
