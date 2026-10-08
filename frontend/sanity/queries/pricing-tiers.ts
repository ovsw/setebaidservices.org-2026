import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const pricingTiersQuery = groq`
  _type == "pricingTiers" => {
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    intro,
    panelTitle,
    panelNote,
    "tiers": array::compact(tiers[]{
      _key,
      name,
      label,
      price,
      "buttons": array::compact(buttons[]{
        ${buttonQuery}
      }),
      application,
      note
    }),
    notes,
    link{
      ${buttonQuery}
    }
  }
`;
