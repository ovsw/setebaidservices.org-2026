import { urlInternalHref } from "./internal-href";

/** The `buttons` list of the three call-to-action bands, resolved to links. */
export const ctaButtonsQuery = `
    "buttons": array::compact(buttons[]{
      _key,
      _type,
      text,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => ${urlInternalHref},
        url.type == "external" => url.external,
        url.href
      )
    })`;
