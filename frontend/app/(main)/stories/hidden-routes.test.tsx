import { isValidElement, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetches = vi.hoisted(() => ({
  fetchBlogIndex: vi.fn(),
  fetchBlogPostSettings: vi.fn(),
  fetchCategory: vi.fn(),
  fetchCategoryPosts: vi.fn(),
  fetchCategoryPostsCount: vi.fn(),
  fetchLatestPost: vi.fn(),
  fetchRegularPosts: vi.fn(),
  fetchRegularPostsCount: vi.fn(),
  fetchSanityPostBySlug: vi.fn(),
}));
const draftMode = vi.hoisted(() => vi.fn());
const getDynamicFetchOptions = vi.hoisted(() => vi.fn());
const RootContentView = vi.hoisted(() => vi.fn(() => null));
const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("@/sanity/lib/fetch", () => ({ ...fetches, POSTS_SLUGS_QUERY: "post slugs" }));
vi.mock("@/sanity/lib/live", () => ({
  getDynamicFetchOptions,
  sanityFetchMetadata: vi.fn(),
  sanityFetchStaticParams: vi.fn(),
}));
vi.mock("@/sanity/lib/metadata", () => ({
  generateBlogIndexMetadata: vi.fn(),
  generateCategoryMetadata: vi.fn(),
  generatePageMetadata: vi.fn(),
}));
vi.mock("@/sanity/lib/seo-settings", () => ({ fetchSeoSettings: vi.fn() }));
vi.mock("@/components/root-content", () => ({ RootContentView }));
vi.mock("@/components/blocks", () => ({ default: () => null }));
vi.mock("@/components/post-sidebar/model", () => ({ getBlogPostSidebar: () => null }));
vi.mock("next/headers", () => ({ draftMode }));
vi.mock("next/navigation", () => ({ notFound }));

import BlogPage from "./page";
import BlogSegmentPage from "./[page]/page";
import CategoryPage from "./category/[slug]/page";
import PaginatedCategoryPage from "./category/[slug]/[page]/page";

/**
 * Runs a route's async server components until the view they render: the
 * story view, or the markup of the index or category archive.
 */
async function renderRoute(route: Promise<unknown>) {
  let node: unknown = await route;
  while (
    isValidElement(node) &&
    typeof node.type === "function" &&
    node.type !== RootContentView
  ) {
    const element = node as ReactElement<Record<string, unknown>>;
    node = await (element.type as (props: object) => unknown)(element.props);
  }
  return node;
}

const hiddenPost = { _id: "post-1", _type: "post", hidden: true, title: "A story" };
const hiddenIndex = { _id: "blogIndex", _type: "blogIndex", hidden: true, title: "Stories", blocks: [] };
const hiddenCategory = {
  _id: "category-1",
  _type: "category",
  hidden: true,
  publishedPostCount: 0,
  slug: { current: "news" },
  title: "News",
};

function withoutHidden(document: { hidden?: boolean }) {
  const copy = { ...document };
  delete copy.hidden;
  return copy;
}

const routes = {
  story: () =>
    renderRoute(BlogSegmentPage({ params: Promise.resolve({ page: "a-story" }) })),
  "stories index": () => renderRoute(BlogPage()),
  "stories index, page 2": () =>
    renderRoute(BlogSegmentPage({ params: Promise.resolve({ page: "2" }) })),
  category: () =>
    renderRoute(CategoryPage({ params: Promise.resolve({ slug: "news" }) })),
  "category, page 2": () =>
    renderRoute(
      PaginatedCategoryPage({ params: Promise.resolve({ page: "2", slug: "news" }) }),
    ),
};

function stubDocuments(documents: {
  blogIndex: object;
  category: object;
  post: object;
}) {
  fetches.fetchSanityPostBySlug.mockResolvedValue(documents.post);
  fetches.fetchBlogPostSettings.mockResolvedValue(null);
  fetches.fetchBlogIndex.mockResolvedValue(documents.blogIndex);
  // Enough posts for a second index page and a second category page.
  fetches.fetchLatestPost.mockResolvedValue({ _id: "post-latest" });
  fetches.fetchRegularPosts.mockResolvedValue([]);
  fetches.fetchRegularPostsCount.mockResolvedValue(40);
  fetches.fetchCategory.mockResolvedValue(documents.category);
  fetches.fetchCategoryPosts.mockResolvedValue([]);
  fetches.fetchCategoryPostsCount.mockResolvedValue(40);
}

describe("hidden stories, stories index and categories", () => {
  beforeEach(() => {
    for (const fetch of Object.values(fetches)) fetch.mockReset();
    draftMode.mockReset();
    getDynamicFetchOptions.mockReset();
    notFound.mockClear();
  });

  for (const [name, render] of Object.entries(routes)) {
    it(`${name}: returns 404 to the public when hidden`, async () => {
      draftMode.mockResolvedValue({ isEnabled: false });
      stubDocuments({ blogIndex: hiddenIndex, category: hiddenCategory, post: hiddenPost });

      await expect(render()).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it(`${name}: renders when hidden in draft mode, in either perspective`, async () => {
      draftMode.mockResolvedValue({ isEnabled: true });
      stubDocuments({ blogIndex: hiddenIndex, category: hiddenCategory, post: hiddenPost });

      for (const perspective of ["drafts", "published"]) {
        getDynamicFetchOptions.mockResolvedValue({ perspective, stega: true });
        await expect(render()).resolves.toBeTruthy();
      }
      expect(notFound).not.toHaveBeenCalled();
    });

    it(`${name}: renders to the public without a Hidden value`, async () => {
      draftMode.mockResolvedValue({ isEnabled: false });
      stubDocuments({
        blogIndex: withoutHidden(hiddenIndex),
        category: withoutHidden(hiddenCategory),
        post: withoutHidden(hiddenPost),
      });

      await expect(render()).resolves.toBeTruthy();
      expect(notFound).not.toHaveBeenCalled();
    });
  }

  it("hands the hidden story itself to the view in draft mode", async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    getDynamicFetchOptions.mockResolvedValue({ perspective: "published", stega: true });
    stubDocuments({ blogIndex: hiddenIndex, category: hiddenCategory, post: hiddenPost });

    const view = (await routes.story()) as ReactElement<{ content: unknown }>;
    expect(view.type).toBe(RootContentView);
    expect(view.props.content).toBe(hiddenPost);
  });
});
