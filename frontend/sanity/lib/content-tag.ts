/**
 * The cache tag on every Sanity read. The publish webhook
 * (`app/api/revalidate`) expires it, so a publish refreshes every page that
 * shows Sanity content, whether or not a visitor has the page open.
 *
 * It must not start with "sanity:", the prefix of the Live API's own tags.
 */
export const SANITY_CONTENT_TAG = "sanity-content";
