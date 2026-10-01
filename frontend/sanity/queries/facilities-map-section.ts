import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const facilitiesMapSectionQuery = groq`
  _type == "facilitiesMapSection" => {
    eyebrow,
    heading,
    introduction,
    showBigTop,
    bigTopHeading,
    bigTopArea,
    bigTopUnit,
    bigTopTagline,
    bigTopBody,
    bigTopGalleryAutoplay,
    bigTopGallery[]{
      _key,
      caption,
      ${imageQuery}
    },
    mapHeading,
    mapLocationLabel,
    stopLabel,
    "map": *[_id == "facilitiesMap" && _type == "facilitiesMap"][0]{
      _id,
      title,
      websiteAutoplay,
      mapImage{
        ${imageQuery}
      },
      placements[]{
        _key,
        x,
        y,
        labelPosition,
        prominent,
        facility->{
          _id,
          name,
          description,
          featuredImage{
            ${imageQuery}
          }
        }
      }
    }
  }
`;
