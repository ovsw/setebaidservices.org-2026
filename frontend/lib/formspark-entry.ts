import { z } from "zod";
import type { AskAboutCampEntry } from "@/lib/ask-about-camp-delivery";

/**
 * How an "Ask about camp" entry looks in Formspark. The Website posts it in
 * this shape, and the nightly gap-filler reads it back.
 */

const EMPTY = "—";
const INTEREST_SEPARATOR = "; ";

/** The field names are what the office reads in the notification email. */
export function formsparkPayload(entry: AskAboutCampEntry) {
  return {
    parent_name: entry.name,
    phone: entry.phone,
    email: entry.email,
    child_age: entry.childAge,
    best_time_to_call: entry.bestTime || EMPTY,
    what_they_want_to_know: entry.interests.length
      ? entry.interests.join(INTEREST_SEPARATOR)
      : EMPTY,
    source: entry.source,
    landing_page: entry.page,
    campaign: entry.campaign ?? EMPTY,
    received_at: entry.receivedAt,
    submission_id: entry.submissionId,
    _email: {
      subject: `Ask about camp: ${entry.source} on ${entry.page}`,
    },
  };
}

const storedText = z.string().trim().min(1);
const optionalText = z
  .string()
  .optional()
  .transform((value) => (value === undefined || value === EMPTY ? "" : value));

const formsparkData = z.object({
  submission_id: z.uuid(),
  received_at: z.iso.datetime({ offset: true }),
  parent_name: storedText,
  phone: storedText,
  email: storedText,
  child_age: storedText,
  best_time_to_call: optionalText,
  what_they_want_to_know: optionalText,
  source: storedText,
  landing_page: storedText,
  campaign: optionalText,
});

/**
 * Reads an entry back from a Formspark submission's data. Returns undefined
 * for a submission the Website did not send, for example a test post.
 */
export function entryFromFormspark(data: unknown): AskAboutCampEntry | undefined {
  const result = formsparkData.safeParse(data);
  if (!result.success) return undefined;
  const fields = result.data;
  const entry: AskAboutCampEntry = {
    submissionId: fields.submission_id,
    receivedAt: new Date(fields.received_at).toISOString(),
    name: fields.parent_name,
    phone: fields.phone,
    email: fields.email,
    childAge: fields.child_age,
    bestTime: fields.best_time_to_call,
    interests: fields.what_they_want_to_know
      ? fields.what_they_want_to_know.split(INTEREST_SEPARATOR)
      : [],
    source: fields.source,
    page: fields.landing_page,
  };
  if (fields.campaign) entry.campaign = fields.campaign;
  return entry;
}
