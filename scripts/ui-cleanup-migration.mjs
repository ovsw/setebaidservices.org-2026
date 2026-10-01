import { isDeepStrictEqual } from "node:util";

export const BUILD_DAY_AGE_NOTE =
  "Building your own day is only for children over ten.";

const parentLabel = /^\s*(?:(?:\d{1,2}|[IVXLCDM]+)\s*[·.:-]\s*)?for\s+parents\s*[.!]?\s*$/i;

const parentLabelFields = new Set(["eyebrow", "label"]);

const creamWhenLegacyTrue = new Set([
  "benefitCards",
  "storyFeature",
  "featureCards",
  "stackedTimeline",
]);

const fixedBackgrounds = new Map([
  ["testimonials", "white"],
  ["latestArticles", "white"],
  ["richTextBlock", "white"],
  ["datesRatesSection", "cream"],
  ["imageCollageFeature", "cream"],
  ["includedExtras", "cream"],
  ["stackedFeatureRows", "cream"],
  ["bigImageList", "green"],
  ["directorCta", "green"],
  ["journey", "green"],
  ["largeSlides", "green"],
  ["packingChecklist", "green"],
  ["activitySchedule", "green"],
  ["activityCatalogue", "green"],
]);

const finalBackgroundExclusions = new Set([
  "facilitiesMapSection",
  "internationalCampersSection",
  "innerHero",
  "homeHero",
]);

const joinSentences = (first, second) =>
  [first, second]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim())
    .join(" ");

const addBuildDayAgeNote = (description) => {
  if (typeof description !== "string" || !description.trim()) {
    return BUILD_DAY_AGE_NOTE;
  }
  if (description.includes(BUILD_DAY_AGE_NOTE)) return description;
  return joinSentences(description, BUILD_DAY_AGE_NOTE);
};

const migrateBackground = (section) => {
  if (!section._type) return false;
  const hasLegacyBackground =
    section._type === "faqAccordion" ||
    creamWhenLegacyTrue.has(section._type) ||
    section._type === "teamMembers";
  if (Object.hasOwn(section, "background")) {
    return hasLegacyBackground && Object.hasOwn(section, "useCreamBackground");
  }
  if (section._type === "faqAccordion") {
    section.background = section.useCreamBackground === false ? "green" : "cream";
  } else if (creamWhenLegacyTrue.has(section._type)) {
    section.background = section.useCreamBackground === true ? "cream" : "green";
  } else if (section._type === "teamMembers") {
    section.background = section.useCreamBackground ? "cream" : "white";
  } else if (section._type === "ctaBanner") {
    section.background = section.variant === "nudge" ? "white" : "green";
  } else if (fixedBackgrounds.has(section._type)) {
    section.background = fixedBackgrounds.get(section._type);
  }
  return hasLegacyBackground && Object.hasOwn(section, "useCreamBackground");
};

const cleanValue = (value, documentId) => {
  if (Array.isArray(value)) return value.map((item) => cleanValue(item, documentId));
  if (!value || typeof value !== "object") return value;

  const cleaned = Object.fromEntries(
    Object.entries(value)
      .filter(([field, fieldValue]) =>
        !(parentLabelFields.has(field) && typeof fieldValue === "string" && parentLabel.test(fieldValue)),
      )
      .map(([field, fieldValue]) => [field, cleanValue(fieldValue, documentId)]),
  );

  if (cleaned._type === "activitySchedule") {
    delete cleaned.aside;
    if (documentId === "activities" || documentId === "drafts.activities") {
      cleaned.description = addBuildDayAgeNote(cleaned.description);
    }
  }

  if (cleaned._type === "activityCatalogueGroup" && typeof cleaned.aside === "string") {
    cleaned.blurb = joinSentences(cleaned.blurb, cleaned.aside);
    delete cleaned.aside;
  }

  if (migrateBackground(cleaned)) delete cleaned.useCreamBackground;

  return cleaned;
};

/**
 * Return the changed document fields for an optimistic-concurrency Sanity patch.
 * The caller must apply `set` and `unset` with `ifRevisionId(plan._rev)`.
 */
export function createUiCleanupPlan(document) {
  if (!document?._id || !document?._rev) {
    throw new Error("A migration document must include _id and _rev");
  }

  const cleaned = cleanValue(structuredClone(document), document._id);
  if (Array.isArray(cleaned.blocks) && cleaned.blocks.length > 0) {
    const finalBlock = cleaned.blocks.at(-1);
    if (
      finalBlock?.background === "green" &&
      !finalBackgroundExclusions.has(finalBlock._type)
    ) {
      finalBlock.background = "cream";
    }
  }
  if (document._type === "activity" && Object.hasOwn(cleaned, "beginnerFriendly")) {
    delete cleaned.beginnerFriendly;
  }

  const set = {};
  const unset = [];
  for (const field of new Set([...Object.keys(document), ...Object.keys(cleaned)])) {
    if (field.startsWith("_")) continue;
    if (!(field in cleaned)) {
      unset.push(field);
    } else if (!(field in document) || !isDeepStrictEqual(document[field], cleaned[field])) {
      set[field] = cleaned[field];
    }
  }

  if (Object.keys(set).length === 0 && unset.length === 0) return null;
  return { _id: document._id, _rev: document._rev, set, unset };
}

export const createUiCleanupPlans = (documents) =>
  documents.map(createUiCleanupPlan).filter(Boolean);
