import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const dateCardsQuery = groq`
  _type == "dateCards" => {
    title[]{
      ${minimalRichTextQuery}
    },
    link{
      ${buttonQuery}
    },
    "items": array::compact(items[]{
      _key,
      date,
      title,
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
