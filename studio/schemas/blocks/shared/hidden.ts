import { defineField } from "sanity";
import { isHidden } from "../../../../shared/public-visibility.ts";

/** The document types that carry the Hidden field. */
export const hideableDocumentTypes = new Set([
  "page",
  "post",
  "category",
  "blogIndex",
]);

/**
 * Hidden: published, but the public Website treats the document as missing.
 * New documents start hidden; an editor unticks it when the client accepts
 * the page. Separate from `meta.noindex`, which keeps meaning "public, not
 * for search engines".
 */
export const hiddenField = defineField({
  name: "hidden",
  title: "Hidden",
  type: "boolean",
  group: "settings",
  initialValue: true,
  description:
    "While ticked, the public Website answers 404 for this document and leaves it out of the sitemap, the header and the footer. Presentation still shows it. Untick it when the client accepts the page.",
});

/** Marks a hidden document in Studio document lists. */
export function withHiddenMarker(
  subtitle: string | null | undefined,
  hidden: unknown,
) {
  if (!isHidden({ hidden })) return subtitle || undefined;
  return subtitle ? `Hidden · ${subtitle}` : "Hidden";
}
