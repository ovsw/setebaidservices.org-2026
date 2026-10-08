import assert from "node:assert/strict";
import test from "node:test";
import { migrateBlocks } from "./migrate-button-lists.mjs";

const keys = () => {
  let count = 0;
  return () => `k${++count}`;
};

const url = (external) => ({ type: "external", external });

test("removes stored button styles but keeps a section's own variant", () => {
  const [banner] = migrateBlocks([
    {
      _key: "cta",
      _type: "ctaBanner",
      variant: "nudge",
      buttons: [{ _key: "a", _type: "button", variant: "highlight", text: "Give", url: url("x") }],
      richText: [{ markDefs: [{ _key: "m", _type: "buttonLink", variant: "outline" }] }],
    },
  ]);
  assert.equal(banner.variant, "nudge");
  assert.deepEqual(banner.buttons, [{ _key: "a", _type: "button", text: "Give", url: url("x") }]);
  assert.deepEqual(banner.richText[0].markDefs, [{ _key: "m", _type: "buttonLink" }]);
});

test("tilted feature cards move both links into one button list", () => {
  const [section] = migrateBlocks(
    [
      {
        _key: "camps",
        _type: "featureCards",
        layout: "tilted",
        groups: [
          {
            _key: "g",
            cards: [
              {
                _key: "c1",
                title: "Camp",
                link: { text: "Register", url: url("r") },
                secondaryLink: { text: "Details", url: url("d") },
              },
              { _key: "c2", title: "Only one", link: { text: "Go", url: url("g") } },
            ],
          },
        ],
      },
    ],
    keys(),
  );
  const [first, second] = section.groups[0].cards;
  assert.deepEqual(first, {
    _key: "c1",
    title: "Camp",
    buttons: [
      { _key: "k1", _type: "button", text: "Register", url: url("r") },
      { _key: "k2", _type: "button", text: "Details", url: url("d") },
    ],
  });
  assert.deepEqual(second.buttons, [{ _key: "k3", _type: "button", text: "Go", url: url("g") }]);
  assert.equal("link" in second, false);
});

test("grid feature cards keep their card link", () => {
  const card = { _key: "c", title: "Card", link: { text: "Read", url: url("r") } };
  const blocks = [{ _key: "s", _type: "featureCards", layout: "grid", groups: [{ _key: "g", cards: [card] }] }];
  assert.deepEqual(migrateBlocks(blocks), blocks);
});

test("a pricing tier's button becomes a one-button list", () => {
  const [section] = migrateBlocks(
    [
      {
        _key: "p",
        _type: "pricingTiers",
        tiers: [
          { _key: "t1", price: 1, button: { _type: "button", variant: "outline", text: "Apply", url: url("a") } },
          { _key: "t2", price: 2 },
        ],
      },
    ],
    keys(),
  );
  assert.deepEqual(section.tiers, [
    { _key: "t1", price: 1, buttons: [{ _key: "k1", _type: "button", text: "Apply", url: url("a") }] },
    { _key: "t2", price: 2 },
  ]);
});

test("running the migration twice changes nothing", () => {
  const once = migrateBlocks(
    [
      {
        _key: "s",
        _type: "featureCards",
        layout: "tilted",
        groups: [{ _key: "g", cards: [{ _key: "c", link: { text: "Go", url: url("g") } }] }],
      },
      { _key: "p", _type: "pricingTiers", tiers: [{ _key: "t", button: { text: "Pay", url: url("p") } }] },
    ],
    keys(),
  );
  assert.deepEqual(migrateBlocks(once, keys()), once);
});
