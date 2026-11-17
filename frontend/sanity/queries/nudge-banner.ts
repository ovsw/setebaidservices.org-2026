import { groq } from "next-sanity";
import { ctaButtonsQuery } from "./shared/cta-buttons";

// @sanity-typegen-ignore
export const nudgeBannerQuery = groq`
  _type == "nudgeBanner" => {
    title,
    description,
    ${ctaButtonsQuery}
  }
`;
