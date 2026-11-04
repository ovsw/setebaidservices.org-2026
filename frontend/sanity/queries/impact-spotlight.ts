import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const impactSpotlightQuery = groq`
  _type == "impactSpotlight" => {
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    intro,
    "stats": array::compact(stats[]{
      _key,
      value,
      detail,
      label
    }),
    shareTitle,
    shareCaption,
    familiesShare,
    familiesLabel,
    donorsLabel,
    statement,
    link{
      ${buttonQuery}
    }
  }
`;
