import { groq } from "next-sanity";
import { PUBLIC_VISIBILITY_FILTER } from "../../../shared/public-visibility";
import { ROOT_SLUG_FILTER } from "../../../shared/root-slug-filter";
import { metaQuery } from "./shared/meta";
import { pageSharingPhotoQuery } from "./shared/sharing-photo";
import { pageBuilderQuery } from "./page-builder";

export const PAGE_QUERY = groq`
  *[_type == "page" && ${ROOT_SLUG_FILTER}][0]{
    _id,
    _type,
    title,
    description,
    "slug": slug.current,
    hidden,
    ${pageBuilderQuery},
    ${metaQuery},
    ${pageSharingPhotoQuery},
  }
`;

export const PAGES_SLUGS_QUERY = groq`*[_type == "page" && defined(slug) && ${PUBLIC_VISIBILITY_FILTER}]{slug}`;

export const PAGE_EXISTS_QUERY = groq`count(*[_type == "page" && ${ROOT_SLUG_FILTER}]) > 0`;
