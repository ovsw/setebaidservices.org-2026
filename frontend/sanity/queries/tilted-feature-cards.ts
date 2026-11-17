import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const tiltedFeatureCardsQuery = groq`
  _type == "tiltedFeatureCards" => {
    title[]{
      ...
    },
    link{
      ${buttonQuery}
    },
    "cards": array::compact(cards[]{
      _key,
      image {
        ${imageQuery}
      },
      eyebrow,
      title,
      text,
      badgeLabel,
      badgeValue,
      "buttons": array::compact(buttons[]{
        ${buttonQuery}
      })
    })
  }
`;
