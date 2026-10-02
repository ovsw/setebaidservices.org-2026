import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const homeHeroQuery = groq`
  _type == "homeHero" => {
    status,
    title[]{
      ...
    },
    body[]{
      ${simpleRichTextQuery}
    },
    "buttons": array::compact(buttons[]{
      ${buttonQuery}
    }),
    filmButton {
      label,
      url
    },
    image {
      ${imageQuery}
    },
    "stats": array::compact(stats[]{
      _key,
      value,
      label
    })
  }
`;
