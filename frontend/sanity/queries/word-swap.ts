import { groq } from "next-sanity";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const wordSwapQuery = groq`
  _type == "wordSwap" => {
    struckWord,
    word,
    body[]{
      ${simpleRichTextQuery}
    }
  }
`;
