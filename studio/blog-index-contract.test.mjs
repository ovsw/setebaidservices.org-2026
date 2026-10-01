import assert from "node:assert/strict";
import test from "node:test";

import {
  blocksField,
  blogIndexBlocksField,
  blogIndexPageBuilderBlockTypes,
  validateBlogIndexBlocks,
  homePageBlocksField,
  homePagePageBuilderBlockTypes,
  getPageBuilderPreviewImageUrl,
  pageBuilderBlockTypes,
} from "./schemas/blocks/page-builder.ts";
import {
  singletonDocumentActions,
  singletonDocumentTypes,
} from "./singletons.ts";

test("the shared blocks field exactly matches its authoritative inventory", () => {
  assert.deepEqual(
    blocksField.of.filter(({ hidden }) => !hidden).map(({ type }) => type),
    [...pageBuilderBlockTypes],
  );
  assert.deepEqual([...pageBuilderBlockTypes], [
    "hero",
    "innerHero",
    "faqHub",
    "richTextBlock",
    "benefitCards",
    "storyFeature",
    "imageCollageFeature",
    "featureCards",
    "activitySchedule",
    "facilitiesMapSection",
    "datesRatesSection",
    "stackedFeatureRows",
    "internationalCampersSection",
    "latestArticles",
    "faqAccordion",
    "teamMembers",
    "ctaBanner",
    "journey",
    "stackedTimeline",
    "activityCatalogue",
    "includedExtras",
    "packingChecklist",
    "bigImageList",
    "directorCta",
    "largeSlides",
    "headingImage",
    "quoteWall",
    "pricingSingleToggle",
  ]);
  assert.equal(blocksField.of.some(({ hidden }) => hidden), false);
  assert.equal(new Set(pageBuilderBlockTypes).size, pageBuilderBlockTypes.length);
});

test("the homepage alone offers the homepage hero", () => {
  assert.deepEqual(
    homePageBlocksField.of.filter(({ hidden }) => !hidden).map(({ type }) => type),
    [...homePagePageBuilderBlockTypes],
  );
  assert.equal(homePagePageBuilderBlockTypes.includes("homeHero"), true);
  assert.equal(pageBuilderBlockTypes.includes("homeHero"), false);
});

test("the blocks insert menu offers list and grid views with known previews", () => {
  assert.deepEqual(
    blocksField.options.insertMenu.views.map(({ name }) => name),
    ["grid", "list"],
  );
  assert.equal(
    getPageBuilderPreviewImageUrl("featureCards"),
    "/static/images/preview/featureCards.jpg",
  );
  assert.equal(
    getPageBuilderPreviewImageUrl("activitySchedule"),
    "/static/images/preview/activitySchedule.jpg",
  );
  assert.equal(
    getPageBuilderPreviewImageUrl("stackedFeatureRows"),
    "/static/images/preview/stackedFeatureRows.jpg",
  );
  assert.equal(
    getPageBuilderPreviewImageUrl("innerHero"),
    "/static/images/preview/innerHero.jpg",
  );
  assert.equal(
    getPageBuilderPreviewImageUrl("hero"),
    "/static/images/preview/hero.jpg",
  );
});

test("blogIndex uses the singleton configuration", () => {
  assert.deepEqual(
    blogIndexBlocksField.of
      .filter(({ hidden }) => !hidden)
      .map(({ type }) => type),
    [...blogIndexPageBuilderBlockTypes],
  );
  assert.equal(blogIndexPageBuilderBlockTypes.includes("innerHero"), true);
  assert.equal(blogIndexPageBuilderBlockTypes.includes("homeHero"), false);
  assert.equal(blogIndexPageBuilderBlockTypes.includes("faqHub"), false);
  assert.equal(singletonDocumentTypes.has("blogIndex"), true);
  assert.equal(singletonDocumentTypes.has("facilitiesMap"), true);
  assert.equal(singletonDocumentTypes.has("seasonsConfig"), true);
  assert.equal(singletonDocumentActions.has("duplicate"), false);
  assert.equal(singletonDocumentActions.has("delete"), false);
});

test("the blog index needs exactly one Latest Posts section", () => {
  const hero = { _type: "innerHero" };
  const listing = { _type: "latestArticles", background: "white" };
  assert.equal(validateBlogIndexBlocks([hero, listing]), true);
  assert.match(String(validateBlogIndexBlocks([hero])), /Latest Posts/);
  assert.match(
    String(validateBlogIndexBlocks([hero, listing, listing])),
    /Latest Posts/,
  );
  assert.match(
    String(validateBlogIndexBlocks([listing, hero])),
    /Hero section must be the first/,
  );
});
