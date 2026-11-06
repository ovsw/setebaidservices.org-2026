import { RootContentView } from "@/components/root-content";
import { getBlogPostSidebar } from "@/components/post-sidebar/model";
import {
  fetchBlogPostSettings,
  fetchSanityPostBySlug,
} from "@/sanity/lib/fetch";
import { notFoundIfHidden } from "@/lib/public-visibility";
import type { DynamicFetchOptions } from "@/sanity/lib/live";
import { notFound } from "next/navigation";

export async function BlogPostRoute({
  slug,
  perspective,
  stega,
  isPublic = false,
}: { slug: string; isPublic?: boolean } & DynamicFetchOptions) {
  const [post, blogPostSettings] = await Promise.all([
    fetchSanityPostBySlug({ slug, perspective, stega }),
    fetchBlogPostSettings({ perspective, stega }).catch(() => null),
  ]);
  if (!post) notFound();
  // Draft mode can use the published perspective too (the client review
  // link), so the public branch says so explicitly.
  if (isPublic) notFoundIfHidden(post);

  return (
    <RootContentView
      blogPostSettings={getBlogPostSidebar(blogPostSettings)}
      content={post}
      perspective={perspective}
      stega={stega}
    />
  );
}
