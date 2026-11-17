import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const buttonSource = readFileSync(new URL("./button.ts", import.meta.url), "utf8");
const customUrlSource = readFileSync(
  new URL("./custom-url.ts", import.meta.url),
  "utf8",
);

test("shared buttons require visible text", () => {
  assert.match(
    buttonSource,
    // [^}] keeps the match inside the text field, so the URL rule cannot satisfy it.
    /name: "text",[^}]*validation: \(rule\) => requiredText\(/,
  );
});

test("shared internal URLs allow the Blog index singleton", () => {
  assert.match(customUrlSource, /\{ type: "blogIndex" \}/);
});
