import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isHidden,
  PUBLIC_VISIBILITY_FILTER,
  publicVisibilityFilterFor,
} from "../../../shared/public-visibility.ts";

test("only an explicit true hides a document; a missing value is visible", () => {
  assert.equal(PUBLIC_VISIBILITY_FILTER, "hidden != true");
  assert.equal(publicVisibilityFilterFor("internal"), "internal->hidden != true");
  assert.equal(isHidden({ hidden: true }), true);
  assert.equal(isHidden({ hidden: false }), false);
  assert.equal(isHidden({ hidden: null }), false);
  assert.equal(isHidden({}), false);
  assert.equal(isHidden(null), false);
});

test("the sitemap and the page prebuild leave hidden documents out", () => {
  const sitemap = readFileSync(new URL("../../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /\$\{PUBLIC_VISIBILITY_FILTER\}/);

  const page = readFileSync(new URL("./page.ts", import.meta.url), "utf8");
  assert.match(
    page,
    /PAGES_SLUGS_QUERY = groq`\*\[_type == "page" && defined\(slug\) && \$\{PUBLIC_VISIBILITY_FILTER\}\]/,
  );
  // The page query projects the flag, so the route check needs no extra request.
  assert.match(page, /PAGE_QUERY = groq`[\s\S]*?\bhidden,[\s\S]*?`/);
});
