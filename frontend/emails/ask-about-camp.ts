import { type FormEmails, field, officeNotification, replyEmail, text } from "./layout.ts";

/** The "Ask about camp" emails. Field names follow `askAboutCampPayload`. */
export const askAboutCampEmails: FormEmails = {
  form: "Ask about camp",
  formIdVariable: "FORMSPARK_FORM_ID",
  notification: officeNotification({
    heading: `${field("parent_name")} asked about camp`,
    nextStep: `${text("Call")} ${field("parent_name")} ${text("back to answer their questions.")}`,
    answers: [
      { label: "Parent's name", value: field("parent_name") },
      { label: "Phone", value: field("phone") },
      { label: "Email", value: field("email") },
      { label: "Child's age", value: field("child_age") },
      { label: "Best time to call", value: field("best_time_to_call") },
      { label: "What they want to know", value: field("what_they_want_to_know") },
    ],
    button: { label: `Call ${field("parent_name")}`, href: `tel:${field("phone")}` },
  }),
  reply: {
    subject: "We got your question about Camp Setebaid",
    code: replyEmail({
      greeting: `${text("Hi")} ${field("parent_name")},`,
      paragraphs: [
        text("Thank you for asking about Camp Setebaid. Your question reached us."),
        `${text("Our camp director will call you at")} ${field("phone")} ${text("to talk it through.")}`,
      ],
    }),
  },
  example: {
    parent_name: "Dana Rivera",
    phone: "(610) 555-0123",
    email: "dana@example.com",
    child_age: "9",
    best_time_to_call: "Weekday evenings",
    what_they_want_to_know: "Cost and financial help; Talk with the camp director",
    source: "chop-nurses",
    landing_page: "/go/events",
    campaign: "fall-2026-events",
    received_at: "2026-11-05T15:30:00.000Z",
    sent_at: "Nov 5, 2026, 10:30 AM ET",
    submission_id: "0b5a3c1e-7f2d-4c8a-9e61-2d4f8a6b0001",
    _email: { subject: "Ask about camp: chop-nurses on /go/events" },
  },
};
