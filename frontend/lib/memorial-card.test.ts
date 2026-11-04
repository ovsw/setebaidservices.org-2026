import { describe, expect, it } from "vitest";
import {
  emptyMemorialCardDraft,
  firstStepWithError,
  type MemorialCardDraft,
  memorialCardErrors,
  memorialCardStepErrors,
  OWN_WORDS,
  STEP_FIELDS,
  validateMemorialCard,
} from "@/lib/memorial-card";
import { validDraft } from "@/test/memorial-card-draft";

function formData(draft: Partial<MemorialCardDraft>) {
  const data = new FormData();
  for (const [field, value] of Object.entries(draft)) data.set(field, value);
  return data;
}

describe("memorialCardStepErrors", () => {
  it("rejects only the current step's errors", () => {
    // Step 1 is filled in; every later step is empty.
    const draft = {
      ...emptyMemorialCardDraft,
      tribute: "honor",
      honoreeName: "Coach Miller",
      amount: "50",
      giveBy: "check",
    };

    expect(memorialCardStepErrors(0, draft)).toEqual({});
    const second = memorialCardStepErrors(1, draft);
    expect(Object.keys(second).sort()).toEqual([...STEP_FIELDS[1]].sort());
    expect(Object.keys(memorialCardErrors(draft)).length).toBeGreaterThan(Object.keys(second).length);
  });

  it("names each missing answer of a step, and no answer of another step", () => {
    const errors = memorialCardStepErrors(0, emptyMemorialCardDraft);

    expect(errors).toEqual({
      tribute: expect.any(String),
      honoreeName: "Enter the person's full name.",
      amount: "Enter the amount of your gift.",
      giveBy: "Choose how you will give.",
    });
  });

  it("asks for the donor's own words only when Other is chosen", () => {
    expect(memorialCardStepErrors(2, { ...validDraft, messageChoice: OWN_WORDS })).toEqual({
      customMessage: "Write the words for the card.",
    });
    expect(memorialCardStepErrors(2, validDraft)).toEqual({});
  });

  it("refuses an amount that is not dollars", () => {
    for (const amount of ["0", "fifty", "12.345", "-5", "2000000"]) {
      expect(memorialCardStepErrors(0, { ...validDraft, amount })).toHaveProperty("amount");
    }
  });

  it("finds the first step with an error", () => {
    expect(firstStepWithError({ donorEmail: "x", recipientZip: "y" })).toBe(1);
    expect(firstStepWithError({})).toBeUndefined();
  });
});

describe("validateMemorialCard", () => {
  it("turns a valid entry into the request the office receives", () => {
    const result = validateMemorialCard(formData(validDraft));

    expect(result).toEqual({
      ok: true,
      request: expect.objectContaining({
        amount: "1250.50",
        cardMessage: validDraft.messageChoice,
        cardMessageIsOwnWords: false,
      }),
    });
    expect(result.ok && result.request).not.toHaveProperty("messageChoice");
  });

  it("prints the donor's own words, and drops an occasion on a memorial gift", () => {
    const result = validateMemorialCard(
      formData({ ...validDraft, messageChoice: OWN_WORDS, customMessage: "We miss you, Ruth.", occasion: "Birthday" }),
    );

    expect(result.ok && result.request).toMatchObject({
      cardMessage: "We miss you, Ruth.",
      cardMessageIsOwnWords: true,
      occasion: "",
    });
  });
});
