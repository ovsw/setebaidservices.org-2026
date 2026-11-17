import assert from "node:assert/strict";
import { mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { assertFreshBackup, migrateBlock, migrateBlocks } from "./migrate-section-designs.mjs";

const url = (external) => ({ _type: "customUrl", type: "external", external });
const button = (key, text) => ({ _key: key, _type: "button", text, url: url(`https://x/${key}`) });
const image = (ref, extra = {}) => ({ _type: "image", asset: { _ref: ref, _type: "reference" }, ...extra });
const heading = [{ _key: "h", _type: "block", children: [{ _key: "s", _type: "span", text: "Hi" }] }];

test("tilted feature cards become their own section with one flat card list", () => {
  const { block, leftovers } = migrateBlock({
    _key: "camps",
    _type: "featureCards",
    background: "cream",
    layout: "tilted",
    title: heading,
    link: button("all", "All camps"),
    groups: [
      {
        _key: "g1",
        _type: "featureCardGroup",
        heading: "Our camps",
        singleRowUpToFour: true,
        cards: [
          {
            _key: "c1",
            _type: "featureCardItem",
            image: image("a"),
            title: "Day camp",
            eyebrow: "Ages 7–13",
            badgeLabel: "JUL",
            badgeValue: "11–17",
            buttons: [button("b1", "Apply")],
            link: { url: { _type: "customUrl", openInNewTab: true } },
          },
        ],
      },
    ],
  });
  assert.deepEqual(block, {
    _key: "camps",
    _type: "tiltedFeatureCards",
    background: "cream",
    title: heading,
    link: button("all", "All camps"),
    cards: [
      {
        _key: "c1",
        _type: "tiltedFeatureCard",
        image: image("a"),
        title: "Day camp",
        eyebrow: "Ages 7–13",
        badgeLabel: "JUL",
        badgeValue: "11–17",
        buttons: [button("b1", "Apply")],
      },
    ],
  });
  assert.deepEqual(
    leftovers.map((leftover) => leftover.path),
    ['groups[_key=="g1"].heading', 'cards[_key=="c1"].link'],
  );
});

test("ring-photo benefits keep photo, caption and link, and their cards become points", () => {
  const { block, leftovers } = migrateBlock({
    _key: "why",
    _type: "benefitCards",
    background: "white",
    layout: "ringPhoto",
    image: image("p"),
    caption: "Week one",
    link: button("more", "Why Setebaid"),
    eyebrow: "Why us",
    title: heading,
    cards: [{ _key: "c1", _type: "featureGridItem", icon: { name: "heart" }, title: "Safe", body: heading }],
  });
  assert.deepEqual(block, {
    _key: "why",
    _type: "ringPhotoBenefits",
    background: "white",
    image: image("p"),
    caption: "Week one",
    link: button("more", "Why Setebaid"),
    title: heading,
    points: [{ _key: "c1", _type: "ringPhotoPoint", title: "Safe", body: heading }],
  });
  assert.deepEqual(
    leftovers.map((leftover) => leftover.path),
    ["eyebrow", 'points[_key=="c1"].icon'],
  );
});

test("date cards get the section link from the first button and a date field", () => {
  const { block, leftovers } = migrateBlock({
    _key: "events",
    _type: "stackedTimeline",
    background: "cream",
    layout: "dateCards",
    title: heading,
    intro: "Soonest first.",
    buttons: [button("b1", "All events"), button("b2", "Calendar")],
    items: [{ _key: "i1", _type: "stackedTimelineItem", meta: "Jul 11", title: "Gala", link: button("l", "Go") }],
  });
  assert.deepEqual(block, {
    _key: "events",
    _type: "dateCards",
    background: "cream",
    title: heading,
    link: { _type: "button", text: "All events", url: url("https://x/b1") },
    items: [{ _key: "i1", _type: "dateCard", date: "Jul 11", title: "Gala", link: button("l", "Go") }],
  });
  assert.deepEqual(
    leftovers.map((leftover) => leftover.path),
    ['buttons[_key=="b2"]', "intro"],
  );
});

test("the quote track keeps its hint and the quote wall drops it", () => {
  const testimonials = [{ _key: "t", _type: "reference", _ref: "q" }];
  const track = migrateBlock({ _key: "q", _type: "quoteWall", layout: "track", hint: "drag", eyebrow: "Voices", heading, testimonials });
  assert.deepEqual(track.block, { _key: "q", _type: "quoteTrack", hint: "drag", heading, testimonials });
  assert.deepEqual(track.leftovers.map((leftover) => leftover.path), ["eyebrow"]);

  const wall = migrateBlock({ _key: "w", _type: "quoteWall", layout: "wall", hint: "drag", eyebrow: "Voices", heading, testimonials });
  assert.deepEqual(wall.block, { _key: "w", _type: "quoteWall", eyebrow: "Voices", heading, testimonials });
  assert.deepEqual(wall.leftovers.map((leftover) => leftover.path), ["hint"]);
});

test("the bento collage keeps three captioned photos and buttons; the collage drops them", () => {
  const photos = {
    primaryImage: image("1", { caption: "Lake", alt: "Lake" }),
    secondaryImage: image("2", { caption: "Cabin" }),
    tertiaryImage: image("3", { caption: "Fire" }),
  };
  const bento = migrateBlock({
    _key: "b",
    _type: "imageCollageFeature",
    layout: "bento",
    title: heading,
    points: [{ _key: "p", _type: "imageCollageFeaturePoint", title: "Ratio" }],
    buttons: [button("a", "Join")],
    ...photos,
  });
  assert.deepEqual(bento.block, { _key: "b", _type: "bentoCollage", title: heading, buttons: [button("a", "Join")], ...photos });
  assert.deepEqual(bento.leftovers.map((leftover) => leftover.path), ["points"]);

  const collage = migrateBlock({
    _key: "c",
    _type: "imageCollageFeature",
    layout: "collage",
    title: heading,
    points: [{ _key: "p", _type: "imageCollageFeaturePoint", title: "Ratio" }],
    buttons: [button("a", "Join")],
    ...photos,
  });
  assert.deepEqual(collage.block, {
    _key: "c",
    _type: "imageCollageFeature",
    title: heading,
    points: [{ _key: "p", _type: "imageCollageFeaturePoint", title: "Ratio" }],
    primaryImage: image("1", { alt: "Lake" }),
    secondaryImage: image("2"),
  });
  assert.deepEqual(
    collage.leftovers.map((leftover) => leftover.path),
    ["buttons", "tertiaryImage", "primaryImage.caption", "secondaryImage.caption"],
  );
});

test("the nudge keeps its background; the photo band has a fixed photo background", () => {
  const base = { title: "Not sure yet?", description: "Ask us.", buttons: [button("a", "Ask")] };
  const nudge = migrateBlock({ _key: "n", _type: "ctaBanner", variant: "nudge", background: "cream", eyebrow: "Hi", ...base });
  assert.deepEqual(nudge.block, { _key: "n", _type: "nudgeBanner", background: "cream", ...base });
  assert.deepEqual(nudge.leftovers.map((leftover) => leftover.path), ["eyebrow"]);

  const photo = migrateBlock({
    _key: "p",
    _type: "ctaBanner",
    variant: "photo",
    background: "green",
    image: image("x", { alt: "Kids" }),
    eyebrow: "Give",
    ...base,
  });
  assert.deepEqual(photo.block, { _key: "p", _type: "photoBanner", image: image("x", { alt: "Kids" }), eyebrow: "Give", ...base });
  assert.deepEqual(photo.leftovers.map((leftover) => leftover.path), ["background"]);
});

test("a grid card with buttons and no link gets its first button as the link", () => {
  const { block, leftovers } = migrateBlock({
    _key: "g",
    _type: "featureCards",
    layout: "grid",
    groups: [
      {
        _key: "r",
        _type: "featureCardGroup",
        heading: "Programs",
        singleRowUpToFour: true,
        cards: [
          { _key: "c", _type: "featureCardItem", title: "CIT", buttons: [button("a", "Read"), button("b", "Apply")] },
          { _key: "d", _type: "featureCardItem", title: "Day", link: { text: "Go", url: url("y") }, buttons: [button("e", "Other")] },
        ],
      },
    ],
  });
  assert.deepEqual(block, {
    _key: "g",
    _type: "featureCards",
    groups: [
      {
        _key: "r",
        _type: "featureCardGroup",
        heading: "Programs",
        cards: [
          { _key: "c", _type: "featureCardItem", title: "CIT", link: { text: "Read", url: url("https://x/a") } },
          { _key: "d", _type: "featureCardItem", title: "Day", link: { text: "Go", url: url("y") } },
        ],
      },
    ],
  });
  assert.deepEqual(
    leftovers.map((leftover) => leftover.path),
    ['groups[_key=="r"].cards[_key=="c"].buttons[_key=="b"]', 'groups[_key=="r"].cards[_key=="d"].buttons'],
  );
});

test("a row turned to two by two is reported, not silently lost", () => {
  const { leftovers } = migrateBlock({
    _key: "g",
    _type: "featureCards",
    groups: [{ _key: "r", _type: "featureCardGroup", heading: "Programs", singleRowUpToFour: false, cards: [] }],
  });
  assert.deepEqual(leftovers.map((leftover) => leftover.path), ['groups[_key=="r"].singleRowUpToFour']);
});

test("a default-design block loses only its stored design value", () => {
  const banner = { _key: "c", _type: "ctaBanner", background: "green", title: "Apply", buttons: [button("a", "Apply")] };
  const { block, leftovers } = migrateBlock({ ...banner, variant: "closing" });
  assert.deepEqual(block, banner);
  assert.deepEqual(leftovers, []);
});

test("a block with no stored design value and only its own fields comes back unchanged", () => {
  const timeline = { _key: "t", _type: "stackedTimeline", title: heading, items: [{ _key: "i", _type: "stackedTimelineItem", title: "Bus", meta: "9 am" }] };
  assert.deepEqual(migrateBlock(timeline), { block: timeline, leftovers: [], problems: [] });
});

test("a block of an unrelated type comes back unchanged, extra fields and all", () => {
  const story = { _key: "s", _type: "storyFeature", layout: "anything", title: "Story" };
  assert.deepEqual(migrateBlock(story), { block: story, leftovers: [], problems: [] });
});

test("running the migration twice changes nothing", () => {
  const blocks = [
    { _key: "n", _type: "ctaBanner", variant: "nudge", background: "white", title: "Hi", buttons: [button("a", "Go")] },
    { _key: "q", _type: "quoteWall", layout: "track", hint: "drag", heading, testimonials: [] },
  ];
  const once = migrateBlocks(blocks);
  const twice = migrateBlocks(once.blocks);
  assert.deepEqual(twice.blocks, once.blocks);
  assert.deepEqual(twice.leftovers, []);
  assert.equal(once.leftovers.length, 0);
});

test("leftover paths are prefixed with their block", () => {
  const { leftovers } = migrateBlocks([{ _key: "n", _type: "ctaBanner", variant: "nudge", eyebrow: "Hi", title: "x", buttons: [] }]);
  assert.deepEqual(leftovers, [{ path: 'blocks[_key=="n"].eyebrow', value: "Hi" }]);
});

test("--apply refuses a missing, stale or broken backup", () => {
  const dir = mkdtempSync(join(tmpdir(), "section-designs-"));
  const good = join(dir, "good.tar.gz");
  writeFileSync(good, gzipSync("data"));
  assert.doesNotThrow(() => assertFreshBackup(good));

  assert.throws(() => assertFreshBackup(undefined), /--backup/);
  assert.throws(() => assertFreshBackup(join(dir, "missing.tar.gz")), /ENOENT/);

  const stale = join(dir, "stale.tar.gz");
  writeFileSync(stale, gzipSync("data"));
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  utimesSync(stale, twoDaysAgo, twoDaysAgo);
  assert.throws(() => assertFreshBackup(stale), /older than 24 hours/);

  const broken = join(dir, "broken.tar.gz");
  writeFileSync(broken, "not gzip");
  assert.throws(() => assertFreshBackup(broken));
});

test("flattened tilted cards get unique keys and stop at six", () => {
  const card = (key) => ({ _key: key, _type: "featureCardItem", title: key, image: image(key) });
  const { block, leftovers } = migrateBlock({
    _key: "t",
    _type: "featureCards",
    background: "cream",
    layout: "tilted",
    groups: [
      { _key: "g1", _type: "featureCardGroup", cards: [card("c1"), card("c2"), card("c3"), card("c4")] },
      { _key: "g2", _type: "featureCardGroup", cards: [card("c1"), card("c5"), card("c6"), card("c7")] },
    ],
  });
  assert.deepEqual(block.cards.map((c) => c._key), ["c1", "c2", "c3", "c4", "c1-g2", "c5"]);
  assert.deepEqual(leftovers.map((l) => l.path), ['cards[_key=="c6"]', 'cards[_key=="c7"]']);
});

test("a grid card whose link cannot draw takes its first button instead", () => {
  const { block } = migrateBlock({
    _key: "g",
    _type: "featureCards",
    layout: "grid",
    groups: [
      {
        _key: "r",
        _type: "featureCardGroup",
        heading: "Programs",
        cards: [{ _key: "c", _type: "featureCardItem", title: "CIT", link: { text: "" }, buttons: [button("a", "Read")] }],
      },
    ],
  });
  assert.deepEqual(block.groups[0].cards[0].link, { text: "Read", url: url("https://x/a") });
  assert.equal("buttons" in block.groups[0].cards[0], false);
});

test("a moved block with no stored background is reported as a problem", () => {
  const moved = migrateBlock({ _key: "n", _type: "ctaBanner", variant: "nudge", title: "Hi" });
  assert.equal(moved.problems.length, 1);
  const photo = migrateBlock({ _key: "p", _type: "ctaBanner", variant: "photo", title: "Hi", image: image("x") });
  assert.deepEqual(photo.problems, []);
  const kept = migrateBlock({ _key: "k", _type: "ctaBanner", variant: "closing", title: "Hi" });
  assert.deepEqual(kept.problems, []);
  const { problems } = migrateBlocks([{ _key: "n", _type: "ctaBanner", variant: "nudge", title: "Hi" }]);
  assert.match(problems[0], /^blocks\[_key=="n"\]: no stored background/);
});
