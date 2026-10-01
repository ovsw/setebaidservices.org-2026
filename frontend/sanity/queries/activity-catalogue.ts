import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const activityCatalogueQuery = groq`
  _type == "activityCatalogue" => {
    eyebrow,
    heading[]{
      ...
    },
    intro,
    "groups": array::compact(groups[]{
      _key,
      title,
      blurb,
      "activities": array::compact(activities[]{
        _key,
        ...(@->{
          _id,
          title,
          line,
          image {
            ${imageQuery}
          },
          "programTitle": program->title,
          "programHref": select(
            defined(program->slug.current) => "/" + array::join(string::split(program->slug.current, "/")[@ != ""], "/")
          )
        })
      })
    })
  }
`;
