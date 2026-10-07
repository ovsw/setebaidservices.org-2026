import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { toPlainText } from "@portabletext/react";
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
 * Quote wall, track layout: a horizontal masonry of quotes in two rows that
 * run past both edges of the page and drag sideways. Every card takes the
 * field's soft card tone (The Soft Card Rule); the variety comes from size,
 * not colour. A quote's length sets its card's width and type, so short
 * quotes are narrow cards in larger type and long ones run wider. The second
 * row starts further in, so the seams between cards never line up.
 */

/** Card widths and type by quote length, shortest first. */
const SIZES = [
  { maxChars: 70, width: 260, type: "text-quote-lg" },
  { maxChars: 100, width: 320, type: "text-quote" },
  { maxChars: 140, width: 380, type: "text-quote" },
  { maxChars: Infinity, width: 460, type: "text-quote" },
] as const;

type Size = (typeof SIZES)[number];
type Card = { document: TestimonialDocument; key: string; size: Size };

export function quoteSize(chars: number): Size {
  return SIZES.find((size) => chars <= size.maxChars) ?? SIZES[SIZES.length - 1];
}

/**
 * Deals the cards into two rows, each card to the shorter row, so both rows
 * end at about the same place and the reading order stays close to the
 * editor's order.
 */
export function dealRows<T extends { size: { width: number } }>(cards: T[]) {
  const rows: [T[], T[]] = [[], []];
  const lengths = [0, 0];
  for (const card of cards) {
    const row = lengths[0] <= lengths[1] ? 0 : 1;
    rows[row].push(card);
    lengths[row] += card.size.width;
  }
  return rows;
}

function QuoteCard({
  card,
  testimonialDataAttribute,
}: {
  card: Card;
  testimonialDataAttribute?: QuoteWallProps["testimonialDataAttribute"];
}) {
  const { document, size } = card;
  const id = document._id;
  return (
    <figure
      className="m-0 flex flex-col gap-4 rounded-card bg-card p-7 text-card-foreground"
      style={{ flex: `0 0 min(${size.width}px, 78vw)` }}
    >
      <span
        aria-hidden="true"
        className="h-[22px] overflow-hidden font-display text-[56px] leading-[0.6] font-extrabold text-emphasis select-none"
      >
        &ldquo;
      </span>
      <blockquote
        className={cn("m-0 grid gap-3 [&_p]:[font:inherit]", size.type)}
        data-sanity={testimonialDataAttribute?.(id, "body")}
      >
        <BodyText value={document.body} />
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-2">
        {hasImage(document.image) ? (
          <span
            className="relative size-11 flex-none overflow-hidden rounded-full bg-muted"
            data-sanity={testimonialDataAttribute?.(id, "image")}
          >
            <SectionImage image={document.image} sizes="44px" width={96} />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-col gap-1">
          <span
            className="origin-left -rotate-2 text-note-sm leading-none"
            data-sanity={testimonialDataAttribute?.(id, "name")}
          >
            {document.name}
          </span>
          {hasText(document.title) ? (
            <span
              className="font-ui text-label text-muted-foreground"
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
    const chars = stegaClean(toPlainText(document.body)).trim().length;
    return [
      {
        document,
        key: reference._key ?? `${document._id}-${index}`,
        size: quoteSize(chars),
      },
    ];
  });
  if (!heading?.length || !cards.length) return null;

  const rows = dealRows(cards);
  const headingId = `quote-wall-${stegaClean(_key)}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "overflow-x-clip py-section",
        sectionThemeClass(background),
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
            className="flex w-max flex-col gap-4 px-[max(var(--gutter),calc(50vw-588px))]"
            data-sanity={dataAttribute?.("testimonials")}
          >
            {rows.map((row, rowIndex) =>
              row.length ? (
                <div
                  className={cn("flex items-stretch gap-4", rowIndex === 1 && "pl-16 md:pl-24")}
                  key={rowIndex}
                >
                  {row.map((card) => (
                    <QuoteCard
                      card={card}
                      key={card.key}
                      testimonialDataAttribute={testimonialDataAttribute}
                    />
                  ))}
                </div>
              ) : null,
            )}
          </div>
        </QuoteWallDrag>
      </div>
    </section>
  );
}
