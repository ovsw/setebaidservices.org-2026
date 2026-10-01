import { groq } from "next-sanity";
import { urlInternalHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const includedExtrasQuery = groq`
  _type == "includedExtras" => {
    eyebrow,
    title[]{
      ...
    },
    intro,
    "prices": array::compact(prices[]{
      _key,
      name,
      price,
      unit,
      note
    }),
    included {
      heading,
      note,
      "items": array::compact(items[]{
        _key,
        label,
        detail
      })
    },
    extras {
      heading,
      note,
      "items": array::compact(items[]{
        _key,
        label,
        detail,
        price,
        link {
          text,
          "openInNewTab": url.openInNewTab,
          "href": select(
            url.type == "internal" => ${urlInternalHref},
            url.type == "external" => url.external,
            url.href
          )
        }
      })
    },
    footnote
  }
`;
