import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const bentoCollageQuery = groq`
  _type == "bentoCollage" => {
    eyebrow,
    title[]{
      ...
    },
    body,
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
    })
  }
`;
