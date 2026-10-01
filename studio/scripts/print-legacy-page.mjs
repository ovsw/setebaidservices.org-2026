#!/usr/bin/env node
// Print a page's legacy (old website) content as Markdown.
// Usage: pnpm --dir studio legacy:page <slug>
// The legacy content lives in page.migration.legacy.content.sections and is a
// starting point for the page rethink, never something to reproduce.

import process from "node:process";
import { getCliClient } from "sanity/cli";
import { normalizeSlug, sectionText, SLUG_FILTER } from "./lib/page-text.mjs";

const slug = normalizeSlug(process.argv[2]);
if (!slug) {
  console.error("Usage: pnpm --dir studio legacy:page <slug>");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2026-03-23" });

const page = await client.fetch(
  `*[_type == "page" && ${SLUG_FILTER} && !(_id in path("drafts.**"))][0]{
    _id, title, "slug": slug.current,
    "blocks": blocks[]._type,
    "legacy": migration.legacy.content.sections
  }`,
  { slug },
);

if (!page) {
  console.error(`No published page with slug "${slug}".`);
  process.exit(2);
}

console.log(`# ${page.title}  (/${page.slug})`);
console.log(`Document: ${page._id}`);
console.log(`Current blocks: ${page.blocks?.length ? page.blocks.join(", ") : "none"}`);

for (const section of page.legacy ?? []) {
  console.log(`\n## [${section._type}]\n${sectionText(section)}`);
}
if (!page.legacy?.length) console.log("\n(no legacy sections)");
