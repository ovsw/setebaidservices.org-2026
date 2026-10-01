import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { minimalRichTextQuery } from "./shared/minimal-rich-text";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const packingChecklistQuery = groq`
  _type == "packingChecklist" => {
    eyebrow,
    title[]{
      ${minimalRichTextQuery}
    },
    intro,
    "groups": array::compact(groups[]{
      _key,
      title,
      tone,
      "items": array::compact(items[]{
        _key,
        label,
        quantity
      })
    }),
    note[]{
      ${simpleRichTextQuery}
    },
    "pdf": pdf.asset->{
      _id,
      url,
      originalFilename,
      size
    },
    image {
      ${imageQuery}
    }
  }
`;
