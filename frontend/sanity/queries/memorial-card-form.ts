import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const memorialCardFormQuery = groq`
  _type == "memorialCardForm" => {
    title,
    intro,
    cardDesigns[]{
      _key,
      name,
      image {
        ${imageQuery}
      }
    },
    messages,
    givingLink,
    byMailLine,
    privacyLine,
    successMessage,
    errorMessage,
    "officePhone": *[_type == "settings" && _id == "settings"][0].contact.phone
  }
`;
