import { type FormEmails, field, officeNotification, text } from "./layout.ts";

/**
 * The "Parent's guide" emails. Field names follow `parentsGuidePayload`. The
 * form asks for a first name only, so the emails use only the first name.
 *
 * The reply email, which delivers the guide, waits for the guide PDF (#120).
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
