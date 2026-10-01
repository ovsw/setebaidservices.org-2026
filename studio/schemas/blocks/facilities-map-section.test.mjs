import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./facilities-map-section.ts", import.meta.url),
  "utf8",
);

const bigTopFields = [
  "bigTopHeading",
  "bigTopArea",
  "bigTopUnit",
  "bigTopTagline",
  "bigTopBody",
];

test("requires Big Top content only while the feature is shown", () => {
  for (const [index, fieldName] of bigTopFields.entries()) {
    const start = source.indexOf(`name: "${fieldName}"`);
    const nextFieldName = bigTopFields[index + 1] ?? "bigTopGallery";
    const end = source.indexOf(`name: "${nextFieldName}"`, start);
    const field = source.slice(start, end);

    assert.notEqual(start, -1, `${fieldName} field is missing`);
    assert.match(field, /validation: \(rule\) =>\s*rule\.custom/);
    assert.match(field, /isBigTopHidden\(parent\)/);
  }
});
