#!/usr/bin/env node
// One-off migration for the button rules: editors no longer pick a button
// style, and section buttons live in button lists.
//
// - Removes the stored style (`variant`) from every Button and Button Link,
//   and `buttonVariant` from every Link.
// - Feature Cards, tilted layout: each card's `link` and `secondaryLink`
//   become its `buttons` list. Grid cards keep `link`.
// - Pricing Tiers: each tier's `button` becomes its `buttons` list.
//
// Patches each document by its own ID, so drafts stay drafts and published
// documents stay published. Prints the plan; writes only with --apply.
// Usage: node --env-file=.env.local scripts/migrate-button-lists.mjs [--apply]

import { randomUUID } from "node:crypto";
import process from "node:process";
import { fileURLToPath } from "node:url";

const STYLED_TYPES = new Set(["button", "buttonLink"]);

function stripStyles(node) {
  if (Array.isArray(node)) return node.map(stripStyles);
  if (!node || typeof node !== "object") return node;
  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "buttonVariant") continue;
    if (key === "variant" && STYLED_TYPES.has(node._type)) continue;
    result[key] = stripStyles(value);
  }
  return result;
}

function toButton(link, makeKey) {
  if (!link || (link.text == null && link.url == null)) return null;
  const { text, url } = link;
  return {
    _key: makeKey(),
    _type: "button",
    ...(text != null ? { text } : {}),
    ...(url != null ? { url } : {}),
  };
}

function migrateFeatureCards(block, makeKey) {
  const tilted = block.layout === "tilted";
  return {
    ...block,
    groups: block.groups?.map((group) => ({
      ...group,
      cards: group.cards?.map((card) => {
        if (!("secondaryLink" in card) && !(tilted && "link" in card)) return card;
        const { link, secondaryLink, ...rest } = card;
        if (!tilted) return link === undefined ? rest : { ...rest, link };
        const buttons = [link, secondaryLink]
          .map((entry) => toButton(entry, makeKey))
          .filter(Boolean);
        return buttons.length ? { ...rest, buttons } : rest;
      }),
    })),
  };
}

function migratePricingTiers(block, makeKey) {
  return {
    ...block,
    tiers: block.tiers?.map((tier) => {
      if (!("button" in tier)) return tier;
      const { button, ...rest } = tier;
      if (!button) return rest;
      return { ...rest, buttons: [{ ...button, _key: makeKey(), _type: "button" }] };
    }),
  };
}

/** The page's `blocks` in the new shape. Running it twice changes nothing. */
export function migrateBlocks(blocks, makeKey = () => randomUUID().slice(0, 12)) {
  return blocks.map((block) => {
    const clean = stripStyles(block);
    if (clean._type === "featureCards") return migrateFeatureCards(clean, makeKey);
    if (clean._type === "pricingTiers") return migratePricingTiers(clean, makeKey);
    return clean;
  });
}

async function main() {
  const apply = process.argv.includes("--apply");
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: "2026-03-23" });
  const documents = await client.fetch(
    `*[defined(blocks)]{_id, _rev, _type, blocks}`,
    {},
    { perspective: "raw" },
  );

  const changes = documents.flatMap((document) => {
    const blocks = migrateBlocks(document.blocks);
    return JSON.stringify(blocks) === JSON.stringify(document.blocks)
      ? []
      : [{ ...document, blocks }];
  });

  for (const change of changes) console.log(`${apply ? "patch" : "would patch"} ${change._id}`);
  console.log(`${changes.length} of ${documents.length} documents need the new shape.`);
  if (!apply || !changes.length) return;

  const transaction = client.transaction();
  for (const change of changes) {
    transaction.patch(change._id, (patch) =>
      patch.ifRevisionId(change._rev).set({ blocks: change.blocks }),
    );
  }
  const result = await transaction.commit();
  console.log(`Committed transaction ${result.transactionId}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
