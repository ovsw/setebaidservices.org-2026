import { notFound } from "next/navigation";
import { isHidden } from "../../shared/public-visibility";

/**
 * The one route check for Hidden documents. Public routes call it after the
 * fetch, in their non-draft branch; draft mode (Presentation) never calls it,
 * so editors and the client still see hidden documents there.
 */
export function notFoundIfHidden(document: object | null | undefined) {
  if (isHidden(document)) notFound();
}
