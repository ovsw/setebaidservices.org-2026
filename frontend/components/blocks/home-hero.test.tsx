import { describe, expect, it } from "vitest";
import { getHomeHeroVideoEmbedUrl } from "./home-hero-video";

describe("getHomeHeroVideoEmbedUrl", () => {
  it("turns a YouTube watch link into a privacy-mode embed", () => {
    expect(
      getHomeHeroVideoEmbedUrl("https://www.youtube.com/watch?v=bSF5jKJhTvA"),
    ).toBe(
      "https://www.youtube-nocookie.com/embed/bSF5jKJhTvA?autoplay=1&rel=0&playsinline=1&enablejsapi=1",
    );
  });

  it("accepts short links", () => {
    expect(getHomeHeroVideoEmbedUrl("https://youtu.be/bSF5jKJhTvA")).toBe(
      "https://www.youtube-nocookie.com/embed/bSF5jKJhTvA?autoplay=1&rel=0&playsinline=1&enablejsapi=1",
    );
  });

  it("rejects links that are not YouTube", () => {
    expect(getHomeHeroVideoEmbedUrl("https://example.com/film.mp4")).toBeNull();
  });
});
