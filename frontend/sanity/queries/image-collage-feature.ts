import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { urlInternalHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const imageCollageFeatureQuery = groq`
  _type == "imageCollageFeature" => {
    "layout": coalesce(layout, "collage"),
    eyebrow,
    title[]{
      ...
    },
    body,
    "points": array::compact(points[]{
      _key,
      title,
      body
    }),
    primaryImage {
      ${imageQuery}
    },
    secondaryImage {
      ${imageQuery}
    },
    tertiaryImage {
      ${imageQuery}
    },
    "buttons": array::compact(buttons[]{
      ${buttonQuery}
    }),
    cta {
      text,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => ${urlInternalHref},
        url.type == "external" => url.external,
        url.href
      )
    }
  }
`;
