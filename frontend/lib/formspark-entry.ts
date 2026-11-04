import { z } from "zod";
import type { AskAboutCampEntry, FormEntry, MemorialCardEntry } from "@/lib/form-entry";
import { FORM_LABELS } from "@/lib/form-entry";
import { GIVE_BY, TRIBUTES } from "@/lib/memorial-card";

/**
 * How a form entry looks in Formspark. The Website posts it in this shape,
 * and the nightly gap-filler reads it back. Both forms post to the same
 * Formspark form; a memorial card entry names its form in the `form` field,
 * and an entry without one is an "Ask about camp" request.
 */

const EMPTY = "—";
const INTEREST_SEPARATOR = "; ";

function visitFields(entry: FormEntry) {
  return {
    source: entry.source,
    landing_page: entry.page,
    campaign: entry.campaign ?? EMPTY,
    received_at: entry.receivedAt,
    submission_id: entry.submissionId,
  };
}

function askAboutCampPayload(entry: AskAboutCampEntry) {
  return {
    parent_name: entry.name,
    phone: entry.phone,
    email: entry.email,
    child_age: entry.childAge,
    best_time_to_call: entry.bestTime || EMPTY,
    what_they_want_to_know: entry.interests.length
      ? entry.interests.join(INTEREST_SEPARATOR)
      : EMPTY,
    ...visitFields(entry),
    _email: {
      subject: `Ask about camp: ${entry.source} on ${entry.page}`,
    },
  };
}

/** The fields follow the form's four steps, so the email reads in that order. */
function memorialCardPayload(entry: MemorialCardEntry) {
  return {
    form: FORM_LABELS.memorial_card,
    in_memory_or_in_honor: TRIBUTES[entry.tribute],
    person_name: entry.honoreeName,
    occasion: entry.occasion || EMPTY,
    gift_amount: `$${entry.amount}`,
    how_they_give: GIVE_BY[entry.giveBy],
    card_recipient_name: entry.recipientName,
    card_recipient_street: entry.recipientStreet,
    card_recipient_city: entry.recipientCity,
    card_recipient_state: entry.recipientState,
    card_recipient_zip: entry.recipientZip,
    card_design: entry.cardDesign,
    card_message: entry.cardMessage,
    card_message_in_own_words: entry.cardMessageIsOwnWords ? "Yes" : "No",
    donor_name: entry.donorName,
    donor_street: entry.donorStreet,
    donor_city: entry.donorCity,
    donor_state: entry.donorState,
    donor_zip: entry.donorZip,
    donor_phone: entry.donorPhone,
    donor_email: entry.donorEmail,
    ...visitFields(entry),
    _email: {
      subject: `Memorial card: ${TRIBUTES[entry.tribute].toLowerCase()} ${entry.honoreeName}`,
    },
  };
}

/** The field names are what the office reads in the notification email. */
export function formsparkPayload(entry: FormEntry) {
  return entry.kind === "memorial_card" ? memorialCardPayload(entry) : askAboutCampPayload(entry);
}

const storedText = z.string().trim().min(1);
const optionalText = z
  .string()
  .optional()
  .transform((value) => (value === undefined || value === EMPTY ? "" : value));

const visitData = {
  submission_id: z.uuid(),
  received_at: z.iso.datetime({ offset: true }),
  source: storedText,
  landing_page: storedText,
  campaign: optionalText,
};

const askAboutCampData = z.object({
  ...visitData,
  parent_name: storedText,
  phone: storedText,
  email: storedText,
  child_age: storedText,
  best_time_to_call: optionalText,
  what_they_want_to_know: optionalText,
});

/** Reads a label back to its key, for example "In memory of" to "memory". */
function labelKey<Key extends string>(labels: Record<Key, string>) {
  const keys = Object.keys(labels) as Key[];
  return storedText.transform((label, context) => {
    const key = keys.find((candidate) => labels[candidate] === label);
    if (!key) context.addIssue({ code: "custom", message: `Unknown label ${label}` });
    return key as Key;
  });
}

const memorialCardData = z.object({
  ...visitData,
  form: z.literal(FORM_LABELS.memorial_card),
  in_memory_or_in_honor: labelKey(TRIBUTES),
  person_name: storedText,
  occasion: optionalText,
  gift_amount: storedText.regex(/^\$\d+\.\d{2}$/),
  how_they_give: labelKey(GIVE_BY),
  card_recipient_name: storedText,
  card_recipient_street: storedText,
  card_recipient_city: storedText,
  card_recipient_state: storedText,
  card_recipient_zip: storedText,
  card_design: storedText,
  card_message: storedText,
  card_message_in_own_words: z.enum(["Yes", "No"]),
  donor_name: storedText,
  donor_street: storedText,
  donor_city: storedText,
  donor_state: storedText,
  donor_zip: storedText,
  donor_phone: storedText,
  donor_email: storedText,
});

function visitMeta(fields: z.output<z.ZodObject<typeof visitData>>) {
  return {
    submissionId: fields.submission_id,
    receivedAt: new Date(fields.received_at).toISOString(),
    source: fields.source,
    page: fields.landing_page,
    ...(fields.campaign ? { campaign: fields.campaign } : {}),
  };
}

function askAboutCampFromFormspark(data: unknown): AskAboutCampEntry | undefined {
  const result = askAboutCampData.safeParse(data);
  if (!result.success) return undefined;
  const fields = result.data;
  return {
    kind: "ask_about_camp",
    ...visitMeta(fields),
    name: fields.parent_name,
    phone: fields.phone,
    email: fields.email,
    childAge: fields.child_age,
    bestTime: fields.best_time_to_call,
    interests: fields.what_they_want_to_know
      ? fields.what_they_want_to_know.split(INTEREST_SEPARATOR)
      : [],
  };
}

function memorialCardFromFormspark(data: unknown): MemorialCardEntry | undefined {
  const result = memorialCardData.safeParse(data);
  if (!result.success) return undefined;
  const fields = result.data;
  return {
    kind: "memorial_card",
    ...visitMeta(fields),
    tribute: fields.in_memory_or_in_honor,
    honoreeName: fields.person_name,
    occasion: fields.occasion,
    amount: fields.gift_amount.slice(1),
    giveBy: fields.how_they_give,
    recipientName: fields.card_recipient_name,
    recipientStreet: fields.card_recipient_street,
    recipientCity: fields.card_recipient_city,
    recipientState: fields.card_recipient_state,
    recipientZip: fields.card_recipient_zip,
    cardDesign: fields.card_design,
    cardMessage: fields.card_message,
    cardMessageIsOwnWords: fields.card_message_in_own_words === "Yes",
    donorName: fields.donor_name,
    donorStreet: fields.donor_street,
    donorCity: fields.donor_city,
    donorState: fields.donor_state,
    donorZip: fields.donor_zip,
    donorPhone: fields.donor_phone,
    donorEmail: fields.donor_email,
  };
}

/**
 * Reads an entry back from a Formspark submission's data. Returns undefined
 * for a submission the Website did not send, for example a test post.
 */
export function entryFromFormspark(data: unknown): FormEntry | undefined {
  const form = data && typeof data === "object" ? (data as { form?: unknown }).form : undefined;
  return form === undefined ? askAboutCampFromFormspark(data) : memorialCardFromFormspark(data);
}
