import { describe, expect, it } from "vitest";
import { PUBLIC_VISIBILITY_FILTER } from "../../../shared/public-visibility";
import {
  BLOG_INDEX_QUERY,
  ELIGIBLE_BLOG_POSTS_COUNT_QUERY,
  LATEST_POST_QUERY,
  REGULAR_POSTS_COUNT_QUERY,
  REGULAR_POSTS_QUERY,
} from "./blog-index";
import { blogPostProjection, publishedPostFilter } from "./blog-post-listing";
import {
  CATEGORY_POSTS_COUNT_QUERY,
  CATEGORY_POSTS_QUERY,
  CATEGORY_QUERY,
  CATEGORY_STATIC_PARAMS_QUERY,
} from "./category";
import { latestArticlesQuery } from "./latest-articles";

describe("hidden stories and categories", () => {
  it("leaves hidden stories out of every listing, archive and count", () => {
    expect(publishedPostFilter).toContain(`&& ${PUBLIC_VISIBILITY_FILTER}`);
    for (const query of [
      LATEST_POST_QUERY,
      REGULAR_POSTS_QUERY,
      REGULAR_POSTS_COUNT_QUERY,
      ELIGIBLE_BLOG_POSTS_COUNT_QUERY,
      CATEGORY_POSTS_QUERY,
      CATEGORY_POSTS_COUNT_QUERY,
      CATEGORY_QUERY,
      latestArticlesQuery,
    ]) {
      expect(query).toContain(publishedPostFilter);
    }
  });

  it("leaves hidden categories out of the prebuild", () => {
    expect(CATEGORY_STATIC_PARAMS_QUERY).toMatch(
      new RegExp(`_type == "category"\\s*&& defined\\(slug\\.current\\)\\s*&& ${PUBLIC_VISIBILITY_FILTER}`),
    );
  });

  it("drops a hidden category from story cards", () => {
    expect(blogPostProjection).toContain(
      '"category": select(\n    category->hidden != true => category->{_id, title, slug}\n  )',
    );
    expect(CATEGORY_POSTS_QUERY).toContain("category->hidden != true => category->");
  });

  it("projects the flag so the routes check it without another request", () => {
    expect(BLOG_INDEX_QUERY).toMatch(/^\s*hidden,$/m);
    expect(CATEGORY_QUERY).toMatch(/^\s*hidden,$/m);
  });
});
