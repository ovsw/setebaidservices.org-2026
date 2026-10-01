import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const journeyQuery = groq`
  _type == "journey" => {
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    intro,
    "stops": array::compact(stops[]{
      _key,
      label,
      time,
      text,
      image {
        ${imageQuery}
      }
    })
  }
`;
