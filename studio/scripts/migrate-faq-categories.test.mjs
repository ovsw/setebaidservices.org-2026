import assert from "node:assert/strict";
import test from "node:test";

import {
  FAQ_CATEGORIES,
  createFaqCategoryPlans,
} from "./migrate-faq-categories.mjs";

const categoryId = (slug) => {
  const category = FAQ_CATEGORIES.find((item) => item.slug.current === slug);
  assert.ok(category, `seed category ${slug} exists`);
  return category._id;
};

const faq = (_id, title, extra = {}) => ({
  _id,
  _rev: `rev-${_id}`,
  _type: "faq",
  title,
  body: [{ _key: "answer", _type: "block", children: [] }],
  ...extra,
});

const page = (_id, slug, refs) => ({
  _id,
  slug,
  sections: [{ _key: "faq-section", refs }],
});

const planFor = (plans, id) => plans.find((plan) => plan._id === id);

test("seeds the eleven categories in the spec's order", () => {
  assert.deepEqual(
    FAQ_CATEGORIES.map(({ title }) => title),
    [
      "Before you enroll",
      "The camp day",
      "Dates, cost, and enrolling",
      "Health, safety, and homesickness",
      "Getting there",
      "Staying in touch, food, and visiting",
      "Specialty programs",
      "Adult camp",
      "Leadership courses",
      "Working at camp",
      "Alumni and community",
    ],
  );
  const orders = FAQ_CATEGORIES.map(({ order }) => order);
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
});

test("a specific page decides the category ahead of the generic FAQs page and keywords", () => {
  const plans = createFaqCategoryPlans({
    faqs: [faq("faq-deposit", "Does the bus have seat belts, and is the deposit per child?")],
    pages: [
      page("faqs", "faqs", ["faq-other", "faq-deposit"]),
      page("datesAndRates", "dates-and-rates", ["faq-a", "faq-b", "faq-deposit"]),
    ],
  });

  assert.deepEqual(planFor(plans, "faq-deposit"), {
    _id: "faq-deposit",
    _rev: "rev-faq-deposit",
    source: "page",
    page: "dates-and-rates",
    set: {
      category: { _type: "reference", _ref: categoryId("dates-cost-and-enrolling") },
      order: 3,
    },
  });
});

test("the published page outranks its draft, and a draft-only page still counts", () => {
  const plans = createFaqCategoryPlans({
    faqs: [faq("faq-bus", "Who rides the bus?"), faq("faq-letter", "Can I write?")],
    pages: [
      page("drafts.travelByBus", "transportation/travel-by-bus", ["faq-bus"]),
      page("travelByBus", "transportation/travel-by-bus", ["faq-x", "faq-bus"]),
      page("drafts.stayInTouch", "stay-in-touch-with-your-camper", ["faq-letter"]),
    ],
  });

  assert.equal(planFor(plans, "faq-bus").set.order, 2);
  assert.equal(planFor(plans, "faq-bus").set.category._ref, categoryId("getting-there"));
  assert.equal(
    planFor(plans, "faq-letter").set.category._ref,
    categoryId("staying-in-touch-food-and-visiting"),
  );
});

test("an FAQ only on the generic FAQs page is matched on keywords and keeps its position there", () => {
  const plans = createFaqCategoryPlans({
    faqs: [faq("faq-visa", "Does my child need a visa, an eTA, or a consent letter?")],
    pages: [page("faqs", "faqs", ["faq-a", "faq-b", "faq-visa"])],
  });

  assert.deepEqual(planFor(plans, "faq-visa"), {
    _id: "faq-visa",
    _rev: "rev-faq-visa",
    source: "keyword",
    page: "faqs",
    set: {
      category: { _type: "reference", _ref: categoryId("getting-there") },
      order: 3,
    },
  });
});

test("an unused FAQ without a keyword falls back to The camp day with no order", () => {
  const plans = createFaqCategoryPlans({
    faqs: [faq("faq-after", "What happens after the summer?")],
    pages: [],
  });

  assert.deepEqual(planFor(plans, "faq-after"), {
    _id: "faq-after",
    _rev: "rev-faq-after",
    source: "fallback",
    page: null,
    set: { category: { _type: "reference", _ref: categoryId("the-camp-day") } },
  });
});

test("a draft FAQ is planned under its own id from the published id's page use", () => {
  const plans = createFaqCategoryPlans({
    faqs: [faq("drafts.faq-meal", "What is for lunch?")],
    pages: [page("foodSampleMenu", "food-and-sample-menu", ["faq-meal"])],
  });

  assert.equal(planFor(plans, "drafts.faq-meal")._rev, "rev-drafts.faq-meal");
  assert.equal(
    planFor(plans, "drafts.faq-meal").set.category._ref,
    categoryId("staying-in-touch-food-and-visiting"),
  );
});

test("changes nothing but category and order, and leaves tagged FAQs and set orders alone", () => {
  const untouched = faq("faq-done", "Is there a doctor?", {
    category: { _type: "reference", _ref: categoryId("the-camp-day") },
  });
  const ordered = faq("faq-ordered", "Is there a doctor on the island?", { order: 7 });
  const plans = createFaqCategoryPlans({
    faqs: [untouched, ordered],
    pages: [page("healthSafety", "health-and-safety", ["faq-done", "faq-ordered"])],
  });

  assert.equal(planFor(plans, "faq-done"), undefined);
  assert.deepEqual(Object.keys(planFor(plans, "faq-ordered").set), ["category"]);

  const migrated = { ...ordered, ...planFor(plans, "faq-ordered").set };
  assert.equal(migrated.title, ordered.title);
  assert.deepEqual(migrated.body, ordered.body);
  assert.equal(migrated.order, 7);
  assert.deepEqual(
    createFaqCategoryPlans({ faqs: [{ ...migrated, _rev: "after" }], pages: [] }),
    [],
  );
});

test("refuses to guess when a page that selects FAQs has no category mapping", () => {
  assert.throws(
    () =>
      createFaqCategoryPlans({
        faqs: [faq("faq-new", "New question?")],
        pages: [page("brandNew", "brand-new-page", ["faq-new"])],
      }),
    /brand-new-page/,
  );
});
