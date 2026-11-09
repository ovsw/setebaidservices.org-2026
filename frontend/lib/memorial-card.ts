import { z } from "zod";
import type { FormSendResult } from "@/lib/form-entry";
import { isUsState } from "@/lib/us-states";

/**
 * The memorial card form: what a donor types into its four steps. The
 * browser checks one step at a time; the server checks the whole entry
 * again with the same rules. The office uses the amount to match the card to
 * the gift; the family never sees it.
 */

/** The radio value for "Other": the donor writes the words for the card. */
export const OWN_WORDS = "other";

export const TRIBUTES = { memory: "In memory of", honor: "In honor of" } as const;
export const GIVE_BY = { online: "Online in Camp Brain", check: "By check in the mail" } as const;

const text = (max: number) => z.string().trim().max(max, "This answer is too long.");
const required = (max: number, message: string) => text(max).min(1, message);

const phone = (message: string) =>
  text(30)
    .min(1, message)
    .refine(
      (value) => /^[0-9+()\-. ]*$/.test(value) && value.replace(/\D/g, "").length >= 7,
      "Enter a phone number with at least 7 digits.",
    );

/** A two-letter code from the state dropdown, such as "PA". */
const state = (message: string) => z.string().trim().refine(isUsState, message);

const zip = (message: string) =>
  text(12)
    .min(1, message)
    .refine((value) => /^[0-9A-Za-z][0-9A-Za-z -]{2,11}$/.test(value), "Enter a zip code like 17889.");

/** "$1,250.50", "1250.5" or "25" become "1250.50", "1250.50" and "25.00". */
const AMOUNT = /^\$?\s*(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/;
const amount = text(20)
  .min(1, "Enter the amount of your gift.")
  .refine((value) => AMOUNT.test(value), "Enter an amount in dollars, like 50 or 50.00.")
  .refine((value) => {
    const dollars = Number(value.replace(/[$,\s]/g, ""));
    return dollars >= 1 && dollars <= 1_000_000;
  }, "Enter an amount between $1 and $1,000,000.");

const tribute = z.enum(["memory", "honor"], { error: "Choose “In memory of” or “In honor of”." });
const giveBy = z.enum(["online", "check"], { error: "Choose how you will give." });

const stepShapes = [
  {
    tribute,
    honoreeName: required(100, "Enter the person's full name."),
    occasion: text(100),
    amount,
    giveBy,
  },
  {
    recipientName: required(100, "Enter the name of the person who gets the card."),
    recipientStreet: required(200, "Enter their street address."),
    recipientCity: required(100, "Enter their city."),
    recipientState: state("Choose their state."),
    recipientZip: zip("Enter their zip code."),
  },
  {
    cardDesign: required(100, "Choose a card."),
    messageChoice: required(500, "Choose the words printed inside the card."),
    customMessage: text(500),
  },
  {
    donorName: required(100, "Enter your name."),
    donorStreet: required(200, "Enter your street address."),
    donorCity: required(100, "Enter your city."),
    donorState: state("Choose your state."),
    donorZip: zip("Enter your zip code."),
    donorPhone: phone("Enter your phone number."),
    donorEmail: text(200)
      .min(1, "Enter your email address.")
      .pipe(z.email("Enter an email address like name@example.com.")),
  },
] as const;

const draftSchema = z
  .object({ ...stepShapes[0], ...stepShapes[1], ...stepShapes[2], ...stepShapes[3] })
  .superRefine((draft, context) => {
    if (draft.messageChoice === OWN_WORDS && !draft.customMessage) {
      context.addIssue({
        code: "custom",
        path: ["customMessage"],
        message: "Write the words for the card.",
      });
    }
  });

type DraftOutput = z.output<typeof draftSchema>;

/** Every answer as the form holds it: text, before any check. */
export type MemorialCardDraft = { [Field in keyof DraftOutput]: string };
export type MemorialCardField = keyof MemorialCardDraft;
export type MemorialCardErrors = Partial<Record<MemorialCardField, string>>;

/** The four steps, by their fields, in the order the donor sees them. */
export const STEP_FIELDS = stepShapes.map((shape) => Object.keys(shape)) as MemorialCardField[][];
export const STEP_COUNT = STEP_FIELDS.length;
export const FIELD_ORDER: MemorialCardField[] = STEP_FIELDS.flat();

export const emptyMemorialCardDraft = Object.fromEntries(
  FIELD_ORDER.map((field) => [field, ""]),
) as MemorialCardDraft;

/** A checked entry, as the office and the store receive it. */
export type MemorialCardRequest = {
  tribute: keyof typeof TRIBUTES;
  honoreeName: string;
  /** Empty for a memorial gift, and when the donor names no occasion. */
  occasion: string;
  /** Dollars with two decimals, for example "50.00". */
  amount: string;
  giveBy: keyof typeof GIVE_BY;
  recipientName: string;
  recipientStreet: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  cardDesign: string;
  /** The words printed inside the card. */
  cardMessage: string;
  /** True when the donor wrote the words, false for a preset line. */
  cardMessageIsOwnWords: boolean;
  donorName: string;
  donorStreet: string;
  donorCity: string;
  donorState: string;
  donorZip: string;
  donorPhone: string;
  donorEmail: string;
};

function toRequest(draft: DraftOutput): MemorialCardRequest {
  const { customMessage, messageChoice, ...answers } = draft;
  const ownWords = messageChoice === OWN_WORDS;
  return {
    ...answers,
    occasion: draft.tribute === "honor" ? draft.occasion : "",
    amount: Number(draft.amount.replace(/[$,\s]/g, "")).toFixed(2),
    cardMessage: ownWords ? customMessage : messageChoice,
    cardMessageIsOwnWords: ownWords,
  };
}

/**
 * The errors of a draft, the first problem of each field. With `fields`, only
 * the errors of those fields: "Next" checks the current step this way.
 */
export function memorialCardErrors(
  draft: Partial<Record<string, unknown>>,
  fields?: readonly string[],
): MemorialCardErrors {
  const result = draftSchema.safeParse(draft);
  if (result.success) return {};
  const keep = fields ? new Set(fields) : undefined;
  const errors: MemorialCardErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as MemorialCardField;
    if (keep && !keep.has(field)) continue;
    errors[field] ??= issue.message;
  }
  return errors;
}

/** The errors of one step (0 to 3), and no others. */
export function memorialCardStepErrors(step: number, draft: Partial<Record<string, unknown>>) {
  return memorialCardErrors(draft, STEP_FIELDS[step] ?? []);
}

/** The step (0 to 3) that holds the first of these errors. */
export function firstStepWithError(errors: MemorialCardErrors) {
  const step = STEP_FIELDS.findIndex((fields) => fields.some((field) => errors[field]));
  return step === -1 ? undefined : step;
}

export function readMemorialCardForm(formData: FormData) {
  return Object.fromEntries(
    FIELD_ORDER.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as MemorialCardDraft;
}

/** Check the whole entry, as the server does before it sends it. */
export function validateMemorialCard(
  formData: FormData,
): { ok: true; request: MemorialCardRequest } | { ok: false; errors: MemorialCardErrors } {
  const result = draftSchema.safeParse(readMemorialCardForm(formData));
  if (result.success) return { ok: true, request: toRequest(result.data) };
  return { ok: false, errors: memorialCardErrors(readMemorialCardForm(formData)) };
}

export type MemorialCardResult = FormSendResult<MemorialCardErrors>;
