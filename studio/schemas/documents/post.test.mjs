import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Asks are sections (docs/agents/page-builder.md): a story's text must stay
// on the rich text type that has no button link and no callout.
test("a story's text cannot hold a button link or a callout", () => {
  const post = readFileSync(new URL("./post.ts", import.meta.url), "utf8");
  assert.match(post, /name: "body",\s+title: "Body",\s+type: "storyTextContent"/);
  const richText = readFileSync(
    new URL("../blocks/shared/rich-text-content.ts", import.meta.url),
    "utf8",
  );
  assert.match(richText, /name: "storyTextContent",[\s\S]*richTextMembers\(\{ asks: false \}\)/);
});
