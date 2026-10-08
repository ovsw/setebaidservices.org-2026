import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

import { config } from "@/proxy";
import { BLOG_CATEGORY_POST_COUNTS_QUERY } from "@/sanity/queries/blog-index";
import { publishedPostFilter } from "@/sanity/queries/blog-post-listing";
import { PAGE_EXISTS_QUERY } from "@/sanity/queries/page";

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.mock("@/sanity/lib/client", () => ({
  client: { fetch: fetchMock },
}));

describe("blog post count cache", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  test("does not query Sanity for the main blog route", async () => {
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/stories"),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("passes post routes through without treating their slug as pagination", async () => {
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/stories/first-post"),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(config.matcher).toEqual([
      "/((?!_next|api|.*\\..*).*)",
      "/go/:path*",
    ]);
  });

  test("does not query Sanity for validated draft-mode pagination", async () => {
    vi.stubEnv("__NEXT_PREVIEW_MODE_ID", "preview-id");
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/stories/2/", {
        headers: { cookie: "__prerender_bypass=preview-id" },
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns 404 when a pagination route is out of range", async () => {
    fetchMock.mockResolvedValueOnce(1);
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/stories/2/"),
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  test("shares one Sanity request across concurrent cache misses", async () => {
    let resolveFetch!: (value: number) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const { proxy: freshProxy } = await import("@/proxy");
    const requests = [1, 2, 3].map(() =>
      freshProxy(new NextRequest("https://www.example.com/stories/2/")),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch(30);

    const responses = await Promise.all(requests);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
  });

  test("fetches a fresh count after the cache expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    fetchMock.mockResolvedValueOnce(30).mockResolvedValueOnce(30);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(new NextRequest("https://www.example.com/stories/2/"));

    await request();
    vi.advanceTimersByTime(59_999);
    await request();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    await request();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("fails open and clears a rejected post count refresh", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("Sanity unavailable"))
      .mockResolvedValueOnce(30);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(new NextRequest("https://www.example.com/stories/2/"));

    await expect(request()).resolves.toMatchObject({ status: 200 });
    await expect(request()).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("passes through the category archive route without querying Sanity", async () => {
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest(
        "https://www.example.com/stories/category/categories/",
      ),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    "/stories/category/categories/1",
    "/stories/category/categories/abc",
    "/stories/category/categories/2/extra",
    "/stories/category/categories/2/3",
  ])("rejects malformed category route %s", async (pathname) => {
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest(`https://www.example.com${pathname}`),
    );

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("uses the full category count at the 12/13-post boundary", async () => {
    fetchMock.mockResolvedValueOnce([
      { postCount: 12, slug: "categories" },
    ]);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(
        new NextRequest(
          "https://www.example.com/stories/category/categories/2/",
        ),
      );

    expect((await request()).status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("keeps category counts isolated by slug", async () => {
    fetchMock.mockResolvedValueOnce([
      { postCount: 12, slug: "categories" },
      { postCount: 13, slug: "buyer-education" },
    ]);
    const { proxy: freshProxy } = await import("@/proxy");

    const serviceTypesResponse = await freshProxy(
      new NextRequest(
        "https://www.example.com/stories/category/categories/2/",
      ),
    );
    const buyerEducationResponse = await freshProxy(
      new NextRequest(
        "https://www.example.com/stories/category/buyer-education/2/",
      ),
    );

    expect(serviceTypesResponse.status).toBe(404);
    expect(buyerEducationResponse.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("passes through unknown category slugs from the cached snapshot", async () => {
    fetchMock.mockResolvedValueOnce([
      { postCount: 13, slug: "categories" },
    ]);
    const { proxy: freshProxy } = await import("@/proxy");

    await freshProxy(
      new NextRequest(
        "https://www.example.com/stories/category/categories/2/",
      ),
    );
    const response = await freshProxy(
      new NextRequest(
        "https://www.example.com/stories/category/made-up/2/",
      ),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("does not query Sanity for validated draft-mode category pagination", async () => {
    vi.stubEnv("__NEXT_PREVIEW_MODE_ID", "preview-id");
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest(
        "https://www.example.com/stories/category/categories/2/",
        { headers: { cookie: "__prerender_bypass=preview-id" } },
      ),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("shares one category snapshot request across concurrent cache misses", async () => {
    let resolveFetch!: (value: Array<{ postCount: number; slug: string }>) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Array<{ postCount: number; slug: string }>>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const { proxy: freshProxy } = await import("@/proxy");
    const requests = ["categories", "buyer-education", "requirements"].map(
      (slug) =>
        freshProxy(
          new NextRequest(
            `https://www.example.com/stories/category/${slug}/2/`,
          ),
        ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch([
      { postCount: 13, slug: "categories" },
      { postCount: 13, slug: "buyer-education" },
      { postCount: 13, slug: "requirements" },
    ]);

    const responses = await Promise.all(requests);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
  });

  test("refreshes a stale category snapshot after the TTL", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    fetchMock
      .mockResolvedValueOnce([{ postCount: 12, slug: "categories" }])
      .mockResolvedValueOnce([{ postCount: 13, slug: "categories" }]);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(
        new NextRequest(
          "https://www.example.com/stories/category/categories/2/",
        ),
      );

    expect((await request()).status).toBe(404);
    vi.advanceTimersByTime(59_999);
    expect((await request()).status).toBe(404);
    vi.advanceTimersByTime(1);
    expect((await request()).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("fails open and clears a rejected category snapshot refresh", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("Sanity unavailable"))
      .mockResolvedValueOnce([{ postCount: 13, slug: "categories" }]);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(
        new NextRequest(
          "https://www.example.com/stories/category/categories/2/",
        ),
      );

    await expect(request()).resolves.toMatchObject({ status: 200 });
    await expect(request()).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("builds category counts from the shared published-post filter", () => {
    expect(BLOG_CATEGORY_POST_COUNTS_QUERY).toContain(publishedPostFilter);
  });
});

describe("unknown /go addresses", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function requestGo(path: string, init?: { headers: HeadersInit }) {
    const { proxy: freshProxy } = await import("@/proxy");
    return freshProxy(new NextRequest(`https://www.example.com${path}`, init));
  }

  test("sends an unknown code to Ask about camp with its tags", async () => {
    fetchMock.mockResolvedValueOnce(false);

    const response = await requestGo("/go/spring-fair/");

    expect(fetchMock).toHaveBeenCalledWith(PAGE_EXISTS_QUERY, {
      slug: "go/spring-fair",
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://www.example.com/ask-about-camp?utm_source=spring-fair&utm_medium=qr-card",
    );
  });

  test("passes a published /go page through", async () => {
    fetchMock.mockResolvedValueOnce(true);

    const response = await requestGo("/go/events");

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  test.each([
    "/go/Spring_Fair",
    "/go/caf%C3%A9",
    "/go/fair/2026",
    "/go/card.png",
  ])("tags the badly formed code %s as unknown", async (path) => {
    fetchMock.mockResolvedValue(false);

    const response = await requestGo(path);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://www.example.com/ask-about-camp?utm_source=unknown&utm_medium=qr-card",
    );
  });

  test("leaves draft-only /go pages to the page renderer in draft mode", async () => {
    vi.stubEnv("__NEXT_PREVIEW_MODE_ID", "preview-id");

    const response = await requestGo("/go/new-card", {
      headers: { cookie: "__prerender_bypass=preview-id" },
    });

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("fails open when Sanity cannot answer", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Sanity unavailable"));

    const response = await requestGo("/go/events");

    expect(response.status).toBe(200);
  });
});
