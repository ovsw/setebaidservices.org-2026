/** Camp Brain's giving form, where every gift to Setebaid is made. */
export const GIVING_URL = "https://setebaid.campbraingiving.com/";

/** An appeal's code in a /give/ address: lowercase letters, digits, dashes. */
export const APPEAL_CODE_PATTERN = /^[a-z0-9-]{1,64}$/;

/**
 * True for Next's own background requests (link prefetch and client-side
 * navigation payloads), which a visitor did not click. A same-tab click that
 * starts as one of these ends in a full page load of the address, which is
 * the request that counts.
 */
export function isRouterRequest(headers: Headers) {
  return (
    headers.has("rsc") ||
    headers.has("next-router-prefetch") ||
    headers.get("purpose") === "prefetch" ||
    Boolean(headers.get("sec-purpose")?.includes("prefetch"))
  );
}
