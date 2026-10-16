import {
  defineBlueprint,
  defineDocumentFunction,
  defineSyncTagInvalidateFunction,
} from "@sanity/blueprints";
import { requireStudioEnvironmentValue } from "./environment";

// The same values Studio and the CLI use, so a different dataset (for example
// a test dataset) gets its own function binding without a code edit. A
// missing value stops `sanity blueprints deploy` with the variable's name.
const projectId = requireStudioEnvironmentValue(
  "SANITY_STUDIO_PROJECT_ID",
  process.env.SANITY_STUDIO_PROJECT_ID,
);
const dataset = requireStudioEnvironmentValue(
  "SANITY_STUDIO_DATASET",
  process.env.SANITY_STUDIO_DATASET,
);

export default defineBlueprint({
  resources: [
    // On every publish, tells the Website which cached content changed. See
    // "Content goes live on publish" in docs/deployment.md.
    defineSyncTagInvalidateFunction({
      name: "invalidate-tags",
      src: "./functions/invalidate-tags",
      timeout: 20,
      event: {
        resource: { type: "dataset", id: `${projectId}.${dataset}` },
      },
    }),

    // Creates a Redirect from the old address when a published page, post or
    // category changes its slug, so links to the old address keep working.
    defineDocumentFunction({
      name: "auto-redirect",
      src: "./functions/auto-redirect",
      memory: 2,
      timeout: 30,
      event: {
        // Not "publish": that shorthand also fires on Content Release versions,
        // whose new address is not live yet.
        on: ["create", "update"],
        includeDrafts: false,
        includeAllVersions: false,
        filter:
          '_type in ["page", "post", "category"] && delta::changedAny(slug.current)',
        projection: `{
          "documentId": after()._id,
          "documentType": after()._type,
          "beforeSlug": before().slug.current,
          "slug": after().slug.current
        }`,
      },
    }),
  ],
});
