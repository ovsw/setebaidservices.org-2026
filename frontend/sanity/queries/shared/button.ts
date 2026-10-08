import { urlInternalHref } from "./internal-href";

/**
 * Projection for one `button` object: label and the resolved
 * href. Use inside `buttons[]{ ... }` or a single `link{ ... }` field.
 */
// @sanity-typegen-ignore
export const buttonQuery = `
  _key,
  text,
  "openInNewTab": url.openInNewTab,
  "href": select(
    url.type == "internal" => ${urlInternalHref},
    url.type == "external" => url.external,
    url.href
  )
`;
