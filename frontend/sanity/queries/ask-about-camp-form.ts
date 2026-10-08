import { groq } from "next-sanity";

// @sanity-typegen-ignore
export const askAboutCampFormQuery = groq`
  _type == "askAboutCampForm" => {
    title,
    intro,
    topics,
    directorTopic,
    privacyLine,
    successMessage,
    errorMessage,
    "officePhone": *[_type == "settings" && _id == "settings"][0].contact.phone
  }
`;
