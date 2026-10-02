import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const photoStripQuery = groq`
  _type == "photoStrip" => {
    "images": array::compact(images[]{
      _key,
      ${imageQuery}
    }),
    caption,
    link{
      ${buttonQuery}
    }
  }
`;
