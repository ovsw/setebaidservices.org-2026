import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import QuoteWallDrag from "./quote-wall-drag";
import {
  BodyText,
  HeadingText,
  hasImage,
  hasText,
  SectionImage,
} from "./section-parts";
import { lightGlowClass, sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type QuoteWallBlock = Extract<PageBlock, { _type: "quoteWall" }>;
type TestimonialDocument = NonNullable<
  NonNullable<QuoteWallBlock["testimonials"]>[number]["document"]
>;

type QuoteWallProps = QuoteWallBlock & {
  dataAttribute?: (path: string) => string | undefined;
  testimonialDataAttribute?: (documentId: string, path: string) => string | undefined;
};

/*
 * Quote wall, track layout (prototype "Voices"): one row of quote columns
 * that runs past both edges of the page and drags sideways. Columns hold two
 * cards; fills rotate through sand, marigold, lake, ink and white. The first
 * quote with a photo becomes the large card in the third column, and the row
 * opens scrolled to it.
 */
const FILLS = [
  { card: "card-quiet", mark: "text-link" },
  { card: "card-warm", mark: "text-current" },
  { card: "card-cool", mark: "text-current" },
  { card: "card-deep", mark: "text-highlight" },
  { card: "card-warm", mark: "text-current" },
  { card: "card-quiet", mark: "text-link" },
  { card: "card-cool", mark: "text-current" },
  {
    card: "bg-card text-card-foreground shadow-[inset_0_0_0_1.5px_var(--color-border)]",
    mark: "text-highlight",
  },
] as const;
const COLUMN_WIDTHS = ["min(300px,78vw)", "min(340px,78vw)"] as const;
const FEATURED_COLUMN = 2;

type Card = { document: TestimonialDocument; key: string };

function QuoteCard({
  card,
  featured = false,
  fill,
  testimonialDataAttribute,
}: {
  card: Card;
  featured?: boolean;
  fill: (typeof FILLS)[number];
  testimonialDataAttribute?: QuoteWallProps["testimonialDataAttribute"];
}) {
  const { document } = card;
  const id = document._id;
  return (
    <figure
      className={cn(
        "m-0 flex flex-col rounded-card",
        featured ? "gap-5 p-8" : "gap-4 p-7",
        fill.card,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "overflow-hidden font-display leading-[0.6] font-extrabold",
          featured ? "h-[30px] text-[72px]" : "h-[22px] text-[56px]",
          fill.mark,
        )}
      >
        &ldquo;
      </span>
      <blockquote
        className={cn(
          "m-0 grid gap-3 font-display font-bold text-pretty [&_p]:[font-family:inherit]",
          featured ? "text-[1.375rem] leading-[1.4] tracking-[-0.005em]" : "text-quote",
        )}
        data-sanity={testimonialDataAttribute?.(id, "body")}
      >
        <BodyText value={document.body} />
      </blockquote>
      <figcaption className="m-0 flex items-center gap-4">
        {featured && hasImage(document.image) ? (
          <span
            className="relative size-16 flex-none overflow-hidden rounded-full shadow-[0_0_0_5px_var(--color-fill-quiet)]"
            data-sanity={testimonialDataAttribute?.(id, "image")}
          >
            <SectionImage image={document.image} sizes="64px" width={160} />
          </span>
        ) : null}
        <span className="flex flex-col gap-1">
          <span
            className="origin-left -rotate-2 text-note-sm leading-none"
            data-sanity={testimonialDataAttribute?.(id, "name")}
          >
            {document.name}
          </span>
          {hasText(document.title) ? (
            <span
              className="font-ui text-label"
              data-sanity={testimonialDataAttribute?.(id, "title")}
            >
              {document.title}
            </span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}

export default function QuoteWallTrack({
  _key,
  background,
  dataAttribute,
  heading,
  hint,
  testimonialDataAttribute,
  testimonials,
}: QuoteWallProps) {
  const cards: Card[] = (testimonials ?? []).flatMap((reference, index) => {
    const document = reference.document;
    if (!document || !hasText(document.name) || !document.body?.length) return [];
    return [{ document, key: reference._key ?? `${document._id}-${index}` }];
  });
  if (!heading?.length || !cards.length) return null;

  const featuredIndex = cards.findIndex((card) => hasImage(card.document.image));
  const featured = featuredIndex >= 0 ? cards[featuredIndex] : null;
  const rest = cards.filter((_, index) => index !== featuredIndex);

  const columns: Card[][] = [];
  for (let index = 0; index < rest.length; index += 2) {
    columns.push(rest.slice(index, index + 2));
  }
  const featuredAt = Math.min(FEATURED_COLUMN, columns.length);

  const headingId = `quote-wall-${stegaClean(_key)}-title`;
  let fillIndex = 0;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("overflow-x-clip py-section", sectionThemeClass(background),
        lightGlowClass(background, "right"),
      )}
    >
      <div className="container-content flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-headline" data-sanity={dataAttribute?.("heading")} id={headingId}>
            <HeadingText value={heading} />
          </h2>
          {hasText(hint) ? (
            <span
              className="inline-block -rotate-3 text-note leading-none text-muted-foreground"
              data-sanity={dataAttribute?.("hint")}
            >
              {hint} ⟷
            </span>
          ) : null}
        </div>
        <QuoteWallDrag label={stegaClean(hint) || "Quotes. Scroll sideways for more."}>
          <div
            className="flex w-max items-start gap-4 px-[max(var(--gutter),calc(50vw-588px))]"
            data-sanity={dataAttribute?.("testimonials")}
          >
            {columns.flatMap((column, columnIndex) => {
              const nodes = [];
              if (featured && columnIndex === featuredAt) {
                nodes.push(
                  <div className="flex flex-[0_0_min(460px,84vw)] flex-col gap-4" data-featured="" key="featured">
                    <QuoteCard
                      card={featured}
                      featured
                      fill={FILLS[FILLS.length - 1]}
                      testimonialDataAttribute={testimonialDataAttribute}
                    />
                  </div>,
                );
              }
              nodes.push(
                <div
                  className="flex flex-col gap-4"
                  key={column[0].key}
                  style={{ flex: `0 0 ${COLUMN_WIDTHS[columnIndex % COLUMN_WIDTHS.length]}` }}
                >
                  {column.map((card) => (
                    <QuoteCard
                      card={card}
                      fill={FILLS[fillIndex++ % FILLS.length]}
                      key={card.key}
                      testimonialDataAttribute={testimonialDataAttribute}
                    />
                  ))}
                </div>,
              );
              return nodes;
            })}
            {featured && featuredAt === columns.length ? (
              <div className="flex flex-[0_0_min(460px,84vw)] flex-col gap-4" data-featured="">
                <QuoteCard
                  card={featured}
                  featured
                  fill={FILLS[FILLS.length - 1]}
                  testimonialDataAttribute={testimonialDataAttribute}
                />
              </div>
            ) : null}
          </div>
        </QuoteWallDrag>
      </div>
    </section>
  );
}
