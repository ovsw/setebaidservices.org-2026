/**
 * Call status: what the office did with an "Ask about camp" request. No
 * imports, so the dashboard's row form can use it in the browser.
 */
/** What the office did with a request. `to_call` and `no_answer` are open. */
export const CALL_STATUSES = ["to_call", "called", "no_answer"] as const;

export type CallStatus = (typeof CALL_STATUSES)[number];

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  to_call: "To call",
  called: "Called",
  no_answer: "No answer",
};

export const CALL_NOTE_MAX_LENGTH = 500;

export function isCallStatus(value: unknown): value is CallStatus {
  return typeof value === "string" && (CALL_STATUSES as readonly string[]).includes(value);
}

export function isOpenStatus(status: CallStatus) {
  return status !== "called";
}

/** The note as stored: trimmed, and never longer than the column allows. */
export function normalizeCallNote(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, CALL_NOTE_MAX_LENGTH) : "";
}
