import {
  PUBLIC_VISIBILITY_FILTER,
  publicVisibilityFilterFor,
} from "../../../shared/public-visibility";
import { imageQuery } from "./shared/image";

/**
 * A post with a URL and a publish date: the story route can serve it. The
 * route itself decides about Hidden, so the client review link (draft mode,
 * published perspective) still opens a hidden story.
 */
export const datedPostFilter =
  `_type == "post" && defined(slug.current) && defined(publishedAt)`;

/**
 * A post the Website lists and counts: dated and not Hidden. Feeds story
 * listings, category archives, post counts, the story prebuild and the
 * sitemap.
 */
export const publishedPostFilter =
  `${datedPostFilter} && ${PUBLIC_VISIBILITY_FILTER}`;

export const blogPostOrder = `publishedAt desc, _createdAt desc, _id asc`;

/**
 * A post card's category: dropped when the category is Hidden, so the card
 * never links to a category archive that answers 404.
 */
export const postCardCategoryProjection = `"category": select(
    ${publicVisibilityFilterFor("category")} => category->{_id, title, slug}
  )`;

/** One post card's fields, shared by the Blog page and Latest Posts sections. */
export const blogPostProjection = `
  _id,
  title,
  slug,
  publishedAt,
  "excerpt": pt::text(excerpt),
  image {${imageQuery}},
  ${postCardCategoryProjection}
`;
