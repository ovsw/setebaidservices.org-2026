import assert from "node:assert/strict";
import test from "node:test";

import { createRemoveHeaderImagePlans } from "./migrate-remove-page-header-image.mjs";

const asset = { _type: "reference", _ref: "image-abc-2400x1600-jpg" };

test("plans one guarded unset per page that carries headerImage, drafts included", () => {
  const plans = createRemoveHeaderImagePlans([
    { _id: "placesToStay", _rev: "r1", headerImage: { _type: "image", asset } },
    { _id: "drafts.placesToStay", _rev: "r2", headerImage: { _type: "image", asset, alt: "x" } },
  ]);
  assert.deepEqual(plans, [
    { _id: "placesToStay", _rev: "r1", asset: asset._ref },
    { _id: "drafts.placesToStay", _rev: "r2", asset: asset._ref },
  ]);
});

test("skips pages without the field and keeps an empty object as a removal", () => {
  const plans = createRemoveHeaderImagePlans([
    { _id: "clean", _rev: "r1", title: "Clean" },
    { _id: "empty", _rev: "r2", headerImage: {} },
    { _id: "nulled", _rev: "r3", headerImage: null },
  ]);
  assert.deepEqual(
    plans.map(({ _id, asset }) => [_id, asset]),
    [
      ["empty", null],
      ["nulled", null],
    ],
  );
});

test("refuses a page without a revision, so every write stays guarded", () => {
  assert.throws(
    () => createRemoveHeaderImagePlans([{ _id: "noRev", headerImage: { _type: "image", asset } }]),
    /must include _id and _rev/,
  );
});
