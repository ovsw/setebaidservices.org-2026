import { groq } from "next-sanity";
import { buttonQuery } from "./shared/button";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";

// @sanity-typegen-ignore
export const impactNumbersQuery = groq`
  _type == "impactNumbers" => {
    "layout": coalesce(layout, "band"),
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    season,
    intro,
    "stats": array::compact(stats[]{
      _key,
      value,
      detail,
      label
    }),
    link{
      ${buttonQuery}
    },
    share{
      title,
      subtitle,
      familiesShare,
      familiesLabel,
      donorsLabel,
      note
    }
  }
`;
