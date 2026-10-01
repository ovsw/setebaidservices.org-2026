import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { urlInternalHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const pricingSingleToggleQuery = groq`
  _type == "pricingSingleToggle" => {
    background,
    eyebrow,
    title[]{
      ...
    },
    image {
      ${imageQuery}
    },
    intro,
    "options": array::compact(options[]{
      _key,
      name,
      price,
      unit,
      note
    }),
    "facts": array::compact(facts[]{
      _key,
      label,
      detail
    }),
    button {
      text,
      variant,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => ${urlInternalHref},
        url.type == "external" => url.external,
        url.href
      )
    },
    footnote
  }
`;
