import { describe, expect, it } from "vitest";
import { resolveSectionBands, resolveSectionBoundaries, type Block } from "./section-boundaries";

function block(_type: Block["_type"], background?: "white" | "cream" | "green"): Block {
  return { _type, _key: `${_type}-${background ?? "fixed"}`, background } as unknown as Block;
}

let keySeed = 0;

/** A story feature, with or without a photo: only a photo joins a run. */
function story(background: "white" | "cream" | "green" = "cream", photo = true): Block {
  keySeed += 1;
  return {
    _type: "storyFeature",
    _key: `story-${keySeed}`,
    background,
    image: photo ? { asset: { _id: `image-${keySeed}` } } : null,
  } as unknown as Block;
}

function mirrors(blocks: Block[]) {
  return resolveSectionBoundaries(blocks).map((boundary) => boundary.mirror);
}

function booleans(blocks: Block[]) {
  return resolveSectionBoundaries(blocks).map(({ seamTop, seamBottom, tuck, tuckBelow }) => ({
    seamTop,
    seamBottom,
    tuck,
    tuckBelow,
  }));
}

describe("resolveSectionBoundaries", () => {
  it("gives a single section two edges and a tucking footer", () => {
    expect(booleans([block("benefitCards", "cream")])).toEqual([
      { seamTop: false, seamBottom: false, tuck: false, tuckBelow: true },
    ]);
  });

  it("joins two same-background sections at a seam", () => {
    expect(booleans([block("benefitCards", "cream"), block("faqAccordion", "cream")])).toEqual([
      { seamTop: false, seamBottom: true, tuck: false, tuckBelow: false },
      { seamTop: true, seamBottom: false, tuck: false, tuckBelow: true },
    ]);
  });

  it("keeps an edge between two different backgrounds", () => {
    expect(booleans([block("benefitCards", "cream"), block("faqAccordion", "white")])).toEqual([
      { seamTop: false, seamBottom: false, tuck: false, tuckBelow: false },
      { seamTop: false, seamBottom: false, tuck: false, tuckBelow: true },
    ]);
  });

  it("seams a tucker onto a matching background instead of tucking", () => {
    expect(booleans([block("faqAccordion", "cream"), block("featureCards", "cream")])).toEqual([
      { seamTop: false, seamBottom: true, tuck: false, tuckBelow: false },
      { seamTop: true, seamBottom: false, tuck: false, tuckBelow: true },
    ]);
  });

  it("alternates shaped edges: smile, then tuck, then smile", () => {
    const result = resolveSectionBoundaries([
      block("benefitCards", "green"),
      block("faqAccordion", "cream"),
      block("journey", "green"),
      block("richTextBlock", "white"),
    ]);
    expect(result.map(({ smileAbove, tuck }) => ({ smileAbove, tuck }))).toEqual([
      { smileAbove: false, tuck: false },
      { smileAbove: true, tuck: false },
      { smileAbove: false, tuck: true },
      { smileAbove: true, tuck: false },
    ]);
    expect(result[1].tuckBelow).toBe(true);
  });

  it("does not tuck a first section under nothing", () => {
    expect(booleans([block("ctaBanner", "green")])).toEqual([
      { seamTop: false, seamBottom: false, tuck: false, tuckBelow: true },
    ]);
  });

  it("puts an edge after a hero and lets the tucker tuck", () => {
    expect(booleans([block("innerHero"), block("directorCta", "cream")])).toEqual([
      { seamTop: false, seamBottom: false, tuck: false, tuckBelow: true },
      { seamTop: false, seamBottom: false, tuck: true, tuckBelow: true },
    ]);
  });

  it("treats the end of the list as an edge before the tucking footer", () => {
    const result = resolveSectionBoundaries([
      block("benefitCards", "white"),
      block("faqAccordion", "white"),
    ]);
    expect(result[1].seamBottom).toBe(false);
    expect(result[1].tuckBelow).toBe(true);
  });

  it("resolves a final Green section to Cream so it no longer seams with green above", () => {
    const result = resolveSectionBoundaries([
      block("benefitCards", "green"),
      block("faqAccordion", "green"),
    ]);
    expect(result[1].background).toBe("cream");
    expect(result[0].seamBottom).toBe(false);
    expect(result[1].seamTop).toBe(false);
  });

  it("compares a fixed-background section by its trait, not the editor field", () => {
    const result = resolveSectionBoundaries([
      block("internationalCampersSection"),
      { ...block("internationalCampersSection"), _key: "internationalCampersSection-second" } as Block,
    ]);
    expect(result[0].background).toBe("night");
    expect(result[1].background).toBe("night");
    // Same colour: the lower tucker has nothing to curve against, so it seams.
    expect(result[0].seamBottom).toBe(true);
    expect(result[1].seamTop).toBe(true);
    expect(result[1].tuck).toBe(false);
    expect(result[0].tuckBelow).toBe(false);
  });
});

describe("resolveSectionBoundaries smile", () => {
  function smiles(blocks: Block[]) {
    return resolveSectionBoundaries(blocks).map(({ smileAbove, smileBelow }) => ({
      smileAbove,
      smileBelow,
    }));
  }

  it("hangs a smile between two different solid colours", () => {
    expect(smiles([block("benefitCards", "white"), block("faqAccordion", "green")])).toEqual([
      { smileAbove: false, smileBelow: true },
      { smileAbove: true, smileBelow: false },
    ]);
  });

  it("does not smile at a seam or above the footer", () => {
    expect(smiles([block("benefitCards", "cream"), block("faqAccordion", "cream")])).toEqual([
      { smileAbove: false, smileBelow: false },
      { smileAbove: false, smileBelow: false },
    ]);
  });


  it("keeps a straight edge below a photo hero", () => {
    expect(smiles([block("innerHero"), block("faqAccordion", "cream")])[1].smileAbove).toBe(false);
  });

  it("smiles below the solid home hero", () => {
    expect(smiles([block("homeHero"), block("wordSwap", "green")])[0].smileBelow).toBe(true);
  });

  it("does not smile between Green and Night, which share a colour", () => {
    expect(
      smiles([block("wordSwap", "green"), block("internationalCampersSection")])[1].smileAbove,
    ).toBe(false);
  });
});

describe("resolveSectionBands layer", () => {
  it("stacks each smiling band above the next and keeps the last at the footer's layer", () => {
    const bands = resolveSectionBands(
      resolveSectionBoundaries([
        block("benefitCards", "cream"),
        block("faqAccordion", "white"),
        block("journey", "green"),
        block("ctaBanner", "cream"),
      ]),
    );
    // Edges: smile, tuck, smile.
    expect(bands.map(({ smile, layer }) => ({ smile, layer }))).toEqual([
      { smile: true, layer: 3 },
      { smile: false, layer: 2 },
      { smile: true, layer: 2 },
      { smile: false, layer: 1 },
    ]);
  });
});

describe("resolveSectionBoundaries photo CTA banner", () => {
  it("follows a forced tuck with a smile", () => {
    const banner = { ...block("ctaBanner", "cream"), variant: "photo" } as Block;
    const result = resolveSectionBoundaries([
      block("benefitCards", "green"),
      banner,
      block("faqAccordion", "cream"),
      block("richTextBlock", "white"),
    ]);
    expect(result[1].tuck).toBe(true);
    expect(result[2].under).toBe(true);
    expect(result[3].smileAbove).toBe(true);
  });

  it("plans the edges before a photo card backwards so a smile meets its tuck", () => {
    const banner = { ...block("ctaBanner", "cream"), variant: "photo" } as Block;
    const result = resolveSectionBoundaries([
      block("benefitCards", "green"),
      block("faqAccordion", "cream"),
      block("richTextBlock", "white"),
      banner,
      block("journey", "cream"),
    ]);
    expect(result.map(({ smileAbove, tuck, under }) => ({ smileAbove, tuck, under }))).toEqual([
      { smileAbove: false, tuck: false, under: false },
      { smileAbove: false, tuck: true, under: false },
      { smileAbove: true, tuck: false, under: false },
      { smileAbove: false, tuck: true, under: false },
      { smileAbove: false, tuck: false, under: true },
    ]);
  });

  it("resolves the photo banner as a photo whatever the editor background says", () => {
    const banner = { ...block("ctaBanner", "cream"), variant: "photo" } as Block;
    const result = resolveSectionBoundaries([
      block("stackedTimeline", "cream"),
      banner,
      block("imageCollageFeature", "cream"),
    ]);
    expect(result[1].background).toBe("photo");
    expect(result[1].tuck).toBe(true);
    expect(result[1].overhang).toBe(true);
    expect(result[2].under).toBe(true);
    expect(result[2].tuck).toBe(false);
    expect(result[0].seamBottom).toBe(false);
    expect(result[2].seamTop).toBe(false);
    expect(result[2].smileAbove).toBe(false);
  });
});

describe("resolveSectionBoundaries mirror", () => {
  it("leaves a lone story feature unmirrored", () => {
    expect(mirrors([story()])).toEqual([false]);
  });

  it("mirrors the second of two consecutive story features", () => {
    expect(mirrors([story(), story()])).toEqual([false, true]);
  });

  it("mirrors only the middle of three", () => {
    expect(mirrors([story(), story(), story()])).toEqual([false, true, false]);
  });

  it("ends the run at a story feature without a photo", () => {
    expect(mirrors([story("cream", true), story("cream", false), story("cream", true)])).toEqual([
      false,
      false,
      false,
    ]);
  });

  it("ends the run at a section of a different type", () => {
    expect(mirrors([story(), block("benefitCards", "cream"), story()])).toEqual([
      false,
      false,
      false,
    ]);
  });

  it("ignores background when counting positions in a run", () => {
    expect(mirrors([story("cream"), story("green"), story("cream")])).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("starts a fresh run after a hero", () => {
    expect(mirrors([block("innerHero"), story(), story()])).toEqual([false, false, true]);
  });

  it("does not mirror a section type without the alternate trait", () => {
    expect(mirrors([block("benefitCards", "cream"), block("benefitCards", "cream")])).toEqual([
      false,
      false,
    ]);
  });
});
