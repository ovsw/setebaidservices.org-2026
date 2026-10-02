import { stegaClean } from "next-sanity";
import { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";

/**
 * Section boundary resolver.
 *
 * Walks a page's block list once on the server and decides, for each
 * section, whether its top and bottom meet the neighbour at a seam (same
 * resolved background, nothing tucks, no hero above) or at an edge. The
 * global stylesheet maps the resulting boolean data attributes to the
 * `--section-pad-top` / `--section-pad-bottom` custom properties that the
 * `py-section` utility reads. This module never reads the DOM.
 */

export type Block =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

/** The three values editors can pick in Studio. */
export type EditorBackground = "white" | "cream" | "green";

/** Editor values plus the two backgrounds only the trait table can assign. */
export type SectionBackground = EditorBackground | "night" | "photo";

export type SectionTrait = {
  /** Fixed background. When set, the editor field is ignored for this type. */
  background?: SectionBackground;
  /**
   * Tucks under a photo hero: its rounded top overlaps the hero by
   * `--section-overlap`. Elsewhere tucks follow the smile/tuck alternation
   * like any section. See `resolveSectionBoundaries`.
   */
  tuck?: boolean;
  /** Full-bleed hero. The boundary below a hero is always an edge. */
  hero?: boolean;
  /**
   * The section flips its photo to the other side when it follows another
   * section of the same type that also has a photo. Consecutive sections of
   * one alternating type, each with a photo, form a run; odd positions in the
   * run render mirrored. See `resolveSectionBoundaries`.
   */
  alternate?: boolean;
};

/**
 * Static trait table. `Record` (not `Partial`) so that a new block type in
 * the union fails typecheck until it gets an entry here.
 *
 * Heroes are declared `photo`: `innerHero` always renders a photo, and `hero`
 * renders a photo when one is set and a pine-night glow otherwise.
 * `homeHero` sits on the Cream field beside a round photo, so it is `white`.
 * Because a hero forces an edge below it regardless, the exact value never
 * changes a boundary; it records what the design intends.
 */
export const sectionTraits: Record<Block["_type"], SectionTrait> = {
  benefitCards: {},
  bigImageList: {},
  ctaBanner: { tuck: true },
  directorCta: { tuck: true },
  faqAccordion: {},
  faqHub: {},
  pricingSingleToggle: {},
  featureCards: { tuck: true },
  hero: { background: "photo", hero: true },
  headingImage: {},
  homeHero: { background: "white", hero: true },
  imageCollageFeature: {},
  includedExtras: {},
  innerHero: { background: "photo", hero: true },
  internationalCampersSection: { background: "night", tuck: true },
  journey: {},
  largeSlides: {},
  latestArticles: {},
  packingChecklist: {},
  richTextBlock: {},
  stackedFeatureRows: {},
  stackedTimeline: {},
  storyFeature: { alternate: true },
  teamMembers: {},
  quoteWall: {},
  wordSwap: {},
  flipCards: {},
  photoStrip: {},
  pricingTiers: {},
};

export type SectionBoundary = {
  background: SectionBackground;
  /** Top meets the section above at a seam (half rhythm). */
  seamTop: boolean;
  /** Bottom meets the section below at a seam (half rhythm). */
  seamBottom: boolean;
  /** This section overlaps the one above. */
  tuck: boolean;
  /** The next section (or the footer) tucks under this one's bottom edge. */
  tuckBelow: boolean;
  /** Odd position in a run of alternating sections: photo on the other side. */
  mirror: boolean;
  /** The section above hangs a smile curve into this one's top. */
  smileAbove: boolean;
  /** This section hangs a smile curve into the section below. */
  smileBelow: boolean;
  /** This section slides under the rounded bottom of the photo card above. */
  under: boolean;
  /** This photo card rounds its bottom corners over the section below. */
  overhang: boolean;
};

/**
 * Block types with a fixed background in the trait table. The GROQ projection
 * omits `background` for these, so the type guard below has to exclude them
 * by `_type`; keep this list and the table's `background` entries in step.
 */
type FixedBackgroundType =
  | "hero"
  | "homeHero"
  | "innerHero"
  | "internationalCampersSection";

/** Blocks whose GROQ projection carries the editor `background` field. */
export type EditorBackgroundBlock = Exclude<Block, { _type: FixedBackgroundType }>;

export function hasEditorBackground(block: Block): block is EditorBackgroundBlock {
  return sectionTraits[block._type].background === undefined;
}

export function isEditorBackground(
  background: SectionBackground,
): background is EditorBackground {
  return background === "white" || background === "cream" || background === "green";
}

/**
 * Editor-chosen background with the legacy fallback ladder for documents
 * that predate the `background` field. A final Green section renders as
 * Cream so the page does not end on green against the night footer.
 */
export function resolveEditorBackground(block: Block, isFinal: boolean): EditorBackground {
  const background = "background" in block ? stegaClean(block.background) : undefined;
  if (background === "cream" || background === "green" || background === "white") {
    return isFinal && background === "green" ? "cream" : background;
  }

  const legacyBlock = block as Block & { useCreamBackground?: boolean | null; variant?: string | null };
  const cream = legacyBlock.useCreamBackground === true;
  const legacyBackground: EditorBackground =
    block._type === "teamMembers"
      ? cream
        ? "cream"
        : "white"
      : block._type === "faqAccordion"
        ? legacyBlock.useCreamBackground === false
          ? "green"
          : "cream"
        : ["benefitCards", "storyFeature", "featureCards", "stackedTimeline"].includes(block._type)
          ? cream
            ? "cream"
            : "green"
          : block._type === "ctaBanner"
            ? stegaClean(legacyBlock.variant) === "nudge"
              ? "white"
              : "green"
            : [
                  "bigImageList",
                  "directorCta",
                  "journey",
                  "largeSlides",
                  "packingChecklist",
                ].includes(block._type)
              ? "green"
              : [
                    "imageCollageFeature",
                    "includedExtras",
                    "stackedFeatureRows",
                  ].includes(block._type)
                ? "cream"
                : "white";

  return isFinal && legacyBackground === "green" ? "cream" : legacyBackground;
}

export function resolveSectionBackground(block: Block, isFinal: boolean): SectionBackground {
  // The photo CTA banner fills itself with a dark photo whatever the editor
  // field says, so its neighbours must meet it as a photo, not as the field.
  if (block._type === "ctaBanner" && stegaClean(block.variant) === "photo") return "photo";
  return sectionTraits[block._type].background ?? resolveEditorBackground(block, isFinal);
}

/**
 * Two backgrounds that paint the same colour. Night and Green are both the
 * ink field, so a smile between them would be invisible.
 */
function sameFill(a: SectionBackground, b: SectionBackground): boolean {
  const fill = (background: SectionBackground) => (background === "night" ? "green" : background);
  return fill(a) === fill(b);
}

/**
 * A block takes part in a run only when it carries a photo. An alternating
 * section without one has nothing to flip, so it ends the run rather than
 * taking a position in it.
 */
function hasPhoto(block: Block): boolean {
  const image = (block as Block & { image?: { asset?: { _id?: string } | null } | null }).image;
  return Boolean(image?.asset?._id);
}

/**
 * How a section's top meets the section above.
 * - `seam`: same background, half rhythm, no shape.
 * - `straight`: a plain edge.
 * - `smile`: the upper colour hangs a smile curve into this section.
 * - `tuck`: this section's rounded top overlaps the section above.
 * - `under`: this section slides under the rounded bottom of a photo card.
 */
export type SectionEdge = "seam" | "straight" | "smile" | "tuck" | "under";

/**
 * Rules:
 * - the first section's top is a straight edge;
 * - two neighbours meet at a seam when they resolve to the same background
 *   and the upper one is not a hero;
 * - a full-width photo section that is not a hero is a card with four
 *   rounded corners: it tucks over the section above, and the section below
 *   slides under its rounded bottom;
 * - below a photo hero only a tucker tucks; every other section meets the
 *   hero at a straight edge;
 * - Green and Night paint the same colour, so they meet at a straight edge;
 * - every other edge between two colours is shaped, and shaped edges
 *   alternate down the page: smile, tuck, smile, tuck. A forced tuck takes
 *   part in the alternation: the free edges before it are planned backwards
 *   so the edge just before it is a smile. Where a run of free edges sits
 *   between two forced tucks and has an even length, two edges of one shape
 *   meet; that is the one case the alternation cannot avoid;
 * - the last section's bottom is an edge, and the footer tucks under it;
 * - consecutive sections of one alternating type, each with a photo, form a
 *   run, and odd positions in that run render mirrored. Background never
 *   affects run membership: an editor may alternate cream and green inside a
 *   run and still get the flip.
 */
export function resolveSectionBoundaries(blocks: readonly Block[]): SectionBoundary[] {
  const sections = blocks.map((block, index) => {
    const trait = sectionTraits[block._type];
    const background = resolveSectionBackground(block, index === blocks.length - 1);
    return {
      background,
      tucker: trait.tuck === true,
      hero: trait.hero === true,
      photoCard: background === "photo" && trait.hero !== true,
      type: block._type,
      alternating: trait.alternate === true && hasPhoto(block),
    };
  });

  // Zero-based position in the current run; -1 outside one.
  let runPosition = -1;
  const mirrors = sections.map((section, index) => {
    const above = sections[index - 1];
    const continues =
      section.alternating && above?.alternating === true && above.type === section.type;
    runPosition = section.alternating ? (continues ? runPosition + 1 : 0) : -1;
    return runPosition % 2 === 1;
  });

  // First pass: fixed edges, with `free` marking a shaped edge whose shape
  // the alternation decides.
  const edges = sections.map((section, index): SectionEdge | "free" => {
    const above = sections[index - 1];
    if (above === undefined) return "straight";
    if (!above.hero && above.background === section.background) return "seam";
    if (above.photoCard) return "under";
    if (section.photoCard) return "tuck";
    if (above.background === "photo") return section.tucker ? "tuck" : "straight";
    if (sameFill(above.background, section.background)) return "straight";
    return "free";
  });
  // Second pass: free edges alternate. A forced tuck (or the rounded bottom
  // of a photo card) counts as a tuck. A run of free edges that ends at a
  // forced tuck alternates backwards from it, so the edge before it is a
  // smile; the last run alternates forwards, starting with a smile after a
  // tuck.
  const shaped = (edge: SectionEdge | "free") => edge === "free" || edge === "tuck" || edge === "under";
  let run: number[] = [];
  const fill = (runEnd: "forced" | "end") => {
    run.forEach((edgeIndex, position) => {
      const fromForced = runEnd === "forced" ? run.length - 1 - position : position;
      edges[edgeIndex] = fromForced % 2 === 0 ? "smile" : "tuck";
    });
    run = [];
  };
  edges.forEach((edge, index) => {
    if (edge === "free") run.push(index);
    else if (shaped(edge)) fill("forced");
  });
  fill("end");

  const resolved = edges as SectionEdge[];
  return sections.map((section, index) => {
    const edge = resolved[index];
    const below = resolved[index + 1];
    return {
      background: section.background,
      seamTop: edge === "seam",
      seamBottom: below === "seam",
      tuck: edge === "tuck",
      tuckBelow: below === undefined || below === "tuck",
      mirror: mirrors[index],
      smileAbove: edge === "smile",
      smileBelow: below === "smile",
      under: edge === "under",
      overhang: below === "under",
    };
  });
}

export type SectionBand = {
  background: SectionBackground;
  /** Index of the first section in the band. */
  start: number;
  /** Index after the last section in the band. */
  end: number;
  /** The first section tucks over the section above, so the band's top is rounded. */
  tuck: boolean;
  /** The last section hangs a smile curve into the next band. */
  smile: boolean;
  /** The last section is a photo card whose rounded bottom hangs over the next band. */
  overhang: boolean;
  /**
   * Stacking layer (z-index). A band that smiles or overhangs sits one
   * layer above the band below it, so its curve or corners paint over that
   * band even when that band smiles too. At a tuck the two share a layer
   * and DOM order lifts the tucker. The last band is layer 1, level with
   * the footer that tucks under it.
   */
  layer: number;
};

/**
 * Groups consecutive sections joined by seams into bands. Sections in one
 * band share a resolved background and read as one continuous surface, so
 * the stylesheet paints surface texture once per band rather than once per
 * section. A boundary that is an edge always starts a new band.
 */
export function resolveSectionBands(boundaries: readonly SectionBoundary[]): SectionBand[] {
  const bands: SectionBand[] = [];
  boundaries.forEach((boundary, index) => {
    const current = bands[bands.length - 1];
    if (current !== undefined && boundary.seamTop) {
      current.end = index + 1;
      current.smile = boundary.smileBelow;
      current.overhang = boundary.overhang;
      return;
    }
    bands.push({
      background: boundary.background,
      start: index,
      end: index + 1,
      tuck: boundary.tuck,
      smile: boundary.smileBelow,
      overhang: boundary.overhang,
      layer: 1,
    });
  });
  for (let index = bands.length - 2; index >= 0; index -= 1) {
    bands[index].layer = bands[index + 1].layer + (bands[index].smile || bands[index].overhang ? 1 : 0);
  }
  return bands;
}
