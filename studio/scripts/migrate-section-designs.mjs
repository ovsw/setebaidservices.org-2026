#!/usr/bin/env node
// One-off migration for "one section, one design" (issue #112, ADR 0003).
//
// Six sections picked a second design with a `layout` field (`variant` on
// `ctaBanner`). Each extra design is now its own section type:
//
//   featureCards        tilted    -> tiltedFeatureCards
//   benefitCards        ringPhoto -> ringPhotoBenefits
//   stackedTimeline     dateCards -> dateCards
//   quoteWall           track     -> quoteTrack
//   imageCollageFeature bento     -> bentoCollage
//   ctaBanner           nudge     -> nudgeBanner
//   ctaBanner           photo     -> photoBanner
//
// Every block of the six types keeps or gets the fields its section has and
// loses the rest, including the stored `layout`/`variant` value. Dropped
// fields that still hold content are listed as leftovers.
//
// Patches each document by its own ID, so drafts stay drafts and published
// documents stay published; it never publishes. Prints the plan; writes only
// with --apply, and only with --backup <file> pointing at a raw export taken
// in the last 24 hours that passes `gzip -t`.
//
// Usage:
//   node --env-file=.env.local scripts/migrate-section-designs.mjs
//   node --env-file=.env.local scripts/migrate-section-designs.mjs --apply --backup <file>
// SANITY_STUDIO_DATASET picks the dataset.

import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DESIGN_FIELD = { ctaBanner: "variant" };
const TILTED_CARD_LIMIT = 6;
/** New sections whose background is fixed, so a missing stored one is fine. */
const FIXED_BACKGROUND = new Set(["photoBanner"]);

/** Old type and stored design value -> new section type. */
const SPLITS = {
  featureCards: { tilted: "tiltedFeatureCards" },
  benefitCards: { ringPhoto: "ringPhotoBenefits" },
  stackedTimeline: { dateCards: "dateCards" },
  quoteWall: { track: "quoteTrack" },
  imageCollageFeature: { bento: "bentoCollage" },
  ctaBanner: { nudge: "nudgeBanner", photo: "photoBanner" },
};

/**
 * The fields each section keeps. `items` lists array fields whose members
 * have their own fields; `type` renames the member's `_type`.
 */
const SHAPES = {
  featureCards: {
    fields: ["background", "eyebrow", "title", "description", "groups"],
    items: {
      groups: {
        fields: ["heading", "description", "cards"],
        items: { cards: { fields: ["image", "title", "text", "link"] } },
      },
    },
  },
  tiltedFeatureCards: {
    fields: ["background", "title", "link", "cards"],
    items: {
      cards: {
        type: "tiltedFeatureCard",
        fields: ["image", "badgeLabel", "badgeValue", "eyebrow", "title", "text", "buttons"],
      },
    },
  },
  benefitCards: {
    fields: ["background", "eyebrow", "title", "intro", "cards"],
    items: { cards: { fields: ["icon", "title", "body"] } },
  },
  ringPhotoBenefits: {
    fields: ["background", "image", "caption", "title", "points", "link"],
    items: { points: { type: "ringPhotoPoint", fields: ["title", "body"] } },
  },
  stackedTimeline: {
    fields: ["background", "eyebrow", "title", "intro", "buttons", "items"],
    items: { items: { fields: ["title", "meta", "text", "image"] } },
  },
  dateCards: {
    fields: ["background", "title", "link", "items"],
    items: { items: { type: "dateCard", fields: ["date", "title", "text", "link", "image"] } },
  },
  quoteWall: { fields: ["background", "eyebrow", "heading", "testimonials"] },
  quoteTrack: { fields: ["background", "hint", "heading", "testimonials"] },
  imageCollageFeature: {
    fields: ["background", "eyebrow", "title", "body", "points", "primaryImage", "secondaryImage", "cta"],
    images: { primaryImage: ["caption"], secondaryImage: ["caption"] },
  },
  bentoCollage: {
    fields: [
      "background",
      "eyebrow",
      "title",
      "body",
      "buttons",
      "primaryImage",
      "secondaryImage",
      "tertiaryImage",
    ],
  },
  ctaBanner: { fields: ["background", "title", "description", "buttons"] },
  nudgeBanner: { fields: ["background", "title", "description", "buttons"] },
  photoBanner: { fields: ["image", "eyebrow", "title", "description", "buttons"] },
};

/** Fields removed without a leftover report: the design value, and a row setting at its kept value. */
function isSilentDrop(key, value) {
  if (key === "layout" || key === "variant") return true;
  return key === "singleRowUpToFour" && value !== false;
}

function hasContent(value) {
  if (value == null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    return Object.entries(value).some(([key, entry]) => key !== "_type" && hasContent(entry));
  }
  return true;
}

/** A Button (`text` + `url`) as a Feature Card link, which has the same two fields. */
function buttonToCardLink(button) {
  if (!button) return undefined;
  const link = {};
  if (button.text != null) link.text = button.text;
  if (button.url != null) link.url = button.url;
  return Object.keys(link).length ? link : undefined;
}

/** A Button list member as a single Button field: no `_key`. */
function buttonToField(button) {
  if (!button) return undefined;
  const { _key, ...rest } = button;
  return { ...rest, _type: "button" };
}

/** Move fields the new section names differently, before trimming. */
function reshape(block, target) {
  if (target === "tiltedFeatureCards") {
    const { groups, ...rest } = block;
    const leftovers = [];
    const seen = new Set();
    const flat = (groups ?? []).flatMap((group) => {
      for (const key of ["heading", "description"]) {
        if (hasContent(group[key])) leftovers.push({ path: `groups[_key=="${group._key}"].${key}`, value: group[key] });
      }
      // Rows kept their own card keys; one flat list needs unique ones.
      return (group.cards ?? []).map((card) => {
        if (!card?._key || !seen.has(card._key)) {
          if (card?._key) seen.add(card._key);
          return card;
        }
        const _key = `${card._key}-${group._key}`;
        seen.add(_key);
        return { ...card, _key };
      });
    });
    // The new section holds at most six cards; report any beyond that.
    for (const card of flat.slice(TILTED_CARD_LIMIT)) {
      leftovers.push({ path: `cards[_key=="${card?._key}"]`, value: card });
    }
    const cards = flat.slice(0, TILTED_CARD_LIMIT);
    return { block: groups === undefined ? rest : { ...rest, cards }, leftovers };
  }
  if (target === "ringPhotoBenefits") {
    const { cards, ...rest } = block;
    return { block: cards === undefined ? rest : { ...rest, points: cards }, leftovers: [] };
  }
  if (target === "dateCards") {
    const { buttons, items, ...rest } = block;
    const leftovers = (buttons ?? [])
      .slice(1)
      .map((button) => ({ path: `buttons[_key=="${button._key}"]`, value: button }));
    const link = buttonToField(buttons?.[0]);
    const next = { ...rest, ...(link ? { link } : {}) };
    if (items !== undefined) {
      next.items = items.map((item) => {
        if (!item || !("meta" in item)) return item;
        const { meta, ...itemRest } = item;
        return meta === undefined ? itemRest : { ...itemRest, date: meta };
      });
    }
    return { block: next, leftovers };
  }
  if (target === "featureCards") {
    const leftovers = [];
    const groups = block.groups?.map((group) => ({
      ...group,
      cards: group.cards?.map((card) => {
        // A link draws only with both a text and a destination.
        if ((card.link?.text && card.link?.url) || !card.buttons?.length) return card;
        const [first, ...others] = card.buttons;
        const path = `groups[_key=="${group._key}"].cards[_key=="${card._key}"]`;
        for (const button of others) {
          leftovers.push({ path: `${path}.buttons[_key=="${button._key}"]`, value: button });
        }
        const { buttons, ...rest } = card;
        const link = buttonToCardLink(first);
        return link ? { ...rest, link } : rest;
      }),
    }));
    return { block: block.groups === undefined ? block : { ...block, groups }, leftovers };
  }
  return { block, leftovers: [] };
}

/** Keep the shape's fields on one object; report what else held content. */
function trim(node, shape, path, leftovers) {
  if (!node || typeof node !== "object") return node;
  const allowed = new Set(["_key", "_type", ...shape.fields]);
  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (allowed.has(key)) {
      result[key] = value;
    } else if (!isSilentDrop(key, value) && hasContent(value)) {
      leftovers.push({ path: path ? `${path}.${key}` : key, value });
    }
  }
  if (shape.type && "_type" in node) result._type = shape.type;
  for (const [field, itemShape] of Object.entries(shape.items ?? {})) {
    if (!Array.isArray(result[field])) continue;
    result[field] = result[field].map((item) =>
      trim(item, itemShape, `${path ? `${path}.` : ""}${field}[_key=="${item?._key}"]`, leftovers),
    );
  }
  for (const [field, dropped] of Object.entries(shape.images ?? {})) {
    const image = result[field];
    if (!image || typeof image !== "object") continue;
    const kept = { ...image };
    for (const key of dropped) {
      if (!(key in kept)) continue;
      if (hasContent(kept[key])) leftovers.push({ path: `${path ? `${path}.` : ""}${field}.${key}`, value: kept[key] });
      delete kept[key];
    }
    result[field] = kept;
  }
  return result;
}

/**
 * One block in its new shape. Returns `{ block, leftovers }`; `leftovers`
 * lists the dropped fields that held content, by path inside the block.
 * Blocks of other types come back unchanged. Running it twice changes nothing.
 */
export function migrateBlock(block) {
  if (!block || !(block._type in SPLITS)) return { block, leftovers: [], problems: [] };
  const designField = DESIGN_FIELD[block._type] ?? "layout";
  const target = SPLITS[block._type][block[designField]] ?? block._type;
  const reshaped = reshape(block, target);
  const leftovers = [...reshaped.leftovers];
  const migrated = trim({ ...reshaped.block, _type: target }, SHAPES[target], "", leftovers);
  // A block with no stored background got its colour from the old type's
  // legacy fallback, which the new type does not have: it would change colour.
  const problems =
    target !== block._type && !FIXED_BACKGROUND.has(target) && !hasContent(block.background)
      ? [`no stored background; moving it to ${target} would change its colour`]
      : [];
  return { block: migrated, leftovers, problems };
}

/** A document's `blocks` in the new shape, with the leftovers of every block. */
export function migrateBlocks(blocks) {
  const leftovers = [];
  const problems = [];
  const migrated = blocks.map((block) => {
    const result = migrateBlock(block);
    for (const leftover of result.leftovers) {
      leftovers.push({ ...leftover, path: `blocks[_key=="${block._key}"].${leftover.path}` });
    }
    for (const problem of result.problems) problems.push(`blocks[_key=="${block._key}"]: ${problem}`);
    return result.block;
  });
  return { blocks: migrated, leftovers, problems };
}

/** Throws unless `file` exists, is under 24 hours old, and passes `gzip -t`. */
export function assertFreshBackup(file, now = Date.now()) {
  if (!file) throw new Error("--apply needs --backup <file>: a raw export of this dataset.");
  const stats = statSync(file);
  if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
    throw new Error(`Backup ${file} is older than 24 hours. Take a fresh raw export.`);
  }
  execFileSync("gzip", ["-t", file], { stdio: ["ignore", "ignore", "pipe"] });
}

function describe(block) {
  const designField = DESIGN_FIELD[block._type] ?? "layout";
  return block[designField] ? `${block._type}:${block[designField]}` : `${block._type}:(none)`;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const backupIndex = args.indexOf("--backup");
  const backup = backupIndex === -1 ? undefined : args[backupIndex + 1];

  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: "2026-03-23" });
  const { dataset, projectId } = client.config();
  console.log(`Project ${projectId}, dataset ${dataset}.`);
  if (apply) assertFreshBackup(backup);

  const documents = await client.fetch(
    `*[defined(blocks)]{_id, _rev, _type, blocks}`,
    {},
    { perspective: "raw" },
  );

  const changes = [];
  const counts = {};
  const allProblems = [];
  for (const document of documents) {
    const { blocks, leftovers, problems } = migrateBlocks(document.blocks);
    for (const problem of problems) allProblems.push(`${document._id} ${problem}`);
    const changed = blocks.filter(
      (block, index) => JSON.stringify(block) !== JSON.stringify(document.blocks[index]),
    );
    if (!changed.length) continue;
    changes.push({ ...document, blocks });
    console.log(`\n${apply ? "patch" : "would patch"} ${document._id}`);
    document.blocks.forEach((block, index) => {
      if (JSON.stringify(blocks[index]) === JSON.stringify(block)) return;
      const label = `${describe(block)} -> ${blocks[index]._type}`;
      counts[label] = (counts[label] ?? 0) + 1;
      console.log(`  ${block._key}: ${label}`);
    });
    for (const leftover of leftovers) {
      console.log(`  leftover ${leftover.path}: ${JSON.stringify(leftover.value).slice(0, 160)}`);
    }
  }

  console.log("\nBlocks changed:");
  for (const [label, count] of Object.entries(counts).sort()) console.log(`  ${count}  ${label}`);
  console.log(`${changes.length} of ${documents.length} documents need the new shape.`);
  if (allProblems.length) {
    console.log("\nProblems (fix these first; --apply refuses while any remain):");
    for (const problem of allProblems) console.log(`  ${problem}`);
    if (apply) process.exit(1);
  }
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
