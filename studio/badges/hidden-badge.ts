import type { DocumentBadgeComponent } from "sanity";
import { isHidden } from "../../shared/public-visibility.ts";

/**
 * Shows "Hidden" on a document the public Website treats as missing.
 * The public Website reads the published version, so the badge follows it.
 * A draft that differs from the published state gets its own wording, so an
 * editor who unticks Hidden in a draft sees that the page stays hidden until
 * the draft is published.
 */
export const hiddenBadge: DocumentBadgeComponent = ({ draft, published }) => {
  const publishedHidden = published ? isHidden(published) : null;
  const draftHidden = draft ? isHidden(draft) : null;
  const hidden = publishedHidden ?? draftHidden ?? false;
  if (!hidden) return null;

  const draftDiffers =
    draftHidden !== null && publishedHidden !== null && draftHidden !== publishedHidden;

  return {
    label: draftDiffers ? "Hidden until published" : "Hidden",
    title: draftDiffers
      ? "The published version is hidden: the public Website answers 404 for it until this draft is published."
      : "The public Website answers 404 for this document. Presentation still shows it.",
    color: "warning",
  };
};
