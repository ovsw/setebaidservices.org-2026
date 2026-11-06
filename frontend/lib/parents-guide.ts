import { z } from "zod";
import type { FormSendResult } from "@/lib/form-entry";

/**
 * The parent's guide request: a parent's first name and email, so the office can
 * send the guide. The browser and the server check it with the same rules.
 */

const text = (max: number) => z.string().trim().max(max, "This answer is too long.");

export const parentsGuideSchema = z.object({
  firstName: text(100).min(1, "Enter your first name."),
  email: text(200)
    .min(1, "Enter your email address.")
    .pipe(z.email("Enter an email address like name@example.com.")),
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
