import { z } from "zod";

/**
 * The "Ask about camp" request: what a parent types into the form. The
 * browser and the server check it with the same rules. It asks for no
 * medical details.
 */

/** The address that opens the form with "Talk with the camp director" chosen. */
export const DIRECTOR_HASH = "#talk-to-the-director";

/** The hidden field only a bot fills in. */
export const HONEYPOT_FIELD = "fax";

const text = (max: number) => z.string().trim().max(max, "This answer is too long.");

export const askAboutCampSchema = z.object({
  name: text(100).min(1, "Enter your name."),
  phone: text(30)
    .min(1, "Enter your phone number.")
    .refine(
      (value) => /^[0-9+()\-. ]*$/.test(value) && value.replace(/\D/g, "").length >= 7,
      "Enter a phone number with at least 7 digits, for example 610-555-0123.",
    ),
  email: text(200)
    .min(1, "Enter your email address.")
    .pipe(z.email("Enter an email address like name@example.com.")),
  childAge: text(40).min(1, "Enter your child's age."),
  bestTime: text(100),
  interests: z.array(text(100)).max(12),
});

export type AskAboutCampRequest = z.infer<typeof askAboutCampSchema>;
export type AskAboutCampField = keyof AskAboutCampRequest;
export type AskAboutCampErrors = Partial<Record<AskAboutCampField, string>>;

export function readAskAboutCampForm(formData: FormData) {
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    name: field("name"),
    phone: field("phone"),
    email: field("email"),
    childAge: field("childAge"),
    bestTime: field("bestTime"),
    interests: formData
      .getAll("interests")
      .filter((value): value is string => typeof value === "string"),
  };
}

/** Check the form's answers; the first problem of each field is its error. */
export function validateAskAboutCamp(
  formData: FormData,
): { ok: true; request: AskAboutCampRequest } | { ok: false; errors: AskAboutCampErrors } {
  const result = askAboutCampSchema.safeParse(readAskAboutCampForm(formData));
  if (result.success) return { ok: true, request: result.data };

  const errors: AskAboutCampErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as AskAboutCampField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}

export type AskAboutCampResult =
  | { status: "idle" }
  | { status: "invalid"; errors: AskAboutCampErrors }
  | { status: "sent" }
  /** Not sent: delivery failed, the visitor sent too often, or a bot filled the honeypot. */
  | { status: "failed" };
