import type { AskAboutCampRequest } from "@/lib/ask-about-camp";
import type { MemorialCardRequest } from "@/lib/memorial-card";

/**
 * A form entry: what a visitor sent through one of the Website's forms, plus
 * where and when it came from. Every kind travels the same two paths (the
 * Trigger.dev store task and Formspark) and lands in `form_entries`.
 */

/** The forms whose entries the Website delivers. */
export type FormKind = "ask_about_camp" | "memorial_card";

/** What every entry carries besides the visitor's answers. */
export type EntryMeta = {
  submissionId: string;
  receivedAt: string;
  /** The Source of the visit: the card or page that brought the visitor. */
  source: string;
  campaign?: string;
  /** The page the form was sent from. */
  page: string;
};

export type AskAboutCampEntry = AskAboutCampRequest & EntryMeta & { kind: "ask_about_camp" };
export type MemorialCardEntry = MemorialCardRequest & EntryMeta & { kind: "memorial_card" };
export type FormEntry = AskAboutCampEntry | MemorialCardEntry;

/** The form's name, as the office and the gap report read it. */
export const FORM_LABELS: Record<FormKind, string> = {
  ask_about_camp: "Ask about camp",
  memorial_card: "Memorial card",
};

/** The Neon table that holds each form's entries. */
export const FORM_TABLES: Record<FormKind, string> = {
  ask_about_camp: "form_entries",
  memorial_card: "memorial_card_entries",
};

/** The answer of a sent form, as the browser receives it. */
export type FormSendResult<Errors> =
  | { status: "idle" }
  | { status: "invalid"; errors: Errors }
  | { status: "sent" }
  /** Not sent: delivery failed, the visitor sent too often, or a bot filled the honeypot. */
  | { status: "failed" };
