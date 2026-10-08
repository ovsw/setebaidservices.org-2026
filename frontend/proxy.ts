import {
  calculateBlogPagination,
  isBlogPageOutOfRange,
  parseBlogPageSegment,
} from "@/lib/blog-index";
import { QR_MEDIUM } from "@/lib/redirects.mjs";
import { isPageSlug } from "@/lib/routes";
import { client } from "@/sanity/lib/client";
import {
  BLOG_CATEGORY_POST_COUNTS_QUERY,
  ELIGIBLE_BLOG_POSTS_COUNT_QUERY,
} from "@/sanity/queries/blog-index";
import { PAGE_EXISTS_QUERY } from "@/sanity/queries/page";
import type {
  ELIGIBLE_BLOG_POSTS_COUNT_QUERY_RESULT,
  PAGE_EXISTS_QUERY_RESULT,
} from "@/sanity.types";
import { NextRequest, NextResponse } from "next/server";

const BLOG_POST_COUNT_TTL_MS = 60_000;
const GO_FALLBACK_PATH = "/ask-about-camp";
const GO_CODE_PATTERN = /^[a-z0-9-]+$/;

let blogPostCountCache:
  | { expiresAt: number; value: number }
  | undefined;
let blogPostCountPromise: Promise<number> | undefined;

type CategoryPostCount = { postCount: number; slug: string };

let categoryPostCountsCache:
  | { expiresAt: number; value: ReadonlyMap<string, number> }
  | undefined;
let categoryPostCountsPromise:
  | Promise<ReadonlyMap<string, number>>
  | undefined;

function getBlogPostCount() {
  if (blogPostCountCache && blogPostCountCache.expiresAt > Date.now()) {
    return Promise.resolve(blogPostCountCache.value);
  }

  if (!blogPostCountPromise) {
    blogPostCountPromise = client
      .fetch<ELIGIBLE_BLOG_POSTS_COUNT_QUERY_RESULT>(ELIGIBLE_BLOG_POSTS_COUNT_QUERY)
      .then((value) => {
        blogPostCountCache = {
          expiresAt: Date.now() + BLOG_POST_COUNT_TTL_MS,
          value,
        };
        return value;
      })
      .finally(() => {
        blogPostCountPromise = undefined;
      });
  }

  return blogPostCountPromise;
}

function getCategoryPostCounts() {
  if (
    categoryPostCountsCache &&
    categoryPostCountsCache.expiresAt > Date.now()
  ) {
    return Promise.resolve(categoryPostCountsCache.value);
  }

  if (!categoryPostCountsPromise) {
    categoryPostCountsPromise = client
      .fetch<CategoryPostCount[]>(BLOG_CATEGORY_POST_COUNTS_QUERY)
      .then((categories) => {
        const value = new Map(
          categories.map(({ postCount, slug }) => [slug, postCount]),
        );
        categoryPostCountsCache = {
          expiresAt: Date.now() + BLOG_POST_COUNT_TTL_MS,
          value,
        };
        return value;
      })
      .finally(() => {
        categoryPostCountsPromise = undefined;
      });
  }

  return categoryPostCountsPromise;
}

async function getCategoryPostCount(slug: string) {
  try {
    return (await getCategoryPostCounts()).get(slug);
  } catch {
    return undefined;
  }
}

function notFoundResponse() {
  return new NextResponse("Not Found", {
    headers: { "content-type": "text/plain; charset=utf-8" },
    status: 404,
  });
}

function hasValidatedDraftMode(request: NextRequest) {
  const cookieValue = request.cookies.get("__prerender_bypass")?.value;
  const previewModeId = process.env.__NEXT_PREVIEW_MODE_ID;
  return Boolean(
    cookieValue &&
      previewModeId &&
      (cookieValue === previewModeId ||
        (process.env.NODE_ENV !== "production" &&
          previewModeId === "development-id")),
  );
}

/**
 * A /go/ address with no published page and no QR redirect still reaches the
 * family: it lands on Ask about camp, tagged with its code. QR redirects run
 * before the proxy, so they never get here.
 */
async function routeGoAddress(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 2 || hasValidatedDraftMode(request)) {
    return NextResponse.next();
  }

  const slug = segments.join("/");
  if (isPageSlug(slug)) {
    try {
      const pageExists = await client.fetch<PAGE_EXISTS_QUERY_RESULT>(
        PAGE_EXISTS_QUERY,
        { slug },
      );
      if (pageExists) return NextResponse.next();
    } catch {
      return NextResponse.next();
    }
  }

  const code = segments.slice(1).join("/");
  const destination = new URL(GO_FALLBACK_PATH, request.url);
  destination.search = new URLSearchParams({
    utm_source: GO_CODE_PATTERN.test(code) ? code : "unknown",
    utm_medium: QR_MEDIUM,
  }).toString();
  return NextResponse.redirect(destination, 302);
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/go/")) {
    return routeGoAddress(request);
  }

  if (!request.nextUrl.pathname.startsWith("/stories/")) {
    return NextResponse.next();
  }

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length === 1) return NextResponse.next();

  if (segments[1] === "category") {
    if (segments.length === 3) return NextResponse.next();
    if (segments.length !== 4) return notFoundResponse();

    const page = parseBlogPageSegment(segments[3]);
    if (!page) return notFoundResponse();
    if (hasValidatedDraftMode(request)) return NextResponse.next();

    const postCount = await getCategoryPostCount(segments[2]);
    if (postCount === undefined) return NextResponse.next();

    const { totalPages } = calculateBlogPagination(postCount, page);
    return isBlogPageOutOfRange(page, totalPages)
      ? notFoundResponse()
      : NextResponse.next();
  }

  if (segments.length !== 2) return notFoundResponse();

  const page = parseBlogPageSegment(segments[1]);
  if (!page) {
    return /^\d+$/.test(segments[1])
      ? notFoundResponse()
      : NextResponse.next();
  }

  if (hasValidatedDraftMode(request)) return NextResponse.next();

  let postCount: number;
  try {
    postCount = await getBlogPostCount();
  } catch {
    return NextResponse.next();
  }
  const regularPostCount = Math.max(postCount - 1, 0);
  const { totalPages } = calculateBlogPagination(regularPostCount, page);
  return isBlogPageOutOfRange(page, totalPages)
    ? notFoundResponse()
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)", "/go/:path*"],
};
