import { z } from "zod";
import { isPhoneNumber, PHONE_ERROR } from "@/lib/ask-about-camp";
import type { FormSendResult } from "@/lib/form-entry";

/**
 * The parent's guide request: a parent's first name and email, so the reply
 * email can deliver the guide, and an optional phone and OK to contact, so the
 * office knows which families welcome a follow-up. The browser and the server
 * check it with the same rules.
 */

/** The value the "Setebaid may contact me about camp" box sends when ticked. */
export const OK_TO_CONTACT_VALUE = "yes";

const text = (max: number) => z.string().trim().max(max, "This answer is too long.");

export const parentsGuideSchema = z.object({
  firstName: text(100).min(1, "Enter your first name."),
  email: text(200)
    .min(1, "Enter your email address.")
    .pipe(z.email("Enter an email address like name@example.com.")),
  // Optional: an empty phone is fine; a filled-in one must look like a number.
  phone: text(30).refine((value) => value === "" || isPhoneNumber(value), PHONE_ERROR),
  okToContact: z.boolean(),
});

export type ParentsGuideRequest = z.infer<typeof parentsGuideSchema>;
export type ParentsGuideField = keyof ParentsGuideRequest;
export type ParentsGuideErrors = Partial<Record<ParentsGuideField, string>>;

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Check the form's answers; the first problem of each field is its error. */
export function validateParentsGuide(
  formData: FormData,
): { ok: true; request: ParentsGuideRequest } | { ok: false; errors: ParentsGuideErrors } {
  const result = parentsGuideSchema.safeParse({
    firstName: field(formData, "firstName"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    // Unticked unless the box sent its value.
    okToContact: field(formData, "okToContact") === OK_TO_CONTACT_VALUE,
  });
  if (result.success) return { ok: true, request: result.data };

  const errors: ParentsGuideErrors = {};
  for (const issue of result.error.issues) {
    const name = issue.path[0] as ParentsGuideField;
    errors[name] ??= issue.message;
  }
  return { ok: false, errors };
}

export type ParentsGuideResult = FormSendResult<ParentsGuideErrors>;
