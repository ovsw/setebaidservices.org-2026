import { isValidElement, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sanityFetchMetadata = vi.hoisted(() => vi.fn());
const sanityFetchStaticParams = vi.hoisted(() => vi.fn());
const fetchSanityPageBySlug = vi.hoisted(() => vi.fn());
const getDynamicFetchOptions = vi.hoisted(() => vi.fn());
const draftMode = vi.hoisted(() => vi.fn());
const RootContentView = vi.hoisted(() => vi.fn());
const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("@/components/root-content", () => ({ RootContentView }));
vi.mock("@/sanity/lib/fetch", () => ({
  fetchSanityPageBySlug,
  PAGES_SLUGS_QUERY: "pages",
}));
vi.mock("@/sanity/lib/live", () => ({
  getDynamicFetchOptions,
  sanityFetchMetadata,
  sanityFetchStaticParams,
}));
vi.mock("@/sanity/lib/metadata", () => ({
  generatePageMetadata: vi.fn(),
}));
vi.mock("@/sanity/queries/page", () => ({ PAGE_QUERY: "page" }));
vi.mock("next/headers", () => ({ draftMode }));
vi.mock("next/navigation", () => ({ notFound }));

import PageRoute, { generateMetadata, generateStaticParams } from "./page";

describe("root content metadata", () => {
  beforeEach(() => {
    sanityFetchMetadata.mockReset();
    sanityFetchStaticParams.mockReset();
    notFound.mockClear();
  });

  it("generates every segment for nested page slugs", async () => {
    sanityFetchStaticParams.mockResolvedValue({
      data: [{ slug: { current: "/staff/available-positions/" } }],
    });

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: ["staff", "available-positions"] },
    ]);
  });

  it("does not generate page routes inside the stories namespace", async () => {
    sanityFetchStaticParams.mockResolvedValue({
      data: [{ slug: { current: "stories/first-post" } }],
    });

    // Only the not-found sentinel remains, because Cache Components rejects
    // an empty list.
    await expect(generateStaticParams()).resolves.toEqual([
      { slug: ["__missing-page__"] },
    ]);
  });

  it("does not turn a draft-only route into a 404", async () => {
    sanityFetchMetadata.mockResolvedValue({ data: null });

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: ["draft-post"] }) }),
    ).resolves.toEqual({});
    expect(notFound).not.toHaveBeenCalled();
  });
});

/** Runs the route's async server components down to the rendered view. */
async function renderRoute(slug: string[]) {
  let node: unknown = await PageRoute({ params: Promise.resolve({ slug }) });
  while (isValidElement(node) && node.type !== RootContentView) {
    const element = node as ReactElement<Record<string, unknown>>;
    node = await (element.type as (props: object) => unknown)(element.props);
  }
  return node as ReactElement<{ content: unknown }>;
}

describe("hidden pages", () => {
  const hiddenPage = { _id: "page-1", _type: "page", hidden: true, title: "Campaigns" };

  beforeEach(() => {
    fetchSanityPageBySlug.mockReset();
    draftMode.mockReset();
    getDynamicFetchOptions.mockReset();
    notFound.mockClear();
  });

  it("returns 404 to the public for a hidden page", async () => {
    draftMode.mockResolvedValue({ isEnabled: false });
    fetchSanityPageBySlug.mockResolvedValue(hiddenPage);

    await expect(renderRoute(["donate", "campaigns"])).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetchSanityPageBySlug).toHaveBeenCalledWith(
      expect.objectContaining({ perspective: "published", slug: "donate/campaigns" }),
    );
  });

  it("renders a hidden page in draft mode, in either perspective", async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    fetchSanityPageBySlug.mockResolvedValue(hiddenPage);

    for (const perspective of ["drafts", "published"]) {
      getDynamicFetchOptions.mockResolvedValue({ perspective, stega: true });
      const view = await renderRoute(["donate", "campaigns"]);
      expect(view.props.content).toBe(hiddenPage);
    }
    expect(notFound).not.toHaveBeenCalled();
  });

  it("renders a page without a Hidden value to the public", async () => {
    const page = { _id: "page-2", _type: "page", title: "About" };
    draftMode.mockResolvedValue({ isEnabled: false });
    fetchSanityPageBySlug.mockResolvedValue(page);

    const view = await renderRoute(["about"]);
    expect(view.props.content).toBe(page);
    expect(notFound).not.toHaveBeenCalled();
  });
});
