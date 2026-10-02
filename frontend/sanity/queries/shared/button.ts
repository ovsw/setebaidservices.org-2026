import { urlInternalHref } from "./internal-href";

/**
 * Projection for one `button` object: label, stored variant, and the resolved
 * href. Use inside `buttons[]{ ... }` or a single `link{ ... }` field.
 */
// @sanity-typegen-ignore
export const buttonQuery = `
  _key,
  text,
  variant,
  "openInNewTab": url.openInNewTab,
  "href": select(
    url.type == "internal" => ${urlInternalHref},
    url.type == "external" => url.external,
    url.href
  )
`;
