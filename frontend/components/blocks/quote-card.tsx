import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import type { CSSProperties, ReactNode } from "react";
import { BodyText, hasImage, hasText, SectionImage } from "./section-parts";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type QuoteWallBlock = Extract<PageBlock, { _type: "quoteWall" }>;

export type TestimonialDocument = NonNullable<
  NonNullable<QuoteWallBlock["testimonials"]>[number]["document"]
>;

export type TestimonialDataAttribute = (
  documentId: string,
  path: string,
) => string | undefined;

/*
 * One quote card for every Quote wall layout. It reads only the field tokens
 * (card, card-foreground, muted-foreground, emphasis, border), so it is
 * readable on Cream, Sand and Forest alike. The layouts decide only where the
 * card sits, how wide it is and how large its quote type is.
 */
export default function QuoteCard({
  bodyClassName,
  className,
  readMore,
  referenceDataAttribute,
  style,
  testimonial,
  testimonialDataAttribute,
}: Readonly<{
  /** Extra classes for the quote text, e.g. its type size or a line clamp. */
  bodyClassName?: string;
  className?: string;
  /** Shown under the quote, e.g. the "Read the full quote" link. */
  readMore?: ReactNode;
  referenceDataAttribute?: string;
  style?: CSSProperties;
  testimonial: TestimonialDocument;
  testimonialDataAttribute?: TestimonialDataAttribute;
}>) {
  const id = testimonial._id;
  const role = hasText(testimonial.title);
  const origin = hasText(testimonial.origin);

  return (
    <figure
      className={cn(
        "m-0 flex flex-col gap-4 rounded-card bg-card p-7 text-card-foreground [overflow-wrap:anywhere]",
        className,
      )}
      data-sanity={referenceDataAttribute}
      style={style}
    >
      <span
        aria-hidden="true"
        className="h-[22px] overflow-hidden font-display text-[56px] leading-[0.6] font-extrabold text-emphasis select-none"
      >
        &ldquo;
      </span>
      <blockquote
        className={cn("m-0 grid gap-3 text-quote [&_p]:[font:inherit]", bodyClassName)}
        data-sanity={testimonialDataAttribute?.(id, "body")}
      >
        <BodyText value={testimonial.body} />
      </blockquote>
      {readMore}
      <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
        {hasImage(testimonial.image) ? (
          <span
            className="relative size-11 flex-none overflow-hidden rounded-full bg-muted"
            data-sanity={testimonialDataAttribute?.(id, "image")}
          >
            <SectionImage image={testimonial.image} sizes="44px" width={96} />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-col gap-1">
          <span
            className="origin-left -rotate-2 text-note-sm leading-none"
            data-sanity={testimonialDataAttribute?.(id, "name")}
          >
            {testimonial.name}
          </span>
          {role || origin ? (
            <span className="font-ui text-label text-muted-foreground">
              {role ? (
                <span data-sanity={testimonialDataAttribute?.(id, "title")}>
                  {testimonial.title}
                </span>
              ) : null}
              {role && origin ? <span aria-hidden="true"> · </span> : null}
              {origin ? (
                <span data-sanity={testimonialDataAttribute?.(id, "origin")}>
                  {testimonial.origin}
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
