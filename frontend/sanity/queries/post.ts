import { groq } from "next-sanity";
import { ROOT_SLUG_FILTER } from "../../../shared/root-slug-filter";
import {
  PUBLIC_VISIBILITY_FILTER,
  publicVisibilityFilterFor,
} from "../../../shared/public-visibility";
import { datedPostFilter } from "./blog-post-listing";
import { imageQuery } from "./shared/image";
import { metaQuery } from "./shared/meta";
import { postSharingPhotoQuery } from "./shared/sharing-photo";
import { richTextContentQuery } from "./shared/rich-text-content";

const POST_PROJECTION = groq`{
    // richTextContent V2
    _id,
    _type,
    title,
    slug,
    hidden,
    publishedAt,
    "excerpt": pt::text(excerpt),
    image{
      ${imageQuery}
    },
    body[]{
      ${richTextContentQuery}
    },
    author->{
      _id,
      _type,
      name,
      image {
        ${imageQuery}
      }
    },
    // A Hidden category answers 404, so the story does not link to it.
    "category": select(
      ${publicVisibilityFilterFor("category")} => category->{
        _id,
        _type,
        title,
        slug
      }
    ),
    _createdAt,
    _updatedAt,
    ${metaQuery},
    ${postSharingPhotoQuery},
}`;

export const POST_QUERY = groq`*[_type == "post" && ${ROOT_SLUG_FILTER}][0]${POST_PROJECTION}`;

// Not the listing filter: the story route checks Hidden itself, so a hidden
// story still opens in draft mode with the published perspective.
export const PUBLISHED_POST_QUERY = groq`*[
  ${datedPostFilter} && ${ROOT_SLUG_FILTER}
][0]${POST_PROJECTION}`;

export const POST_OG_IMAGE_QUERY = groq`*[
  _type == "post" && ${ROOT_SLUG_FILTER}
][0]{
  title,
  publishedAt,
  ${postSharingPhotoQuery}
}`;

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug)] | order(_createdAt desc){
    title,
    slug,
    publishedAt,
    "excerpt": pt::text(excerpt),
    image{
      ${imageQuery}
    },
}`;

export const POSTS_SLUGS_QUERY = groq`*[_type == "post" && defined(slug) && ${PUBLIC_VISIBILITY_FILTER}]{slug}`;
