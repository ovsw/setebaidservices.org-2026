import { groq } from "next-sanity";
import { ctaButtonsQuery } from "./shared/cta-buttons";

// @sanity-typegen-ignore
export const ctaBannerQuery = groq`
  _type == "ctaBanner" => {
    title,
    description,
    ${ctaButtonsQuery}
  }
`;
