import "server-only";
import { randomUUID } from "node:crypto";
import { tasks } from "@trigger.dev/sdk";
import {
  HONEYPOT_FIELD,
  type AskAboutCampRequest,
  type AskAboutCampResult,
  validateAskAboutCamp,
} from "@/lib/ask-about-camp";
import { type EncryptedFormEntry, encryptFormEntry } from "@/lib/form-entry-crypto";
import { isRouteSlug } from "@/lib/routes";
import type { storeFormEntryTask } from "@/trigger/store-form-entry";

/** A request ready to deliver: the parent's answers plus where and when it came from. */
export type AskAboutCampEntry = AskAboutCampRequest & {
  submissionId: string;
  receivedAt: string;
  /** The Source of the visit: the card or page that brought the parent. */
  source: string;
  campaign?: string;
  /** The page the form was sent from. */
  page: string;
};

/** Delivers one entry, or throws. */
export type FormsparkClient = (entry: AskAboutCampEntry) => Promise<void>;

/** The field names are what the office reads in the notification email. */
export function formsparkPayload(entry: AskAboutCampEntry) {
  return {
    parent_name: entry.name,
    phone: entry.phone,
    email: entry.email,
    child_age: entry.childAge,
    best_time_to_call: entry.bestTime || "—",
    what_they_want_to_know: entry.interests.length ? entry.interests.join("; ") : "—",
    source: entry.source,
    landing_page: entry.page,
    campaign: entry.campaign ?? "—",
    received_at: entry.receivedAt,
    submission_id: entry.submissionId,
    _email: {
      subject: `Ask about camp: ${entry.source} on ${entry.page}`,
    },
  };
}

export function createFormsparkClient(formId: string | undefined): FormsparkClient {
  return async (entry) => {
    if (!formId) throw new Error("FORMSPARK_FORM_ID is not set");
    const response = await fetch(`https://submit-form.com/${encodeURIComponent(formId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(formsparkPayload(entry)),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Formspark answered HTTP ${response.status}`);
  };
}

/** Hands one encrypted entry to the store task, or throws. */
export type TriggerClient = (payload: EncryptedFormEntry) => Promise<void>;

export function createTriggerClient(secretKey: string | undefined): TriggerClient {
  return async (payload) => {
    if (!secretKey) throw new Error("TRIGGER_SECRET_KEY is not set");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Trigger.dev did not answer in 10 seconds")), 10_000);
    });
    try {
      await Promise.race([
        tasks.trigger<typeof storeFormEntryTask>("store-form-entry", payload),
        timeout,
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * Counts sends per visitor in this server instance's memory. Each instance
 * keeps its own count, so it slows a flood from one visitor; it is not a
 * global quota.
 */
export function createSubmitLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const sends = new Map<string, number[]>();
  return function allow(visitor: string, now: number) {
    if (sends.size > 1000) {
      for (const [key, times] of sends) {
        if (times.every((time) => now - time >= windowMs)) sends.delete(key);
      }
    }
    const recent = (sends.get(visitor) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) {
      sends.set(visitor, recent);
      return false;
    }
    sends.set(visitor, [...recent, now]);
    return true;
  };
}

export type SubmitLimiter = ReturnType<typeof createSubmitLimiter>;

export type AskAboutCampDeps = {
  /** Path A: the store task, which writes the entry to Neon. */
  trigger: TriggerClient;
  /** The key that encrypts the entry for path A. */
  encryptionKey: string;
  /** Path B: Formspark, which emails the office. */
  formspark: FormsparkClient;
  allow: SubmitLimiter;
  now?: () => Date;
  newId?: () => string;
};

function slugField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && isRouteSlug(value) ? value : undefined;
}

function pageField(formData: FormData) {
  const value = formData.get("page");
  return typeof value === "string" &&
    value.length <= 200 &&
    /^\/(?!\/)[A-Za-z0-9\-._~/]*$/.test(value)
    ? value
    : "unknown";
}

function reason(error: unknown) {
  return error instanceof Error ? error.message : "unknown error";
}

/**
 * Check a sent form and deliver it on two paths at the same time: encrypted
 * to the store task, and to Formspark. It is sent when at least one path
 * accepts it. The visitor key identifies one visitor for the send limit; it
 * is not stored.
 */
export async function submitAskAboutCamp(
  formData: FormData,
  visitor: string,
  {
    trigger,
    encryptionKey,
    formspark,
    allow,
    now = () => new Date(),
    newId = randomUUID,
  }: AskAboutCampDeps,
): Promise<AskAboutCampResult> {
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim()) return { status: "failed" };

  const checked = validateAskAboutCamp(formData);
  if (!checked.ok) return { status: "invalid", errors: checked.errors };

  const receivedAt = now();
  if (!allow(visitor, receivedAt.getTime())) return { status: "failed" };

  const entry: AskAboutCampEntry = {
    ...checked.request,
    submissionId: newId(),
    receivedAt: receivedAt.toISOString(),
    source: slugField(formData, "source") ?? "direct",
    page: pageField(formData),
  };
  const campaign = slugField(formData, "campaign");
  if (campaign) entry.campaign = campaign;

  const [stored, mailed] = await Promise.allSettled([
    (async () => trigger(encryptFormEntry(entry, encryptionKey)))(),
    formspark(entry),
  ]);
  // Log the reason only: the entry holds the family's details.
  if (stored.status === "rejected") {
    console.error(`Ask about camp ${entry.submissionId} did not reach Trigger.dev:`, reason(stored.reason));
  }
  if (mailed.status === "rejected") {
    console.error(`Ask about camp ${entry.submissionId} did not reach Formspark:`, reason(mailed.reason));
  }
  return stored.status === "fulfilled" || mailed.status === "fulfilled"
    ? { status: "sent" }
    : { status: "failed" };
}
