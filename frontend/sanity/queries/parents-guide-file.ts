import { defineQuery } from "next-sanity";

/**
 * The guide PDF of the first published Parent's guide form. The address
 * /parents-guide.pdf redirects to it, so the reply email never holds a CDN
 * address that a new upload would change.
 */
export const PARENTS_GUIDE_FILE_QUERY = defineQuery(/* groq */ `
  *[
    _type in ["page", "homePage"] &&
    count(blocks[_type == "parentsGuideForm" && defined(guide.asset)]) > 0
  ] | order(_createdAt asc)[0]
    .blocks[_type == "parentsGuideForm" && defined(guide.asset)][0]
    .guide.asset->url
`);
