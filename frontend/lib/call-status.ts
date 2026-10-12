/**
 * Call status: what the office did with an "Ask about camp" request, and
 * what came of the call. No imports, so the dashboard's row form can use it
 * in the browser.
 */

/** Statuses that keep a request on the call list, in the order of a call's life. */
export const OPEN_CALL_STATUSES = ["to_call", "no_answer", "left_message", "follow_up"] as const;

/** Statuses that end a request: the family's answer, or no way to reach them. */
export const CLOSED_CALL_STATUSES = ["plans_to_register", "not_for_them", "cant_reach"] as const;

export const CALL_STATUSES = [...OPEN_CALL_STATUSES, ...CLOSED_CALL_STATUSES] as const;

export type CallStatus = (typeof CALL_STATUSES)[number];

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  to_call: "To call",
  no_answer: "No answer",
  left_message: "Left a message",
  follow_up: "Follow up",
  plans_to_register: "Plans to register",
  not_for_them: "Not for them",
  cant_reach: "Can't reach",
};

export const CALL_NOTE_MAX_LENGTH = 500;

export function isCallStatus(value: unknown): value is CallStatus {
  return typeof value === "string" && (CALL_STATUSES as readonly string[]).includes(value);
}

export function isOpenStatus(status: CallStatus) {
  return (OPEN_CALL_STATUSES as readonly string[]).includes(status);
}

/** The note as stored: trimmed, and never longer than the column allows. */
export function normalizeCallNote(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, CALL_NOTE_MAX_LENGTH) : "";
}
