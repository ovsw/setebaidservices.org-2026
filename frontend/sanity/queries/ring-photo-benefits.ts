import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const ringPhotoBenefitsQuery = groq`
  _type == "ringPhotoBenefits" => {
    image{
      ${imageQuery}
    },
    caption,
    title[]{
      ${minimalRichTextQuery}
    },
    "points": array::compact(points[]{
      _key,
      title,
      body[]{
        ${simpleRichTextQuery}
      }
    }),
    link{
      ${buttonQuery}
    }
  }
`;
