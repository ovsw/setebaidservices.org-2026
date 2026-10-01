#!/usr/bin/env node
// Seed the FAQ categories and tag every FAQ with one.
// Precedence: the page that selects the FAQ, then keywords in the question,
// then the fallback category. `order` is the FAQ's position in that section.
//
// Dry run:  pnpm --dir studio migrate:faq-categories
// Apply:    pnpm --dir studio migrate:faq-categories --apply
//
// Apply first writes a raw dataset export to backups/ and stops unless it
// passes `gzip -t`.
// It patches each FAQ under its own id, so drafts stay drafts and published
// documents stay published. It never publishes a draft.

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const API_VERSION = "2026-03-23";
const studioDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backupDirectory = resolve(studioDirectory, "../backups");

const seed = (slug, title, order, description) => ({
  _id: `faqCategory-${slug}`,
  _type: "faqCategory",
  title,
  slug: { _type: "slug", current: slug },
  order,
  description,
});

export const FAQ_CATEGORIES = [
  seed("before-you-enroll", "Before you enroll", 10, "Is camp right for your child, who runs it, and how to decide."),
  seed("the-camp-day", "The camp day", 20, "Programs, cabins, choices, and the daily rules."),
  seed("dates-cost-and-enrolling", "Dates, cost, and enrolling", 30, "Session dates, prices, deposits, and how enrolling works."),
  seed("health-safety-and-homesickness", "Health, safety, and homesickness", 40, "Medical care, staff checks, insurance, and homesick campers."),
  seed("getting-there", "Getting there", 50, "The bus, the airport service, driving, and travel documents."),
  seed("staying-in-touch-food-and-visiting", "Staying in touch, food, and visiting", 60, "Letters, photos, meals, tuck, and Visitors' Day."),
  seed("specialty-programs", "Specialty programs", 70, "Aerials, gymnastics, trampoline, waterski, and wakeboard."),
  seed("adult-camp", "Adult camp", 80, "Camp sessions for grown-ups."),
  seed("leadership-courses", "Leadership courses", 90, "Leadership One, Leadership Two, and NCCP courses."),
  seed("working-at-camp", "Working at camp", 100, "Jobs, Junior Staff, and applying to work on the island."),
  seed("alumni-and-community", "Alumni and community", 110, "Former campers and staff, and the camp's local work."),
];

const categoryIdBySlug = new Map(FAQ_CATEGORIES.map(({ _id, slug }) => [slug.current, _id]));
const category = (slug) => {
  const id = categoryIdBySlug.get(slug);
  if (!id) throw new Error(`Unknown FAQ category slug: ${slug}`);
  return id;
};

export const GENERIC_FAQ_PAGE = "faqs";
export const FALLBACK_CATEGORY = category("the-camp-day");

// Page slug → category. Every page that selects FAQs must be listed here.
export const PAGE_CATEGORIES = new Map(
  Object.entries({
    "adult-summer-camp": "adult-camp",
    alumni: "alumni-and-community",
    "staff/community-initiatives": "alumni-and-community",
    "staff/available-positions": "working-at-camp",
    "staff/staff-application": "working-at-camp",
    "join-our-team": "working-at-camp",
    "junior-staff": "working-at-camp",
    "camp-video": "before-you-enroll",
    contact: "before-you-enroll",
    "great-leadership": "before-you-enroll",
    "memeberships-partnerships": "before-you-enroll",
    testimonials: "before-you-enroll",
    "dates-and-rates": "dates-cost-and-enrolling",
    "programs/general-camp-program": "the-camp-day",
    "health-and-safety": "health-safety-and-homesickness",
    transportation: "getting-there",
    "transportation/airport-service": "getting-there",
    "transportation/travel-by-bus": "getting-there",
    "transportation/travel-by-car": "getting-there",
    "food-and-sample-menu": "staying-in-touch-food-and-visiting",
    "places-to-stay-when-visiting": "staying-in-touch-food-and-visiting",
    "stay-in-touch-with-your-camper": "staying-in-touch-food-and-visiting",
    "visitor-days": "staying-in-touch-food-and-visiting",
    "programs/aerials-specialty-program": "specialty-programs",
    "programs/specialty-gymnastics-program": "specialty-programs",
    "programs/trampoline-specialty-program": "specialty-programs",
    "programs/water-ski-and-wake-boarding-specialty-program": "specialty-programs",
    "leadership-one-course": "leadership-courses",
    "leadership-two-program": "leadership-courses",
    "nccp-courses": "leadership-courses",
    "all-new-youth-leadership-program": "leadership-courses",
  }).map(([slug, categorySlug]) => [slug, category(categorySlug)]),
);

// Checked in order against the question; the first match wins. The rules
// reproduce the topic grouping of the published /faqs page.
export const KEYWORD_RULES = [
  ["leadership-courses", /\b(leadership (one|two)|nccp)\b/],
  ["working-at-camp", /\b(apply|days? off|hire|hiring|how old do i)\b/],
  ["alumni-and-community", /\balumni\b/],
  ["adult-camp", /\badults?\b/],
  ["before-you-enroll", /\b(slept away|how old does my child|shortest session|sleeps in the cabin|before we enroll)\b/],
  ["getting-there", /\b(get to camp|bus|airport|travel|visa|eta|english)\b/],
  ["dates-cost-and-enrolling", /\b(costs?|dates|enroll|session is full|pay|payment)\b/],
  ["health-safety-and-homesickness", /\b(doctor|nurse|counsellors|checked|homesick|medication|insured)\b/],
  ["the-camp-day", /\b(phone|cabin|activit(y|ies))\b/],
  ["staying-in-touch-food-and-visiting", /\b(write|letters?|visit|food|tuck|menu)\b/],
].map(([slug, pattern]) => [category(slug), pattern]);

const publishedId = (id) => id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");

const matchKeyword = (question) => {
  const text = (question ?? "").toLowerCase().replace(/[’‘]/g, "'");
  return KEYWORD_RULES.find(([, pattern]) => pattern.test(text))?.[0];
};

// FAQ id → usages sorted so the one that decides comes first:
// specific pages before the generic FAQs page, published pages before drafts,
// then earlier position, then page slug.
const collectUsages = (pages) => {
  const usages = new Map();
  for (const page of pages) {
    const slug = page.slug;
    const generic = slug === GENERIC_FAQ_PAGE;
    const refs = (page.sections ?? []).flatMap((section) => section.refs ?? []);
    if (refs.length === 0) continue;
    if (!generic && !PAGE_CATEGORIES.has(slug)) {
      throw new Error(`Page ${page._id} (${slug}) selects FAQs but has no FAQ category mapping`);
    }
    refs.forEach((ref, position) => {
      if (!ref) return;
      const id = publishedId(ref);
      if (!usages.has(id)) usages.set(id, []);
      usages.get(id).push({ slug, generic, draft: page._id !== publishedId(page._id), position });
    });
  }
  for (const list of usages.values()) {
    list.sort(
      (a, b) =>
        Number(a.generic) - Number(b.generic) ||
        Number(a.draft) - Number(b.draft) ||
        a.position - b.position ||
        a.slug.localeCompare(b.slug),
    );
  }
  return usages;
};

/**
 * Return one patch per FAQ document that has no category yet. The caller must
 * apply `set` with `ifRevisionId(plan._rev)`. Only `category` and `order` are
 * set, and an existing `order` is never replaced.
 */
export function createFaqCategoryPlans({ faqs, pages }) {
  const usages = collectUsages(pages);

  return faqs.flatMap((faq) => {
    if (!faq?._id || !faq?._rev) throw new Error("An FAQ must include _id and _rev");
    if (faq.category?._ref) return [];

    const usage = usages.get(publishedId(faq._id))?.[0];
    let source = "fallback";
    let categoryRef = FALLBACK_CATEGORY;
    if (usage && !usage.generic) {
      source = "page";
      categoryRef = PAGE_CATEGORIES.get(usage.slug);
    } else {
      const keywordCategory = matchKeyword(faq.title);
      if (keywordCategory) {
        source = "keyword";
        categoryRef = keywordCategory;
      }
    }

    const set = { category: { _type: "reference", _ref: categoryRef } };
    if (usage && typeof faq.order !== "number") set.order = usage.position + 1;
    return [{ _id: faq._id, _rev: faq._rev, source, page: usage?.slug ?? null, set }];
  });
}

const exportVerifiedBackup = (dataset) => {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const backup = resolve(backupDirectory, `${dataset}-${stamp}-faq-categories.tar.gz`);
  mkdirSync(backupDirectory, { recursive: true });
  execFileSync("pnpm", ["exec", "sanity", "datasets", "export", dataset, backup, "--raw"], {
    cwd: studioDirectory,
    stdio: "inherit",
  });
  execFileSync("gzip", ["-t", backup], { stdio: "inherit" });
  console.log(`Backup verified: ${backup}`);
};

async function run() {
  const apply = process.argv.includes("--apply");
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();
  assertCacProductionTarget({ dataset, projectId });

  const { faqs, pages } = await client.fetch(
    `{
      "faqs": *[_type == "faq"] | order(_id asc) { _id, _rev, title, category, order },
      "pages": *[count(blocks[_type == "faqAccordion"]) > 0] {
        _id,
        "slug": slug.current,
        "sections": blocks[_type == "faqAccordion"]{ _key, "refs": faqs[]._ref }
      }
    }`,
    {},
    { perspective: "raw" },
  );
  const plans = createFaqCategoryPlans({ faqs, pages });
  const titleById = new Map(faqs.map(({ _id, title }) => [_id, title]));
  const categoryTitle = new Map(FAQ_CATEGORIES.map(({ _id, title }) => [_id, title]));

  const describe = (plan) =>
    `${plan._id} → ${categoryTitle.get(plan.set.category._ref)} | ${titleById.get(plan._id)}`;
  const perCategory = {};
  for (const plan of plans) {
    const title = categoryTitle.get(plan.set.category._ref);
    perCategory[title] = (perCategory[title] ?? 0) + 1;
  }
  const summary = {
    mode: apply ? "apply" : "dry-run",
    projectId,
    dataset,
    faqs: faqs.length,
    plans: plans.length,
    byPage: plans.filter(({ source }) => source === "page").length,
    byKeyword: plans.filter(({ source }) => source === "keyword").map(describe),
    byFallback: plans.filter(({ source }) => source === "fallback").map(describe),
    perCategory,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!apply) return;

  exportVerifiedBackup(dataset);

  const transaction = client.transaction();
  for (const categoryDocument of FAQ_CATEGORIES) transaction.createIfNotExists(categoryDocument);
  for (const plan of plans) {
    transaction.patch(plan._id, (patch) => patch.ifRevisionId(plan._rev).set(plan.set));
  }
  await transaction.commit({ visibility: "sync" });

  const untagged = await client.fetch(
    `*[_type == "faq" && !defined(category._ref)]._id`,
    {},
    { perspective: "raw" },
  );
  if (untagged.length > 0) throw new Error(`FAQs still without a category: ${untagged.join(", ")}`);
  console.log(`Seeded ${FAQ_CATEGORIES.length} categories and tagged ${plans.length} FAQ document(s).`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
