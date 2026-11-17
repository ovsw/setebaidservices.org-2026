import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateAskSpacing, validateBlocks } from "./page-builder.ts";

test("allows one Team Members section and preserves its stable team anchor", () => {
  assert.equal(validateBlocks([{ _type: "teamMembers" }]), true);
});

test("rejects multiple Team Members sections", () => {
  assert.equal(
    validateBlocks([
      { _type: "teamMembers" },
      { _type: "richTextBlock" },
      { _type: "teamMembers" },
    ]),
    "Add no more than one Team Members section",
  );
});

test("counts the inner hero as a hero: one per page, first position", () => {
  assert.equal(
    validateBlocks([{ _type: "innerHero" }, { _type: "richTextBlock" }]),
    true,
  );
  assert.equal(
    validateBlocks([{ _type: "richTextBlock" }, { _type: "innerHero" }]),
    "The Hero section must be the first section",
  );
  assert.equal(
    validateBlocks([{ _type: "innerHero" }, { _type: "innerHero" }]),
    "Add no more than one Hero section",
  );
});


test("keeps a light final section between content and footer", () => {
  assert.equal(validateBlocks([{ _type: "quoteWall", background: "green" }]),
    "Choose White or Cream for the final section above the footer.");
  assert.equal(validateBlocks([{ _type: "quoteWall", background: "green" }, { _type: "directorCta", background: "cream" }]), true);
});

test("one ask at a time: flags two calls to action in a row", () => {
  assert.equal(
    validateAskSpacing([
      { _type: "ctaBanner" },
      { _type: "quoteWall" },
      { _type: "directorCta" },
    ]),
    true,
  );
  assert.match(
    validateAskSpacing([
      { _type: "richTextBlock" },
      { _type: "directorCta" },
      { _type: "ctaBanner" },
    ]),
    /Sections 2 and 3 are both calls to action/,
  );
  assert.equal(validateAskSpacing(undefined), true);
});

// One section, one design (ADR 0003, docs/agents/page-builder.md): a field
// that picks a look turns one section into several. A new look is a new
// section. An exception needs Ovi's written approval before it is listed here.
const approvedLookFields = new Set([]);

test("one section, one design: no section has a field that picks its look", () => {
  const blocksDirectory = path.dirname(fileURLToPath(import.meta.url));
  const found = new Set();
  for (const file of readdirSync(blocksDirectory)) {
    if (!file.endsWith(".ts")) continue;
    const source = readFileSync(path.join(blocksDirectory, file), "utf8");
    for (const [, name] of source.matchAll(
      /name:\s*["'](layout|variant|style|design|look|appearance|theme)["']/g,
    )) {
      found.add(`${file}:${name}`);
    }
  }
  assert.deepEqual(
    [...found].filter((field) => !approvedLookFields.has(field)),
    [],
    "A new look is a new section with its own _type; see docs/agents/page-builder.md.",
  );
  assert.deepEqual(
    [...approvedLookFields].filter((field) => !found.has(field)),
    [],
    "This section no longer has its look field; remove it from approvedLookFields.",
  );
});
