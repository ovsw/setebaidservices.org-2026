import assert from "node:assert/strict";
import test from "node:test";

import { createBlogHeadingPlan } from "./fix-blog-heading-accessibility.mjs";

const heading = (_key, style, text) => ({
  _key,
  _type: "block",
  style,
  children: [{ _type: "span", text }],
});

test("promotes every H3 when a target post has no H2", () => {
  const plan = createBlogHeadingPlan({
    _id: "post-one",
    _rev: "revision-one",
    slug: { current: "camper-staff-ratio" },
    body: [heading("first", "h3", "First"), heading("second", "h3", "Second")],
  });

  assert.deepEqual(plan.set, {
    'body[_key=="first"].style': "h2",
    'body[_key=="second"].style': "h2",
  });
  assert.deepEqual(plan.unset, []);
});

test("removes only the expected empty heading", () => {
  const plan = createBlogHeadingPlan({
    _id: "post-two",
    _rev: "revision-two",
    slug: { current: "what-and-how-to-pack-for-overnight-summer-camp" },
    body: [
      heading("real-heading", "h2", "Packing"),
      heading("99ed874ea5d5", "h3", "\n"),
    ],
  });

  assert.deepEqual(plan.set, {});
  assert.deepEqual(plan.unset, ['body[_key=="99ed874ea5d5"]']);
});

test("is idempotent after headings are fixed", () => {
  assert.equal(
    createBlogHeadingPlan({
      _id: "post-one",
      _rev: "revision-one",
      slug: { current: "camper-staff-ratio" },
      body: [heading("first", "h2", "First")],
    }),
    null,
  );
  assert.equal(
    createBlogHeadingPlan({
      _id: "post-two",
      _rev: "revision-two",
      slug: { current: "what-and-how-to-pack-for-overnight-summer-camp" },
      body: [heading("real-heading", "h2", "Packing")],
    }),
    null,
  );
});

test("refuses changed source data instead of applying a partial repair", () => {
  assert.throws(
    () =>
      createBlogHeadingPlan({
        _id: "post-one",
        _rev: "revision-one",
        slug: { current: "camper-staff-ratio" },
        body: [heading("first", "h2", "First"), heading("second", "h3", "Second")],
      }),
    /expected only H3 headings/,
  );
  assert.throws(
    () =>
      createBlogHeadingPlan({
        _id: "post-two",
        _rev: "revision-two",
        slug: { current: "what-and-how-to-pack-for-overnight-summer-camp" },
        body: [heading("99ed874ea5d5", "h3", "Keep me")],
      }),
    /expected 99ed874ea5d5 to be an empty heading/,
  );
});
