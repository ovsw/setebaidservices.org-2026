/**
 * The Hidden rule. A Hidden document is published but the public Website
 * treats it as missing: 404, no sitemap entry, no prebuild, no header or
 * footer link. Only an explicit `true` hides a document; a missing value is
 * visible, so documents created before the field existed stay public.
 *
 * Public queries only. Draft-mode (Presentation) fetches never apply it.
 */
export const PUBLIC_VISIBILITY_FILTER = "hidden != true";

/** The same rule for a dereferenced link target, e.g. `internal`. */
export function publicVisibilityFilterFor(reference: string) {
  return `${reference}->hidden != true`;
}

/** True only when the document carries `hidden: true`. */
export function isHidden(document: object | null | undefined) {
  return (
    !!document &&
    "hidden" in document &&
    (document as { hidden?: unknown }).hidden === true
  );
}
