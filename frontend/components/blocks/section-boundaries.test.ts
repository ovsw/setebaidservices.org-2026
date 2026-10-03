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

  it("gives each section one shape and alternates the shapes up from the footer", () => {
    const result = resolveSectionBoundaries([
      block("benefitCards", "green"),
      block("faqAccordion", "cream"),
      block("packingChecklist", "green"),
      block("richTextBlock", "white"),
      block("bigImageList", "green"),
      block("teamMembers", "white"),
    ]);
    // Edges: straight, tuck, straight, smile, straight, straight, footer tuck.
    expect(result.map(({ smileAbove, tuck }) => ({ smileAbove, tuck }))).toEqual([
      { smileAbove: false, tuck: false },
      { smileAbove: false, tuck: true },
      { smileAbove: false, tuck: false },
      { smileAbove: true, tuck: false },
      { smileAbove: false, tuck: false },
      { smileAbove: false, tuck: false },
    ]);
    for (const boundary of result) {
      const top = boundary.tuck || boundary.smileAbove;
      const bottom = boundary.smileBelow || boundary.tuckBelow;
      if (boundary !== result[result.length - 1]) expect(top && bottom).toBe(false);
    }
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
});

describe("resolveSectionBoundaries smile", () => {
  function smiles(blocks: Block[]) {
    return resolveSectionBoundaries(blocks).map(({ smileAbove, smileBelow }) => ({
      smileAbove,
      smileBelow,
    }));
  }

  it("hangs a smile between two different solid colours", () => {
    expect(
      smiles([
        block("benefitCards", "white"),
        block("faqAccordion", "green"),
        block("richTextBlock", "white"),
      ]),
    ).toEqual([
      { smileAbove: false, smileBelow: true },
      { smileAbove: true, smileBelow: false },
      { smileAbove: false, smileBelow: false },
    ]);
  });

  it("treats seam-joined sections as one surface with one shape", () => {
    const result = resolveSectionBoundaries([
      block("benefitCards", "white"),
      block("faqAccordion", "cream"),
      block("packingChecklist", "cream"),
      block("richTextBlock", "white"),
      block("teamMembers", "green"),
      block("bigImageList", "white"),
    ]);
    expect(result[1].smileAbove || result[1].tuck).toBe(true);
    expect(result[3].smileAbove || result[3].tuck).toBe(false);
  });

  it("keeps the edge above the last section straight, since the footer tucks under it", () => {
    expect(smiles([block("benefitCards", "white"), block("faqAccordion", "green")])[1].smileAbove).toBe(
      false,
    );
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
    expect(
      smiles([block("homeHero"), block("wordSwap", "green"), block("richTextBlock", "white")])[0]
        .smileBelow,
    ).toBe(true);
  });
});

describe("resolveSectionBands layer", () => {
  it("stacks each smiling band above the next and keeps the last at the footer's layer", () => {
    const bands = resolveSectionBands(
      resolveSectionBoundaries([
        block("benefitCards", "cream"),
        block("faqAccordion", "white"),
        block("packingChecklist", "green"),
        block("ctaBanner", "cream"),
      ]),
    );
    // Edges: smile, straight, straight.
    expect(bands.map(({ smile, layer }) => ({ smile, layer }))).toEqual([
      { smile: true, layer: 2 },
      { smile: false, layer: 1 },
      { smile: false, layer: 1 },
      { smile: false, layer: 1 },
    ]);
  });
});

describe("resolveSectionBoundaries photo CTA banner", () => {
  const banner = () => ({ ...block("ctaBanner", "cream"), variant: "photo" }) as Block;

  it("meets both neighbours at straight edges", () => {
    const result = resolveSectionBoundaries([
      block("stackedTimeline", "cream"),
      banner(),
      block("imageCollageFeature", "cream"),
      block("richTextBlock", "white"),
    ]);
    expect(result[1].background).toBe("photo");
    expect(result[0].seamBottom).toBe(false);
    expect(result[0].smileBelow).toBe(false);
    expect(result[1].tuck).toBe(false);
    expect(result[1].tuckBelow).toBe(false);
    expect(result[1].smileBelow).toBe(false);
    expect(result[2].seamTop).toBe(false);
  });

  it("does not tuck under a photo hero", () => {
    expect(resolveSectionBoundaries([block("innerHero"), banner()])[1].tuck).toBe(false);
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
