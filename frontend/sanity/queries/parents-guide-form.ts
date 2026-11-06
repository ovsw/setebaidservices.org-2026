import { groq } from "next-sanity";

// @sanity-typegen-ignore
export const parentsGuideFormQuery = groq`
  _type == "parentsGuideForm" => {
    title,
    intro,
    privacyLine,
    successMessage,
    errorMessage,
    "officePhone": *[_type == "settings" && _id == "settings"][0].contact.phone
  }
`;
