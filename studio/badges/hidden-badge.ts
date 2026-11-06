import type { DocumentBadgeComponent } from "sanity";
import { isHidden } from "../../shared/public-visibility.ts";

/** Shows "Hidden" on a document the public Website treats as missing. */
export const hiddenBadge: DocumentBadgeComponent = ({ draft, published }) =>
  isHidden(draft ?? published)
    ? {
        label: "Hidden",
        title:
          "The public Website answers 404 for this document. Presentation still shows it.",
        color: "warning",
      }
    : null;
