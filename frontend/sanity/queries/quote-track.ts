import { groq } from "next-sanity";
import { testimonialReferencesQuery } from "./shared/testimonial-references";

// @sanity-typegen-ignore
export const quoteTrackQuery = groq`
  _type == "quoteTrack" => {
    hint,
    heading[]{
      ...
    },
    ${testimonialReferencesQuery}
  }
`;
