/**
 * The shared theme and the two layouts every form email is built from: the
 * office notification and the reply email. Each layout returns a Formspark
 * template, HTML with Handlebars placeholders. Formspark sends no stylesheet,
 * so every style is inline. Rules and the script: docs/agents/form-notifications.md.
 *
 * Plain functions on purpose: `pnpm form-emails` runs this file with Node, so
 * it imports nothing but other files in this folder.
 */

/** Setebaid's colours from frontend/app/globals.css, and a plain system font. */
export const theme = {
  page: "#fbf7ec", // cream
  ink: "#1c3b2c", // headings and text
  inkSoft: "#3e5a4b", // body text
  rule: "#e6dfcb", // hairlines, cream a little darker
  button: "#1a7f52", // camp green
  buttonText: "#ffffff",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  width: 600,
} as const;

/** A Handlebars placeholder for one payload field, for example `{{data.phone}}`. */
export function field(name: string) {
  return `{{data.${name}}}`;
}

/** Escapes text written here, so it shows as written. Placeholders escape themselves. */
export function text(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type Button = {
  /** Template code, for example `Call {{data.parent_name}}`. */
  label: string;
  /** Template code for the link, for example `tel:{{data.phone}}`. */
  href: string;
};

export type Answer = {
  /** The plain label the office reads. */
  label: string;
  /** Template code, usually `field(name)`. */
  value: string;
};

function page(content: string) {
  return [
    `<div style="margin:0;padding:0;background-color:${theme.page};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${theme.page};">`,
    `<tr><td align="center" style="padding:32px 16px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${theme.width}px;font-family:${theme.font};color:${theme.inkSoft};font-size:16px;line-height:1.5;">`,
    content,
    `</table>`,
    `</td></tr>`,
    `</table>`,
    `</div>`,
  ].join("\n");
}

function heading(value: string) {
  return `<tr><td style="padding:0 0 12px;"><h1 style="margin:0;font-family:${theme.font};font-size:24px;line-height:1.25;font-weight:700;color:${theme.ink};">${value}</h1></td></tr>`;
}

function paragraph(value: string, padding = "0 0 16px") {
  return `<tr><td style="padding:${padding};"><p style="margin:0;font-size:16px;line-height:1.5;color:${theme.inkSoft};">${value}</p></td></tr>`;
}

function button({ label, href }: Button) {
  return [
    `<tr><td style="padding:8px 0 24px;">`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td style="border-radius:999px;background-color:${theme.button};">`,
    `<a href="${href}" style="display:inline-block;padding:12px 24px;border-radius:999px;font-family:${theme.font};font-size:16px;font-weight:700;line-height:1.25;color:${theme.buttonText};text-decoration:none;">${label}</a>`,
    `</td></tr></table>`,
    `</td></tr>`,
  ].join("\n");
}

function answers(list: Answer[]) {
  const rows = list.map(
    ({ label, value }) =>
      `<tr><td style="padding:10px 0;border-top:1px solid ${theme.rule};">` +
      `<div style="font-size:13px;line-height:1.4;color:${theme.inkSoft};">${text(label)}</div>` +
      `<div style="font-size:16px;line-height:1.5;color:${theme.ink};">${value}</div>` +
      `</td></tr>`,
  );
  return [
    `<tr><td style="padding:0 0 16px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid ${theme.rule};">`,
    ...rows,
    `</table>`,
    `</td></tr>`,
  ].join("\n");
}

/** Where the visitor came from and when, and the entry in Formspark when Formspark gives a link. */
function smallPrint() {
  const line = (label: string, value: string) => `${text(label)}: ${value}`;
  return [
    `<tr><td style="padding:8px 0 0;font-size:13px;line-height:1.6;color:${theme.inkSoft};">`,
    [
      line("Source", field("source")),
      line("Page", field("landing_page")),
      line("Campaign", field("campaign")),
      line("Sent", field("sent_at")),
    ].join("<br>"),
    `{{#if viewLink}}<br><a href="{{sanitizeUrl viewLink}}" style="color:${theme.button};text-decoration:underline;">View in Formspark</a>{{/if}}`,
    `</td></tr>`,
  ].join("\n");
}

export type OfficeNotification = {
  /** What happened, as template code. */
  heading: string;
  /** One line on what the office does next, as template code. */
  nextStep: string;
  /** The visitor's answers, in form order. */
  answers: Answer[];
  /** Only when there is one clear action. */
  button?: Button;
};

/**
 * The email the office gets for each entry. Its subject comes from the
 * `_email.subject` the Website sends, so the template sets none.
 */
export function officeNotification(email: OfficeNotification) {
  return page(
    [
      heading(email.heading),
      paragraph(email.nextStep, "0 0 20px"),
      answers(email.answers),
      email.button ? button(email.button) : "",
      smallPrint(),
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export type ReplyEmail = {
  /** Template code, for example `Hi {{data.first_name}},`. */
  greeting: string;
  /** What happens next, one paragraph each, as template code. */
  paragraphs: string[];
  button?: Button;
};

/**
 * The email the visitor gets right after sending the form. Formspark adds its
 * own footer below it, which cannot be removed, so the signature ends the body.
 */
export function replyEmail(email: ReplyEmail) {
  return page(
    [
      paragraph(email.greeting),
      ...email.paragraphs.map((value) => paragraph(value)),
      email.button ? button(email.button) : "",
      paragraph(`${text("The Setebaid team")}`, "8px 0 0"),
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/** One form's two emails, and the example entry the preview renders them with. */
export type FormEmails = {
  /** The form's name, as the office reads it. */
  form: string;
  /** The variable that holds the form's Formspark ID. */
  formIdVariable: string;
  notification: string;
  reply: { subject: string; code: string };
  /** An entry shaped like the Website's Formspark payload (frontend/lib/formspark-entry.ts). */
  example: Record<string, unknown>;
};
