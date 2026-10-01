import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./migrate-page-seo.mjs", import.meta.url),
  "utf8",
);

test("guards the SEO migration with the CAC production target assertion", () => {
  assert.match(source, /import \{ assertCacProductionTarget \}/);
  assert.match(source, /assertCacProductionTarget\(\{ dataset, projectId \}\)/);
  assert.ok(
    source.indexOf("assertCacProductionTarget") <
      source.indexOf("client.fetch"),
    "the target must be checked before reading or mutating documents",
  );
});
