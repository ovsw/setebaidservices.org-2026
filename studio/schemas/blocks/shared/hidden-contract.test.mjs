import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { hiddenField, hideableDocumentTypes, withHiddenMarker } from "./hidden.ts";

const documentSources = {
  page: "page.ts",
  post: "post.ts",
  category: "category.ts",
  blogIndex: "blog-index.ts",
};

function readDocument(file) {
  return readFileSync(new URL(`../../documents/${file}`, import.meta.url), "utf8");
}

test("the Hidden field starts ticked and lives in the Settings group", () => {
  assert.equal(hiddenField.name, "hidden");
  assert.equal(hiddenField.title, "Hidden");
  assert.equal(hiddenField.type, "boolean");
  assert.equal(hiddenField.initialValue, true);
  assert.equal(hiddenField.group, "settings");
  assert.match(hiddenField.description, /404/);
  assert.match(hiddenField.description, /Presentation still shows it/);
});

test("page, post, category and the blog index carry the Hidden field", () => {
  assert.deepEqual([...hideableDocumentTypes], Object.keys(documentSources));
  for (const [type, file] of Object.entries(documentSources)) {
    const source = readDocument(file);
    assert.match(source, new RegExp(`name: "${type}"`), file);
    assert.match(source, /^\s+hiddenField,$/m, file);
    assert.match(source, /name: "settings", title: "Settings"|name: "settings",\s+title: "Settings"/, file);
    assert.match(source, /hidden: "hidden"/, `${file} list preview reads the flag`);
  }
});

test("the Hidden field stays out of meta, so noindex keeps its meaning", () => {
  const meta = readFileSync(new URL("./meta.ts", import.meta.url), "utf8");
  assert.doesNotMatch(meta, /hidden/i);
  assert.match(meta, /name: "noindex"/);
});

test("document lists mark hidden documents only", () => {
  assert.equal(withHiddenMarker("/about", true), "Hidden · /about");
  assert.equal(withHiddenMarker(undefined, true), "Hidden");
  assert.equal(withHiddenMarker("/about", false), "/about");
  assert.equal(withHiddenMarker("/about", undefined), "/about");
});
