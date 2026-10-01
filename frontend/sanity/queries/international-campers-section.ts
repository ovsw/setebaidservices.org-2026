import { groq } from "next-sanity";
import { linkInternalHref } from "./shared/internal-href";

// @sanity-typegen-ignore
export const internationalCampersSectionQuery = groq`
  _type == "internationalCampersSection" => {
    eyebrow,
    heading[]{
      ...
    },
    description,
    linkLabel,
    "link": {
      "openInNewTab": link.openInNewTab,
      "href": select(
        link.type == "internal" => ${linkInternalHref},
        link.type == "external" => link.external,
        link.href
      )
    }
  }
`;
