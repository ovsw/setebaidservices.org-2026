import { createDataAttribute, stegaClean } from "next-sanity";
import Blocks from "@/components/blocks";
import BlogPostingJsonLd from "@/components/blog-posting-json-ld";
import BreadcrumbJsonLd from "@/components/breadcrumb-json-ld";
import FaqPageJsonLd from "@/components/faq-json-ld";
import { siteUrl } from "@/lib/site-url";
import VideoJsonLd from "@/components/video-json-ld";
import PostHero from "@/components/blocks/post-hero";
import {
  sectionThemeClass,
  type SectionTheme,
} from "@/components/blocks/section-theme";
import { postPath } from "@/lib/routes";
import {
  createPostBodyModel,
  getPostReadTime,
  type BlogPostSidebar,
} from "@/components/post-sidebar/model";
import {
  PostSidebar,
  PostTableOfContentsRail,
} from "@/components/post-sidebar/post-sidebar";
import { documentDataAttribute } from "@/components/blog-card";
import RichTextContent from "@/components/rich-text-content";
import { cn } from "@/lib/utils";
import { dataset, projectId } from "@/sanity/lib/env";
import type { DynamicFetchOptions } from "@/sanity/lib/live";
import type { PAGE_QUERY_RESULT, POST_QUERY_RESULT } from "@/sanity.types";

function PageContent({
  page,
  perspective,
  stega,
}: {
  page: NonNullable<PAGE_QUERY_RESULT>;
  perspective: DynamicFetchOptions["perspective"];
  stega: boolean;
}) {
  const blocks = page.blocks ?? [];
  // The Donate page and the pages under it ask for gifts: there the main
  // action of every button list is marigold.
  const isGivingPage = /^\/*donate(\/|$)/.test(stegaClean(page.slug) ?? "");
  const needsTitleHeader =
    blocks[0]?._type !== "innerHero" &&
    blocks[0]?._type !== "homeHero" &&
    stegaClean(page.title)?.trim();
  const firstBlock = blocks[0];
  const firstBackground =
    firstBlock && "background" in firstBlock
      ? (stegaClean(firstBlock.background) as SectionTheme | null | undefined)
      : undefined;
  const rootDataAttribute = stega
    ? (path: "description" | "title") =>
        createDataAttribute({
          baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
          dataset,
          id: page._id,
          path,
          projectId,
          type: "page",
        }).toString()
    : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: page.title || "Page", path: `/${page.slug}` },
        ]}
        siteUrl={siteUrl}
      />
      <FaqPageJsonLd blocks={blocks} />
      <VideoJsonLd content={blocks} />
      {needsTitleHeader ? (
        // Text-only pages (legal, policies) open with the page title instead
        // of a photo hero. The header takes the first section's ground and
        // its reading column, so title and text read as one document.
        <header className={`${sectionThemeClass(firstBackground)} pt-(--section-pad)`}>
          <div className="container-content">
            <div className="mx-auto max-w-[70ch]">
              <h1
                className="text-display-page text-balance"
                data-sanity={rootDataAttribute?.("title")}
              >
                {page.title}
              </h1>
              {stegaClean(page.description)?.trim() ? (
                <p
                  className="text-lead mt-6 text-ink-soft"
                  data-sanity={rootDataAttribute?.("description")}
                >
                  {page.description}
                </p>
              ) : null}
            </div>
          </div>
        </header>
      ) : null}
      <Blocks
        blocks={blocks}
        documentId={page._id}
        giving={isGivingPage}
        perspective={perspective}
        stega={stega}
      />
    </>
  );
}

type PostBody = NonNullable<NonNullable<POST_QUERY_RESULT>["body"]>;
type PostLayoutName = "single-column" | "toc-column" | "two-column" | "three-column";

/* Rails sit beside the story from 1024px; below that they stack around it. */
const layoutColumns: Record<PostLayoutName, string> = {
  "single-column": "",
  "toc-column": "max-w-5xl lg:grid-cols-[14rem_minmax(0,1fr)]",
  "two-column": "max-w-5xl lg:grid-cols-[minmax(0,1fr)_16rem]",
  "three-column": "lg:grid-cols-[13rem_minmax(0,1fr)_15rem]",
};

/**
 * Splits off the story's opening paragraph as the standfirst, when the body
 * starts with a plain paragraph. A body that opens with a heading, a list,
 * an image or a quote has no standfirst and renders whole.
 */
function splitStandfirst(body: PostBody): [PostBody[number] | null, PostBody] {
  const [first, ...rest] = body;
  const isPlainParagraph =
    first?._type === "block" &&
    (!first.style || stegaClean(first.style) === "normal") &&
    !("listItem" in first && first.listItem);
  return isPlainParagraph ? [first, rest] : [null, body];
}

function PostContent({
  blogPostSettings,
  perspective,
  post,
  stega,
}: {
  blogPostSettings: BlogPostSidebar | null;
  perspective: DynamicFetchOptions["perspective"];
  post: NonNullable<POST_QUERY_RESULT>;
  stega: boolean;
}) {
  const body = post.body ?? [];
  const bodyModel = createPostBodyModel(body);
  const hasPostSidebar = Boolean(blogPostSettings?.actions?.length);
  const hasTableOfContents = bodyModel.showTableOfContents;
  const layoutName: PostLayoutName = hasTableOfContents
    ? hasPostSidebar
      ? "three-column"
      : "toc-column"
    : hasPostSidebar
      ? "two-column"
      : "single-column";
  const hasRails = hasTableOfContents || hasPostSidebar;
  // Every story closes with the same sections, kept on Blog Post Settings.
  const closingBlocks = blogPostSettings?.blocks ?? [];
  const readTime = getPostReadTime(body);
  const [standfirst, storyBody] = splitStandfirst(body);
  const postDataAttribute = documentDataAttribute({ id: post._id, stega, type: "post" });
  const postSlug = post.slug?.current?.replace(/^\/+|\/+$/g, "") || "";
  const postCanonicalPath = postPath(postSlug) || "/stories";
  const blogPostSettingsDataAttribute = blogPostSettings
    ? documentDataAttribute({
        id: blogPostSettings._id,
        stega,
        type: blogPostSettings._type,
      })
    : undefined;
  const bodyDataAttribute = stega
    ? createDataAttribute({
        baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
        dataset,
        id: post._id,
        path: "body",
        projectId,
        type: "post",
      }).toString()
    : undefined;

  return (
    <>
    <section className="field-cream pt-8 pb-(--section-pad) md:pt-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Stories", path: "/stories" },
          { name: post.title || "Post", path: postCanonicalPath },
        ]}
        siteUrl={siteUrl}
      />
      <BlogPostingJsonLd post={post} siteUrl={siteUrl} />
      <VideoJsonLd content={body} />
      <div className="container-content">
        <PostHero post={post} readTime={readTime} stega={stega} />
        <div
          className={cn(
            "mx-auto mt-12 md:mt-16",
            hasRails ? "lg:grid lg:items-start lg:gap-12" : "max-w-3xl",
            layoutColumns[layoutName],
          )}
          data-post-layout={layoutName}
        >
          {bodyModel.showTableOfContents ? (
            <PostTableOfContentsRail
              className="mb-10 lg:sticky lg:top-28 lg:mb-0"
              headings={bodyModel.headings}
            />
          ) : null}
          <article className="min-w-0">
            {standfirst ? (
              // The story's first paragraph, the editor's line that sets the
              // scene, opens the story at a larger size (the standfirst).
              <RichTextContent
                className="text-quote-lg text-foreground"
                dataSanity={postDataAttribute?.(`body[_key=="${stegaClean(standfirst._key)}"]`)}
                value={[standfirst]}
              />
            ) : null}
            {storyBody.length ? (
              <RichTextContent
                className={standfirst ? "mt-10" : undefined}
                dataSanity={bodyDataAttribute}
                getHeadingId={bodyModel.getHeadingId}
                value={storyBody}
              />
            ) : null}
          </article>
          <PostSidebar
            className="mt-12 lg:sticky lg:top-28 lg:mt-0"
            dataAttribute={blogPostSettingsDataAttribute}
            sidebar={blogPostSettings}
          />
        </div>
      </div>
    </section>
    {blogPostSettings && closingBlocks.length ? (
      <Blocks
        blocks={closingBlocks}
        documentId={blogPostSettings._id}
        documentType="blogPostSettings"
        perspective={perspective}
        stega={stega}
      />
    ) : null}
    </>
  );
}

export function RootContentView({
  blogPostSettings = null,
  content,
  perspective,
  stega,
}: {
  blogPostSettings?: BlogPostSidebar | null;
  content: NonNullable<PAGE_QUERY_RESULT | POST_QUERY_RESULT>;
  perspective: DynamicFetchOptions["perspective"];
  stega: boolean;
}) {
  return content._type === "post" ? (
    <PostContent
      blogPostSettings={blogPostSettings}
      perspective={perspective}
      post={content}
      stega={stega}
    />
  ) : (
    <PageContent page={content} perspective={perspective} stega={stega} />
  );
}
