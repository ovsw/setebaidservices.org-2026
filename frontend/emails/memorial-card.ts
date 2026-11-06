import { type FormEmails, field, officeNotification, replyEmail, text } from "./layout.ts";

/** A mailing address as three lines: name, street, then city, state and zip. */
function address(prefix: string) {
  return [
    field(`${prefix}_name`),
    field(`${prefix}_street`),
    `${field(`${prefix}_city`)}, ${field(`${prefix}_state`)} ${field(`${prefix}_zip`)}`,
  ].join("<br>");
}

/**
 * The memorial card emails. Field names follow `memorialCardPayload`; the
 * answers follow the form's four steps. No button: the office mails the card.
 */
export const memorialCardEmails: FormEmails = {
  form: "Memorial card",
  formIdVariable: "FORMSPARK_MEMORIAL_CARD_FORM_ID",
  notification: officeNotification({
    heading: `${field("donor_name")} ${text("asked for a memorial card")}`,
    nextStep:
      `${text("Match the card to the")} ${field("gift_amount")} ${text("gift by its amount, then mail it to")} ` +
      `${field("card_recipient_name")}${text(".")}`,
    answers: [
      // Step 1: who you remember or honor
      { label: "The gift is", value: `${field("in_memory_or_in_honor")} ${field("person_name")}` },
      { label: "Occasion", value: field("occasion") },
      { label: "Gift amount", value: field("gift_amount") },
      { label: "How they give", value: field("how_they_give") },
      // Step 2: who gets the card
      { label: "Mail the card to", value: address("card_recipient") },
      // Step 3: the card
      { label: "Card design", value: field("card_design") },
      { label: "Words printed inside", value: field("card_message") },
      { label: "In the donor's own words", value: field("card_message_in_own_words") },
      // Step 4: the donor
      { label: "Donor", value: address("donor") },
      { label: "Donor's phone", value: field("donor_phone") },
      { label: "Donor's email", value: field("donor_email") },
    ],
  }),
  reply: {
    subject: "We got your Camp Setebaid card request",
    // Thanks the donor for the request only: the gift may not have arrived yet.
    code: replyEmail({
      greeting: `${text("Hi")} ${field("donor_name")},`,
      paragraphs: [
        `${text("Thank you for your card request for")} ${field("person_name")}${text(". It reached us.")}`,
        `${text("We will mail the card to")} ${field("card_recipient_name")}${text(".")}`,
      ],
    }),
  },
  example: {
    form: "Memorial card",
    in_memory_or_in_honor: "In memory of",
    person_name: "Ruth Ellen Baker",
    occasion: "—",
    gift_amount: "$50.00",
    how_they_give: "By check in the mail",
    card_recipient_name: "The Baker family",
    card_recipient_street: "12 Elm Street",
    card_recipient_city: "Allentown",
    card_recipient_state: "PA",
    card_recipient_zip: "18101",
    card_design: "Lake at dawn",
    card_message: "A gift has been made in memory of Ruth.",
    card_message_in_own_words: "No",
    donor_name: "Sam Ortiz",
    donor_street: "3 Oak Lane",
    donor_city: "Reading",
    donor_state: "PA",
    donor_zip: "19601",
    donor_phone: "610-555-0199",
    donor_email: "sam@example.com",
    source: "direct",
    landing_page: "/donate/memorial",
    campaign: "—",
    received_at: "2026-11-05T15:30:00.000Z",
    sent_at: "Nov 5, 2026, 10:30 AM ET",
    submission_id: "0b5a3c1e-7f2d-4c8a-9e61-2d4f8a6b0002",
    _replyto: "sam@example.com",
    _email: { subject: "Memorial card: in memory of Ruth Ellen Baker" },
  },
};
