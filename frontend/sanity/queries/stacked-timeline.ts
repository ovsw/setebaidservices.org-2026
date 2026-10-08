import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { urlInternalHref } from "./shared/internal-href";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const stackedTimelineQuery = groq`
  _type == "stackedTimeline" => {
    "layout": coalesce(layout, "timeline"),
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    intro,
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
    }),
    "items": array::compact(items[]{
      _key,
      title,
      meta,
      text,
      link{
        ${buttonQuery}
      },
      image {
        ${imageQuery}
      }
    })
  }
`;
