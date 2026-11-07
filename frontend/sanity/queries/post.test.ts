import { describe, expect, it } from "vitest";
import { datedPostFilter, publishedPostFilter } from "./blog-post-listing";
import { POST_QUERY, POSTS_SLUGS_QUERY, PUBLISHED_POST_QUERY } from "./post";
import { ROOT_SLUG_FILTER } from "../../../shared/root-slug-filter";
import { PUBLIC_VISIBILITY_FILTER } from "../../../shared/public-visibility";

describe("post route queries", () => {
  it("requires a publish date on the published route", () => {
    expect(PUBLISHED_POST_QUERY).toContain(datedPostFilter);
    expect(PUBLISHED_POST_QUERY).toContain(ROOT_SLUG_FILTER);
  });

  it("leaves Hidden to the route check, so the client review link still opens a hidden story", () => {
    expect(PUBLISHED_POST_QUERY).not.toContain(publishedPostFilter);
    expect(PUBLISHED_POST_QUERY).toMatch(/^\s*hidden,$/m);
    expect(POST_QUERY).toMatch(/^\s*hidden,$/m);
  });

  it("drops a hidden category from the story page", () => {
    expect(POST_QUERY).toContain(
      '"category": select(\n      category->hidden != true => category->{',
    );
  });

  it("leaves hidden stories out of the prebuild", () => {
    expect(POSTS_SLUGS_QUERY).toContain(PUBLIC_VISIBILITY_FILTER);
  });

  it("still allows draft-only posts on the draft route", () => {
    expect(POST_QUERY).toContain('_type == "post"');
    expect(POST_QUERY).toContain(ROOT_SLUG_FILTER);
    expect(POST_QUERY).not.toContain(datedPostFilter);
  });
});
