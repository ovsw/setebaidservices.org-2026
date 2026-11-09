// Sends the form emails in frontend/emails to Formspark through its template
// API. Guide: docs/agents/form-notifications.md.
//
//   pnpm form-emails preview [form]   renders every template against its example
//                                     entry; sends no email and stores nothing
//   pnpm form-emails push [form]      writes every template to its form
//
// [form] limits the run to one form, by name, for example "Ask about camp".
// It reads FORMSPARK_TEMPLATE_TOKEN (forms:read and forms:write) and the form
// IDs from the environment, or from the file that `pnpm setup:qr` keeps.
import { type FormEmails, formEmails } from "../emails/index.ts";

const API = "https://api.formspark.io/public/v1";

type Kind = "notification" | "autoresponder";

type Template = {
  form: FormEmails;
  kind: Kind;
  /** The name in messages, for example "Ask about camp office notification". */
  name: string;
  code: string;
  /** Null clears it: the Website sends the office notification's subject. */
  subject: string | null;
};

type FormsparkError = { code?: string; detail?: string; errors?: unknown };

function templatesOf(form: FormEmails): Template[] {
  const templates: Template[] = [
    {
      form,
      kind: "notification",
      name: `${form.form} office notification`,
      code: form.notification,
      subject: null,
    },
  ];
  if (form.reply) {
    templates.push({
      form,
      kind: "autoresponder",
      name: `${form.form} reply email`,
      code: form.reply.code,
      subject: form.reply.subject,
    });
  }
  return templates;
}

function stop(message: string): never {
  console.error(message);
  process.exit(1);
}

function formId(form: FormEmails) {
  const id = process.env[form.formIdVariable];
  if (!id) stop(`${form.formIdVariable} is not set, so "${form.form}" has no Formspark form.`);
  return id;
}

async function call(token: string, method: "GET" | "POST" | "PUT", path: string, body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const answer = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: response.ok, status: response.status, answer };
}

function failure(template: Template, status: number, answer: FormsparkError): never {
  if (answer.code === "template_invalid") {
    stop(
      `Formspark rejected the ${template.name} (template_invalid). It keeps the old template.\n` +
        JSON.stringify(answer.errors ?? answer.detail, null, 2),
    );
  }
  stop(
    `Formspark answered HTTP ${status} (${answer.code ?? "no code"}) for the ${template.name}: ` +
      `${answer.detail ?? "no detail"}`,
  );
}

const path = (template: Template) =>
  `/forms/${encodeURIComponent(formId(template.form))}/templates/${template.kind}`;

/**
 * Formspark's preview renders the template it stores; it cannot render code
 * that is not pushed yet. So preview says when the stored template differs
 * from the code here. A push checks that the code compiles before Formspark
 * stores it.
 */
async function preview(token: string, template: Template) {
  const stored = await call(token, "GET", path(template));
  console.log(`\n=== ${template.name}`);
  if (!stored.ok) {
    // A 404 is a missing template only when the form itself exists.
    if (stored.status !== 404) failure(template, stored.status, stored.answer as FormsparkError);
    const form = await call(token, "GET", `/forms/${encodeURIComponent(formId(template.form))}`);
    if (!form.ok) failure(template, form.status, form.answer as FormsparkError);
    console.log("Formspark has no template of this kind yet. Push it, then preview again.");
    return;
  }
  const current = stored.answer.code === template.code;
  const rendered = await call(token, "POST", `${path(template)}/preview`, {
    data: template.form.example,
  });
  if (!rendered.ok) failure(template, rendered.status, rendered.answer as FormsparkError);
  if (!current) {
    console.log("Formspark holds a different version than this code. Below is the stored one;");
    console.log("push to store this code.");
  }
  const subject = rendered.answer.subject ?? "(none: the Website sends the subject)";
  console.log(`Subject: ${subject}`);
  if (template.kind === "notification") {
    const sent = (template.form.example._email as { subject?: string } | undefined)?.subject;
    if (sent) console.log(`Subject the Website sends: ${sent}`);
  }
  console.log(`Paused: ${stored.answer.paused === true ? "YES" : "no"}`);
  console.log(String(rendered.answer.text ?? "").trim());
}

async function push(token: string, template: Template) {
  const stored = await call(token, "GET", path(template));
  if (stored.ok && stored.answer.mode === "visual") {
    console.log(`The ${template.name} was built in the visual editor; this push replaces it.`);
  }
  const written = await call(token, "PUT", path(template), {
    code: template.code,
    subject: template.subject,
  });
  if (!written.ok) failure(template, written.status, written.answer as FormsparkError);
  if (written.answer.paused === true) {
    stop(`Formspark paused the ${template.name}: it sends nothing until Formspark lifts it.`);
  }
  console.log(`Pushed the ${template.name}.`);
}

const [mode, only] = process.argv.slice(2);
if (mode !== "preview" && mode !== "push") stop("Usage: pnpm form-emails preview|push [form name]");

const token = process.env.FORMSPARK_TEMPLATE_TOKEN;
if (!token) stop("FORMSPARK_TEMPLATE_TOKEN is not set. See docs/agents/form-notifications.md.");

const forms = formEmails.filter((form) => !only || form.form === only);
if (!forms.length) stop(`No form is named "${only}". Forms: ${formEmails.map((form) => form.form).join(", ")}.`);

for (const template of forms.flatMap(templatesOf)) {
  await (mode === "preview" ? preview(token, template) : push(token, template));
}
