import type {
  BLOG_INDEX_QUERY_RESULT,
  HOME_PAGE_QUERY_RESULT,
  PAGE_QUERY_RESULT,
  POST_QUERY_RESULT,
  SEO_SETTINGS_QUERY_RESULT,
} from "@/sanity.types";
import type { CategoryArchive } from "@/sanity/queries/category";
import { describe, expect, it } from "vitest";
import { verifyPostOgImageSignature } from "@/lib/post-og-image";
import { verifyOgImageSignature } from "@/lib/post-og-image";
import {
  generateBlogIndexMetadata,
  generateCategoryMetadata,
  generatePageMetadata,
} from "./metadata";

const siteImageAsset = {
  _id: "image-site1234-2400x1600-jpg",
  url: "https://cdn.sanity.io/images/test-project/test/site1234-2400x1600.jpg",
  mimeType: "image/jpeg",
};

const siteSettings = {
  seoDescription: "Summer camp in Ontario.",
  seoImage: { asset: siteImageAsset },
} as unknown as SEO_SETTINGS_QUERY_RESULT;

const sharingPhoto = {
  asset: { _ref: "image-social1234-1600x900-jpg", _type: "reference" as const },
  crop: { _type: "sanity.imageCrop" as const, top: 0.1, bottom: 0.1, left: 0, right: 0.2 },
  hotspot: { _type: "sanity.imageHotspot" as const, x: 0.3, y: 0.5, width: 0.2, height: 0.2 },
};

function withMeta<T extends { meta?: object | null }>(doc: T, meta: object) {
  return { ...doc, meta: { ...doc.meta, ...meta } } as unknown as T;
}

const post = {
  _id: "post-1",
  _type: "post",
  _updatedAt: "2026-08-15T12:00:00Z",
  publishedAt: "2026-08-10T12:00:00Z",
  slug: { _type: "slug", current: "market-trends" },
  title: "Why Market Trends Change",
  meta: {
    title: "Market trends",
    description: "A practical method rate explanation.",
    image: null,
    noindex: false,
  },
} as unknown as NonNullable<POST_QUERY_RESULT>;

const page = {
  _id: "page-1",
  _type: "page",
  _updatedAt: "2026-08-15T12:00:00Z",
  slug: "about",
  title: "About",
  meta: {
    title: "About | About Example Company",
    description: "About Example Company.",
    image: null,
    noindex: false,
  },
} as unknown as NonNullable<PAGE_QUERY_RESULT>;

const homePage = {
  _id: "homePage",
  _type: "homePage",
  title: "Home",
  meta: {
    title: "Example Knowledge Base | Example Company",
    description: "A practical resource library.",
    noindex: false,
  },
} as unknown as NonNullable<HOME_PAGE_QUERY_RESULT>;

const blogIndex = {
  _id: "blogIndex",
  _type: "blogIndex",
  title: "Insights Blog",
  description: "Practical method guidance.",
  meta: {
    title: "Method Advice | Example Company",
    description: "Practical method guidance.",
    image: null,
    noindex: false,
  },
} as unknown as NonNullable<BLOG_INDEX_QUERY_RESULT>;

const category = {
  _id: "category-1",
  _type: "category",
  title: "Categories",
  slug: { current: "categories" },
  description: "Compare service options.",
  publishedPostCount: 4,
  meta: {
    title: "Resource Guides | Example Company",
    description: "Compare service options.",
    image: null,
    noindex: false,
  },
} satisfies CategoryArchive;

describe("generatePageMetadata", () => {
  it("uses one signed generated card for post Open Graph and Twitter metadata", () => {
    const metadata = generatePageMetadata({ page: post, path: "/stories/market-trends" });
    const image = metadata.openGraph.images[0];
    const url = new URL(image.url);

    expect(metadata.openGraph.type).toBe("article");
    expect(metadata.title).toBe("Market trends");
    expect(metadata.openGraph.title).toBe(
      "Market trends | Example Company",
    );
    expect(metadata.openGraph).toHaveProperty(
      "publishedTime",
      post.publishedAt,
    );
    expect(image).toMatchObject({
      width: 1200,
      height: 630,
      alt: `${post.title} | Example Company`,
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Market trends | Example Company",
      images: [image],
    });
    expect(
      verifyPostOgImageSignature({
        identity: {
          slug: "market-trends",
          revision: url.searchParams.get("rev") || "",
          version: url.searchParams.get("v") || "",
        },
        secret: process.env.OG_IMAGE_SECRET || "",
        signature: url.searchParams.get("sig") || "",
      }),
    ).toBe(true);
  });

  it("uses a signed generated card for ordinary page Open Graph and Twitter metadata", () => {
    const metadata = generatePageMetadata({ page, path: "/about" });
    const image = metadata.openGraph.images[0];
    const url = new URL(image.url);

    expect(metadata.openGraph).toMatchObject({
      title: "About | About Example Company",
      type: "website",
      images: [
        { width: 1200, height: 630, alt: "About | About Example Company" },
      ],
    });
    expect(url.pathname).toBe("/api/og/page/page/about");
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "About | About Example Company",
      images: [image],
    });
    expect(
      verifyOgImageSignature({
        identity: {
          key: "page:about",
          revision: url.searchParams.get("rev") || "",
          version: url.searchParams.get("v") || "",
        },
        secret: process.env.OG_IMAGE_SECRET || "",
        signature: url.searchParams.get("sig") || "",
      }),
    ).toBe(true);
    expect(metadata.title).toEqual({
      absolute: "About | About Example Company",
    });
  });

  it("falls back to the content title when the override is missing", () => {
    const pageWithoutOverride = {
      ...page,
      meta: { ...page.meta, title: null },
    } as NonNullable<PAGE_QUERY_RESULT>;
    const metadata = generatePageMetadata({
      page: pageWithoutOverride,
      path: "/about/",
    });

    expect(metadata.title).toBe("About");
    expect(metadata.openGraph.title).toBe(
      "About | Example Company",
    );
  });

  it("puts the Sharing photo inside the generated card", () => {
    const plain = generatePageMetadata({ page, path: "/about", settings: siteSettings });
    const withPhoto = generatePageMetadata({
      page: { ...page, sharingPhoto },
      path: "/about",
      settings: siteSettings,
    });
    const plainUrl = new URL(plain.openGraph.images[0].url);
    const photoUrl = new URL(withPhoto.openGraph.images[0].url);

    expect(photoUrl.pathname).toBe("/api/og/page/page/about");
    // A new photo, crop or hotspot gives the card a new URL.
    expect(photoUrl.searchParams.get("rev")).not.toBe(
      plainUrl.searchParams.get("rev"),
    );
    expect(withPhoto.openGraph.images[0]).toMatchObject({
      width: 1200,
      height: 630,
      alt: "About | About Example Company",
    });
    expect(withPhoto.twitter.images).toEqual(withPhoto.openGraph.images);
  });

  it("uses the Site sharing image when no generated card is available", () => {
    const metadata = generatePageMetadata({
      page: { ...page, title: "" } as NonNullable<PAGE_QUERY_RESULT>,
      path: "/not//valid",
      settings: siteSettings,
    });
    const image = metadata.openGraph.images[0];

    expect(image.url).toContain("site1234-2400x1600.jpg");
    expect(image).toMatchObject({ width: 1200, height: 630 });
    expect(metadata.twitter.images).toEqual([image]);
  });

  it("uses the static safety image when nothing else is usable", () => {
    const metadata = generatePageMetadata({
      page: { ...page, title: "" } as NonNullable<PAGE_QUERY_RESULT>,
      path: "/not//valid",
      settings: { seoDescription: null, seoImage: { asset: null } } as never,
    });

    expect(metadata.openGraph.images[0].url).toBe(
      "https://example.test/images/og-default.png",
    );
  });

  it("uses one absolute, branded homepage title", () => {
    const metadata = generatePageMetadata({ page: homePage, path: "/" });

    expect(metadata.title).toEqual({
      absolute: "Example Knowledge Base | Example Company",
    });
    expect(metadata.openGraph.title).toBe(
      "Example Knowledge Base | Example Company",
    );
    expect(metadata.twitter.title).toBe(
      "Example Knowledge Base | Example Company",
    );
    expect(metadata.openGraph.images[0].alt).toBe(
      "Example Knowledge Base | Example Company",
    );
  });
});

describe("generateBlogIndexMetadata", () => {
  it("derives a unique branded title for pagination", () => {
    const metadata = generateBlogIndexMetadata({ blogIndex, page: 2 });
    const title = "Method Advice | Example Company - Page 2";

    expect(metadata.title).toEqual({ absolute: title });
    expect(metadata.openGraph.title).toBe(title);
    expect(metadata.openGraph.images[0].alt).toBe(title);
    expect(metadata.twitter.title).toBe(title);
  });
});

describe("generateCategoryMetadata", () => {
  it.each([
    [1, "Resource Guides | Example Company"],
    [2, "Resource Guides | Example Company - Page 2"],
  ])("derives the category title for page %i", (pageNumber, pageTitle) => {
    const metadata = generateCategoryMetadata({ category, page: pageNumber });

    expect(metadata.title).toEqual({ absolute: pageTitle });
    expect(metadata.openGraph.title).toBe(pageTitle);
    expect(metadata.openGraph.images[0].alt).toBe(pageTitle);
    expect(metadata.twitter.title).toBe(pageTitle);
  });
});

describe("description resolution", () => {
  function descriptions(metadata: {
    description?: string;
    openGraph: { description?: string };
    twitter: { description?: string };
  }) {
    return [
      metadata.description,
      metadata.openGraph.description,
      metadata.twitter.description,
    ];
  }

  it("uses the SEO description for search, Open Graph, and Twitter", () => {
    const metadata = generatePageMetadata({ page, path: "/about", settings: siteSettings });

    expect(descriptions(metadata)).toEqual(Array(3).fill("About Example Company."));
  });

  it("falls back to the page description when the SEO description is blank", () => {
    const metadata = generatePageMetadata({
      page: {
        ...withMeta(page, { description: "   " }),
        description: "Our camp story.",
      } as NonNullable<PAGE_QUERY_RESULT>,
      path: "/about",
      settings: siteSettings,
    });

    expect(descriptions(metadata)).toEqual(Array(3).fill("Our camp story."));
  });

  it("falls back to the post summary text", () => {
    const metadata = generatePageMetadata({
      page: {
        ...withMeta(post, { description: null }),
        excerpt: "A short summary.",
      } as NonNullable<POST_QUERY_RESULT>,
      path: "/stories/market-trends",
      settings: siteSettings,
    });

    expect(descriptions(metadata)).toEqual(Array(3).fill("A short summary."));
  });

  it("falls back to the site-wide description, then to none", () => {
    const bare = withMeta(homePage, { description: "" });

    expect(
      descriptions(generatePageMetadata({ page: bare, path: "/", settings: siteSettings })),
    ).toEqual(Array(3).fill("Summer camp in Ontario."));
    expect(
      descriptions(generatePageMetadata({ page: bare, path: "/", settings: null })),
    ).toEqual([undefined, undefined, undefined]);
  });

  it("adds archive pagination wording after choosing the base description", () => {
    const listing = withMeta(
      { ...blogIndex, description: " " } as NonNullable<BLOG_INDEX_QUERY_RESULT>,
      { description: null },
    );
    const metadata = generateBlogIndexMetadata({
      blogIndex: listing,
      page: 2,
      settings: siteSettings,
    });

    expect(descriptions(metadata)).toEqual(
      Array(3).fill("Summer camp in Ontario. Page 2."),
    );
    expect(metadata.alternates.canonical).toBe("https://example.test/stories/2");
  });

  it("uses category description fallbacks with pagination", () => {
    const metadata = generateCategoryMetadata({
      category: { ...category, meta: { ...category.meta, description: null } },
      page: 2,
      settings: siteSettings,
    });

    expect(descriptions(metadata)).toEqual(
      Array(3).fill("Compare service options. Page 2."),
    );
  });
});

describe("listing sharing images", () => {
  it("puts the Sharing photo inside the listing cards", () => {
    const cards = [
      [
        generateBlogIndexMetadata({ blogIndex, page: 1 }),
        generateBlogIndexMetadata({
          blogIndex: { ...blogIndex, sharingPhoto } as unknown as NonNullable<BLOG_INDEX_QUERY_RESULT>,
          page: 1,
        }),
      ],
      [
        generateCategoryMetadata({ category, page: 1 }),
        generateCategoryMetadata({ category: { ...category, sharingPhoto }, page: 1 }),
      ],
    ];

    for (const [plain, withPhoto] of cards) {
      const plainUrl = new URL(plain.openGraph.images[0].url);
      const photoUrl = new URL(withPhoto.openGraph.images[0].url);
      expect(photoUrl.pathname).toBe(plainUrl.pathname);
      expect(photoUrl.searchParams.get("rev")).not.toBe(
        plainUrl.searchParams.get("rev"),
      );
      expect(withPhoto.twitter.images).toEqual(withPhoto.openGraph.images);
    }
  });

  it("keeps generated cards for listings without a Sharing photo", () => {
    const metadata = generateCategoryMetadata({ category, page: 2, settings: siteSettings });

    expect(new URL(metadata.openGraph.images[0].url).pathname).toBe(
      "/api/og/page/category/categories/2",
    );
    expect(metadata.alternates.canonical).toBe(
      "https://example.test/stories/category/categories/2",
    );
  });

  it("uses the Site sharing image for a category slug the card route cannot serve", () => {
    const metadata = generateCategoryMetadata({
      category: { ...category, slug: { current: "a/b" } },
      page: 1,
      settings: siteSettings,
    });

    expect(metadata.openGraph.images[0].url).toContain("site1234-2400x1600.jpg");
  });
});
