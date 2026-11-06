import {
  documentDataAttribute,
  PublicationDate,
} from "@/components/blog-card";
import { categoryPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { POST_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

type PostHeroProps = {
  post: NonNullable<POST_QUERY_RESULT>;
  readTime: string;
  stega: boolean;
};

/** Initials from the words of a name that start with a letter. */
function getInitials(value: string | null | undefined) {
  const name = stegaClean(value)?.trim();
  const words = name?.split(/\s+/).filter((word) => /^\p{L}/u.test(word)) ?? [];
  if (!words.length) return "S";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/**
 * The top of a story page (shadcnblocks blogpost21): a wide camp photo, and a
 * title card that overlaps its lower edge with the story type, date, title,
 * summary and storyteller. Without a photo the card sits on the field alone.
 */
export default function PostHero({ post, readTime, stega }: PostHeroProps) {
  const { author, category, excerpt, image, publishedAt, title } = post;
  const categorySlug = stegaClean(category?.slug?.current)?.replace(/^\/+|\/+$/g, "");
  const categoryHref = categoryPath(categorySlug);
  const authorName = stegaClean(author?.name)?.trim();
  const hasImage = Boolean(image?.asset?._id);
  const postDataAttribute = documentDataAttribute({ id: post._id, stega, type: "post" });
  const authorDataAttribute = author
    ? documentDataAttribute({ id: author._id, stega, type: "author" })
    : undefined;
  const categoryDataAttribute = category
    ? documentDataAttribute({ id: category._id, stega, type: "category" })
    : undefined;

  return (
    <div className="mx-auto max-w-5xl">
      {image?.asset?._id ? (
        <figure
          className="relative m-0 aspect-[4/3] overflow-hidden rounded-md bg-muted sm:aspect-video"
          data-sanity={postDataAttribute?.("image")}
        >
          <Image
            alt={stegaClean(image.alt) || ""}
            blurDataURL={image.asset.metadata?.lqip || undefined}
            className="object-cover"
            fill
            placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
            fetchPriority="high"
            loading="eager"
            sizes="(min-width: 1088px) 1024px, calc(100vw - 2 * clamp(20px, 5vw, 32px))"
            src={urlFor(image).width(2048).fit("max").quality(90).url()}
            style={
              image.hotspot?.x != null && image.hotspot.y != null
                ? {
                    objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`,
                  }
                : undefined
            }
          />
        </figure>
      ) : null}
      <header
        className={cn(
          "relative mx-auto max-w-3xl rounded-md bg-card p-6 text-card-foreground md:p-10",
          hasImage && "mx-3 -mt-16 shadow-raised sm:mx-6 md:mx-auto md:-mt-24",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {category?.title && categoryHref ? (
            <Link
              className="text-eyebrow text-link underline-offset-4 hover:underline focus-ring rounded-xs"
              data-sanity={categoryDataAttribute?.("title")}
              href={categoryHref}
            >
              {category.title}
            </Link>
          ) : null}
          <p className="font-ui text-label text-muted-foreground flex flex-wrap items-center gap-x-3">
            <PublicationDate dataAttribute={postDataAttribute} value={publishedAt} />
            {publishedAt ? <span aria-hidden="true">·</span> : null}
            <span>{readTime}</span>
          </p>
        </div>
        {title ? (
          <h1
            className="text-headline mt-4 text-balance text-foreground"
            data-sanity={postDataAttribute?.("title")}
          >
            {title}
          </h1>
        ) : null}
        {excerpt ? (
          <p
            className="text-lead mt-6 text-muted-foreground"
            data-sanity={postDataAttribute?.("excerpt")}
          >
            {excerpt}
          </p>
        ) : null}
        {author ? (
          <p className="font-ui mt-8 flex items-center gap-3">
            {author.image?.asset?._id ? (
              <span
                className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted"
                data-sanity={authorDataAttribute?.("image")}
              >
                <Image
                  alt={stegaClean(author.image.alt) || authorName || "Storyteller"}
                  blurDataURL={author.image.asset.metadata?.lqip || undefined}
                  className="object-cover"
                  fill
                  placeholder={author.image.asset.metadata?.lqip ? "blur" : undefined}
                  sizes="40px"
                  src={urlFor(author.image).width(80).height(80).fit("crop").url()}
                />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="text-label flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"
                data-sanity={authorDataAttribute?.("image")}
              >
                {getInitials(author.name)}
              </span>
            )}
            {author.name ? (
              <span
                className="text-label text-foreground"
                data-sanity={authorDataAttribute?.("name")}
              >
                {author.name}
              </span>
            ) : null}
          </p>
        ) : null}
      </header>
    </div>
  );
}
