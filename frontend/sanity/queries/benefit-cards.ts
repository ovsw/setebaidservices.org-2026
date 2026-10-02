import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const benefitCardsQuery = groq`
  _type == "benefitCards" => {
    "layout": coalesce(layout, "grid"),
    image{
      ${imageQuery}
    },
    caption,
    link{
      ${buttonQuery}
    },
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    intro,
    "cards": array::compact(cards[]{
      _key,
      _type,
      "icon": icon{ name, svg },
      title,
      body[]{
        ${simpleRichTextQuery}
      }
    })
  }
`;
