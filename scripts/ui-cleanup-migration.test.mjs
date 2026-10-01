import assert from "node:assert/strict";
import test from "node:test";

import {
  BUILD_DAY_AGE_NOTE,
  createUiCleanupPlan,
  createUiCleanupPlans,
} from "./ui-cleanup-migration.mjs";

test("removes the Activity Schedule aside and adds the approved age sentence once", () => {
  const document = {
    _id: "activities",
    _rev: "rev-activities",
    _type: "page",
    blocks: [
      {
        _key: "schedule",
        _type: "activitySchedule",
        description: "Choose activities with your counsellor.",
        aside: "Old separate note.",
        featuredActivities: [{ _key: "canoe", _type: "reference", _ref: "activity-canoe" }],
      },
    ],
  };

  const plan = createUiCleanupPlan(document);
  const section = plan.set.blocks[0];

  assert.equal(section.aside, undefined);
  assert.equal(
    section.description,
    `Choose activities with your counsellor. ${BUILD_DAY_AGE_NOTE}`,
  );
  assert.deepEqual(section.featuredActivities, document.blocks[0].featuredActivities);
  assert.equal(document.blocks[0].aside, "Old separate note.");
});

test("moves every catalogue aside into its own blurb without losing keys or references", () => {
  const document = {
    _id: "activities",
    _rev: "rev-catalogue",
    _type: "page",
    blocks: [
      {
        _key: "catalogue",
        _type: "activityCatalogue",
        groups: [
          {
            _key: "water",
            _type: "activityCatalogueGroup",
            blurb: "At the dock.",
            aside: "A lifeguard is present.",
            activities: [{ _key: "swim", _type: "reference", _ref: "activity-swim" }],
          },
          { _key: "land", _type: "activityCatalogueGroup", aside: "A coach is present." },
        ],
      },
    ],
  };

  const groups = createUiCleanupPlan(document).set.blocks[0].groups;
  assert.equal(groups[0].blurb, "At the dock. A lifeguard is present.");
  assert.equal(groups[1].blurb, "A coach is present.");
  assert.equal(groups[0].aside, undefined);
  assert.deepEqual(groups[0].activities, document.blocks[0].groups[0].activities);
  assert.deepEqual(groups.map(({ _key }) => _key), ["water", "land"]);
});

test("removes standalone parent labels recursively and preserves parent-related prose", () => {
  const document = {
    _id: "homePage",
    _rev: "rev-labels",
    _type: "page",
    blocks: [
      {
        _key: "care",
        _type: "stackedFeatureRows",
        eyebrow: "04 · FOR PARENTS",
        rows: [{ _key: "contact", label: "For parents", body: "For parents who want to talk with us." }],
      },
    ],
  };

  const cleaned = createUiCleanupPlan(document).set.blocks[0];
  assert.equal(cleaned.eyebrow, undefined);
  assert.equal(cleaned.rows[0].label, undefined);
  assert.equal(cleaned.rows[0].body, "For parents who want to talk with us.");
});

test("removes beginnerFriendly only from Activity documents", () => {
  const plans = createUiCleanupPlans([
    { _id: "activity-canoe", _rev: "rev-1", _type: "activity", title: "Canoe", beginnerFriendly: true },
    { _id: "page", _rev: "rev-2", _type: "page", beginnerFriendly: true },
  ]);

  assert.deepEqual(plans, [
    { _id: "activity-canoe", _rev: "rev-1", set: {}, unset: ["beginnerFriendly"] },
  ]);
});

test("maps legacy section colours and supplies the approved section defaults", () => {
  const document = {
    _id: "theme-page",
    _rev: "rev-theme",
    _type: "page",
    blocks: [
      { _key: "faq", _type: "faqAccordion", useCreamBackground: false },
      { _key: "story", _type: "storyFeature", useCreamBackground: true },
      { _key: "cards", _type: "featureCards" },
      { _key: "team", _type: "teamMembers", useCreamBackground: false },
      { _key: "team-default", _type: "teamMembers" },
      { _key: "testimonials", _type: "testimonials" },
      { _key: "articles", _type: "latestArticles" },
      { _key: "text", _type: "richTextBlock" },
      { _key: "nudge", _type: "ctaBanner", variant: "nudge" },
      { _key: "closing", _type: "ctaBanner", variant: "closing" },
      { _key: "keep", _type: "journey", background: "cream" },
    ],
  };

  const blocks = createUiCleanupPlan(document).set.blocks;
  assert.deepEqual(
    blocks.map(({ background, useCreamBackground }) => ({ background, useCreamBackground })),
    [
      { background: "green", useCreamBackground: undefined },
      { background: "cream", useCreamBackground: undefined },
      { background: "green", useCreamBackground: undefined },
      { background: "white", useCreamBackground: undefined },
      { background: "white", useCreamBackground: undefined },
      { background: "white", useCreamBackground: undefined },
      { background: "white", useCreamBackground: undefined },
      { background: "white", useCreamBackground: undefined },
      { background: "white", useCreamBackground: undefined },
      { background: "green", useCreamBackground: undefined },
      { background: "cream", useCreamBackground: undefined },
    ],
  );
});

test("makes an eligible final green section cream", () => {
  const plan = createUiCleanupPlan({
    _id: "final-colour-page",
    _rev: "rev-final-colour",
    _type: "page",
    blocks: [{ _key: "schedule", _type: "activitySchedule" }],
  });

  assert.equal(plan.set.blocks[0].background, "cream");
});

test("is idempotent and leaves unrelated fields exactly unchanged", () => {
  const document = {
    _id: "uniqueLocation",
    _rev: "rev-idempotent",
    _type: "page",
    title: "Adventure Island",
    image: { _type: "image", asset: { _type: "reference", _ref: "image-island" } },
    blocks: [{ _key: "care", _type: "stackedFeatureRows", eyebrow: "For parents" }],
  };
  const plan = createUiCleanupPlan(document);
  const migrated = { ...document, ...plan.set };
  for (const field of plan.unset) delete migrated[field];

  assert.equal(createUiCleanupPlan({ ...migrated, _rev: "rev-after" }), null);
  assert.equal(migrated.title, document.title);
  assert.deepEqual(migrated.image, document.image);
  assert.equal(document.blocks[0].eyebrow, "For parents");
});
