#!/usr/bin/env node

import process from "node:process";
import { getCliClient } from "sanity/cli";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const APPLY = process.argv.includes("--apply");
const API_VERSION = "2026-03-23";
const client = getCliClient({ apiVersion: API_VERSION });
const { dataset, projectId } = client.config();

assertCacProductionTarget({ dataset, projectId });

const pages = await client.fetch(`
  *[
    _type == "page" &&
    !(_id in path("drafts.**")) &&
    defined(migration.legacy.content.seo)
  ] | order(_id asc) {
    _id,
    _rev,
    meta,
    "legacySeo": migration.legacy.content.seo
  }
`);

const plans = pages.map((page) => {
  const { description, title } = page.legacySeo;

  if (title !== undefined && typeof title !== "string") {
    throw new Error(`${page._id}: legacy SEO title is not a string`);
  }
  if (description !== undefined && typeof description !== "string") {
    throw new Error(`${page._id}: legacy SEO description is not a string`);
  }
  if (page.meta?.title !== undefined && page.meta.title !== title) {
    throw new Error(
      `${page._id}: meta.title already contains a different value`,
    );
  }
  if (
    page.meta?.description !== undefined &&
    page.meta.description !== description
  ) {
    throw new Error(
      `${page._id}: meta.description already contains a different value`,
    );
  }

  return {
    _id: page._id,
    _rev: page._rev,
    description,
    title,
  };
});

console.log(
  JSON.stringify(
    {
      mode: APPLY ? "apply" : "dry-run",
      projectId,
      dataset,
      documents: plans.length,
      descriptions: plans.filter(({ description }) => description !== undefined)
        .length,
      titles: plans.filter(({ title }) => title !== undefined).length,
      ids: plans.map(({ _id }) => _id),
    },
    null,
    2,
  ),
);

if (!APPLY || plans.length === 0) process.exit(0);

let transaction = client.transaction();

for (const plan of plans) {
  let patch = client
    .patch(plan._id)
    .ifRevisionId(plan._rev)
    .setIfMissing({ meta: {} });

  const values = {};
  if (plan.title !== undefined) values["meta.title"] = plan.title;
  if (plan.description !== undefined) {
    values["meta.description"] = plan.description;
  }
  if (Object.keys(values).length > 0) patch = patch.set(values);

  patch = patch.unset(["migration.legacy.content.seo"]);
  transaction = transaction.patch(patch);
}

await transaction.commit({ visibility: "sync" });
console.log(`Migrated ${plans.length} pages.`);
