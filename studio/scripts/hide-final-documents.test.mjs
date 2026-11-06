import assert from "node:assert/strict";
import test from "node:test";
import { missingPagePaths, planHiddenPatches } from "./hide-final-documents.mjs";

const page = (_id, slug, extra = {}) => ({ _id, _rev: `r-${_id}`, _type: "page", slug, ...extra });
const doc = (_id, _type, extra = {}) => ({ _id, _rev: `r-${_id}`, _type, ...extra });

const fixture = [
  page("page-donate-campaigns", "donate/campaigns"),
  page("page-donate-impact", "donate/impact"),
  page("drafts.page-donate-impact", "donate/impact"),
  page("page-get-involved", "get-involved"),
  page("drafts.page-donate-memorial", "donate/memorial"),
  page("page-donate-memorial", "donate/memorial"),
  page("page-donate-campaigns-year-end", "donate/campaigns/year-end"),
  page("page-donate", "donate"),
  page("drafts.page-donate", "donate"),
  page("page-about", "about"),
  doc("blogIndex", "blogIndex"),
  doc("drafts.blogIndex", "blogIndex"),
  doc("post-dear-setebaid", "post"),
  doc("drafts.post-dear-setebaid", "post"),
  doc("post-a-peek", "post"),
  doc("category-news", "category"),
  doc("drafts.category-camper", "category"),
  doc("versions.r1.post-a-peek", "post"),
];

const ids = (patches) => patches.map((patch) => patch._id).sort();

test("flags the published and draft versions of every listed document, and nothing else", () => {
  assert.deepEqual(ids(planHiddenPatches(fixture)), [
    "blogIndex",
    "category-news",
    "drafts.blogIndex",
    "drafts.category-camper",
    "drafts.page-donate-impact",
    "drafts.page-donate-memorial",
    "drafts.post-dear-setebaid",
    "page-donate-campaigns",
    "page-donate-campaigns-year-end",
    "page-donate-impact",
    "page-donate-memorial",
    "page-get-involved",
    "post-a-peek",
    "post-dear-setebaid",
  ]);
});

test("keeps the revision so the write fails if a document changed after the read", () => {
  const [patch] = planHiddenPatches([page("page-get-involved", "get-involved")]);
  assert.deepEqual(patch, { _id: "page-get-involved", _rev: "r-page-get-involved", _type: "page" });
});

test("a draft with a changed slug is still flagged with its listed published page", () => {
  const patches = planHiddenPatches([
    page("page-get-involved", "get-involved"),
    page("drafts.page-get-involved", "help-out"),
  ]);
  assert.deepEqual(ids(patches), ["drafts.page-get-involved", "page-get-involved"]);
});

test("running it again changes nothing", () => {
  const hiddenFixture = fixture.map((document) => ({ ...document, hidden: true }));
  assert.deepEqual(planHiddenPatches(hiddenFixture), []);
});

test("reports listed page paths that no document matches", () => {
  assert.deepEqual(missingPagePaths(fixture), []);
  assert.deepEqual(missingPagePaths([page("page-get-involved", "get-involved")]), [
    "/donate/campaigns",
    "/donate/campaigns/year-end",
    "/donate/impact",
    "/donate/memorial",
  ]);
});

test("matches page slugs with leading or trailing slashes, as the frontend does", () => {
  const documents = [
    page("page-get-involved", "/get-involved/"),
    page("page-donate-impact", "donate/impact/"),
    page("page-no-slug", undefined),
  ];
  assert.deepEqual(ids(planHiddenPatches(documents)), ["page-donate-impact", "page-get-involved"]);
  assert.deepEqual(missingPagePaths(documents), [
    "/donate/campaigns",
    "/donate/campaigns/year-end",
    "/donate/memorial",
  ]);
});
