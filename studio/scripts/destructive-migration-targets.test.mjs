import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

for (const script of [
  "fix-blog-heading-accessibility.mjs",
  "remove-migrated-page-title-slug.mjs",
  "restore-legacy-page-images.mjs",
]) {
  test(`${script} guards the CAC production target before reading data`, () => {
    const source = readFileSync(new URL(script, import.meta.url), "utf8");

    assert.match(source, /import \{ assertCacProductionTarget \}/);
    assert.match(source, /assertCacProductionTarget\(\{ dataset, projectId \}\)/);
    assert.ok(
      source.indexOf("assertCacProductionTarget({ dataset, projectId })") <
        Math.min(
          ...["client.fetch", "readFile(sourcePath"]
            .map((text) => source.indexOf(text))
            .filter((index) => index >= 0),
        ),
      "the target must be checked before backup reads, queries, or mutations",
    );
  });
}
