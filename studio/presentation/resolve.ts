import {
  defineLocations,
  defineDocuments,
} from "sanity/presentation";
import type { PresentationPluginOptions } from "sanity/presentation";
import { ROOT_SLUG_FILTER } from "../../shared/root-slug-filter.ts";
import {
  getPresentationPath,
  resolveCategoryPath,
  resolveContentPath,
} from "./routes.ts";

export { resolveContentPath } from "./routes.ts";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    page: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => {
        const href = resolveContentPath(doc?.slug);
        return {
          locations: href
            ? [{ title: doc?.title || "Untitled", href }]
            : [],
        };
      },
    }),
    post: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled",
            href: getPresentationPath("post", doc?.slug) ?? "/stories",
          },
          { title: "Stories", href: "/stories" },
        ],
      }),
    }),
    category: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: (doc) => {
        const href = resolveCategoryPath(doc?.slug);
        return {
          locations: href
            ? [{ title: doc?.title || "Untitled Category", href }]
            : [],
        };
      },
    }),
    blogIndex: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || "Blog Index", href: "/stories" }],
      }),
    }),
    homePage: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || "Home Page", href: "/" }],
      }),
    }),
  },
  mainDocuments: defineDocuments([
    {
      route: "/stories",
      filter: `_id == "blogIndex"`,
    },
    {
      route: "/",
      filter: `_id == 'homePage' && _type == 'homePage'`,
    },
    {
      route: "/stories/category/:slug",
      filter: `_type == 'category' && slug.current in [$slug, "/" + $slug]`,
    },
    {
      route: "/stories/:slug",
      filter: `_type == 'post' && ${ROOT_SLUG_FILTER}`,
    },
    {
      route: "/:slug(.+)",
      filter: `_type == 'page' && ${ROOT_SLUG_FILTER}`,
    },
  ]),
};
