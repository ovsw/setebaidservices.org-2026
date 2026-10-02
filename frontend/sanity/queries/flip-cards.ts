import { groq } from "next-sanity";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const flipCardsQuery = groq`
  _type == "flipCards" => {
    intro[]{
      ${simpleRichTextQuery}
    },
    frontLabel,
    backLabel,
    turnLabel,
    "cards": array::compact(cards[]{
      _key,
      front,
      back,
      emoji
    })
  }
`;
