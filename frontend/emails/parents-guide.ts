import { type FormEmails, field, officeNotification, replyEmail, text } from "./layout.ts";

/**
 * The guide's stable address on the Website. It redirects to the PDF uploaded
 * on the Parent's guide form in Sanity (frontend/app/parents-guide.pdf), so a
 * new guide needs no template push. The email links to it; it never attaches
 * the PDF, which would hurt delivery.
 */
export const GUIDE_URL = "https://setebaidservices.org/parents-guide.pdf";

/**
 * The "Parent's guide" emails. Field names follow `parentsGuidePayload`. The
 * form asks for a first name only, so the emails use only the first name.
 * The reply email delivers the guide as a link.
 */
export const parentsGuideEmails: FormEmails = {
  form: "Parent's guide",
  formIdVariable: "FORMSPARK_PARENTS_GUIDE_FORM_ID",
  notification: officeNotification({
    heading: `${field("first_name")} (${field("email")}) ${text("downloaded the parent's guide.")}`,
    nextStep: text(
      "The guide went to them by email, so there is nothing to send. Follow up about camp only when OK to contact is Yes.",
    ),
    answers: [
      { label: "OK to contact", value: field("ok_to_contact") },
      { label: "Phone", value: field("phone"), onlyWhenGiven: "phone" },
    ],
  }),
  reply: {
    subject: "Your Camp Setebaid parent's guide",
    code: replyEmail({
      greeting: `${text("Hi")} ${field("first_name")},`,
      paragraphs: [text("Thank you for asking for the parent's guide. Here it is.")],
      button: { label: text("Read the guide"), href: GUIDE_URL },
      afterButton: [text("Have a question about camp? Reply to this email, and we will answer.")],
    }),
  },
  example: {
    form: "Parent's guide",
    first_name: "Maria",
    email: "maria@example.com",
    phone: "(610) 555-0147",
    ok_to_contact: "Yes",
    source: "website",
    landing_page: "/parents/guide",
    campaign: "—",
    received_at: "2026-11-05T15:30:00.000Z",
    sent_at: "Nov 5, 2026, 10:30 AM ET",
    submission_id: "0b5a3c1e-7f2d-4c8a-9e61-2d4f8a6b0002",
    _email: { subject: "Parent's guide request: Maria" },
  },
};
