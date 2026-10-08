import { groq } from "next-sanity";
import { ROOT_SLUG_FILTER } from "../../../shared/root-slug-filter";
import { metaQuery } from "./shared/meta";
import { pageBuilderQuery } from "./page-builder";

export const PAGE_QUERY = groq`
  *[_type == "page" && ${ROOT_SLUG_FILTER}][0]{
    _id,
    _type,
    title,
    description,
    "slug": slug.current,
    ${pageBuilderQuery},
    ${metaQuery},
  }
`;

export const PAGES_SLUGS_QUERY = groq`*[_type == "page" && defined(slug)]{slug}`;

export const PAGE_EXISTS_QUERY = groq`count(*[_type == "page" && ${ROOT_SLUG_FILTER}]) > 0`;
