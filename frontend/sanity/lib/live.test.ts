import { describe, expect, it, vi } from "vitest";

const liveFetch = vi.hoisted(() => vi.fn(async () => ({ data: null, sourceMap: null, tags: [] })));

vi.mock("next-sanity/live", () => ({
  defineLive: () => ({ sanityFetch: liveFetch, SanityLive: () => null }),
  resolvePerspectiveFromCookies: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: vi.fn(), draftMode: vi.fn() }));
vi.mock("./client", () => ({ client: {} }));
vi.mock("./token", () => ({ token: undefined }));

const { sanityFetch } = await import("./live");

describe("sanityFetch", () => {
  it("tags every read, so the publish webhook can expire it", async () => {
    await sanityFetch({ query: "*[0]", perspective: "published", stega: false });
    await sanityFetch({ query: "*[1]", perspective: "published", stega: false, tags: ["extra"] });

    expect(liveFetch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ query: "*[0]", tags: ["sanity-content"] }),
    );
    expect(liveFetch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ query: "*[1]", tags: ["sanity-content", "extra"] }),
    );
  });
});
