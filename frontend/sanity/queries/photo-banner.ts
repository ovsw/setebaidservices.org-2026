import { groq } from "next-sanity";
import { ctaButtonsQuery } from "./shared/cta-buttons";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const photoBannerQuery = groq`
  _type == "photoBanner" => {
    eyebrow,
    image{
      ${imageQuery}
    },
    title,
    description,
    ${ctaButtonsQuery}
  }
`;
