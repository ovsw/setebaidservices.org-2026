import { sectionThemeClass } from "./section-theme";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import {
  PortableText,
  toPlainText,
  type PortableTextComponents,
} from "@portabletext/react";
import { stegaClean } from "next-sanity";
import { cn } from "@/lib/utils";
import QuoteCard, {
  type TestimonialDataAttribute,
  type TestimonialDocument,
} from "./quote-card";
import QuoteWallDialog from "./quote-wall-dialog";
import QuoteWallList from "./quote-wall-list";
import QuoteWallTrack from "./quote-wall-track";
import styles from "./quote-wall.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type QuoteWallBlock = Extract<PageBlock, { _type: "quoteWall" }>;
type QuoteWallProps = QuoteWallBlock & {
  dataAttribute?: (path: string) => string | undefined;
  testimonialDataAttribute?: TestimonialDataAttribute;
};

/**
 * Progressive disclosure, two levels.
 *
 * A quote longer than this many characters is clamped to a few lines on its
 * card, with a link that opens the whole quote in a dialog. Expanding in place
 * would re-pack the column layout under the reader's eyes.
 */
export const LONG_QUOTE_CHARS = 320;

/** Cards shown before the first "Show more": three rows of three on desktop. */
export const INITIAL_CARDS = 9;

/** Cards each press of "Show more" reveals. */
export const MORE_CARDS = 9;

/** Heading rich text: italic gets the handwritten accent. */
const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="heading-emphasis text-emphasis">{children}</em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

/** A Wall card. A long quote is clamped, with the whole card in a dialog. */
function WallCard({
  clamped,
  referenceDataAttribute,
  testimonial,
  testimonialDataAttribute,
}: Readonly<{
  clamped: boolean;
  referenceDataAttribute?: string;
  testimonial: TestimonialDocument;
  testimonialDataAttribute?: TestimonialDataAttribute;
}>) {
  return (
    <QuoteCard
      bodyClassName={clamped ? styles.clamped : undefined}
      readMore={
        clamped ? (
          <QuoteWallDialog
            label="Read the full quote"
            name={stegaClean(testimonial.name) ?? ""}
          >
            <QuoteCard bodyClassName="text-quote-lg" testimonial={testimonial} />
          </QuoteWallDialog>
        ) : null
      }
      referenceDataAttribute={referenceDataAttribute}
      testimonial={testimonial}
      testimonialDataAttribute={testimonialDataAttribute}
    />
  );
}

/**
 * Every selected quote as a card in a wall of columns, for pages that are
 * about the quotes rather than pages that borrow a few. Long quotes are
 * clamped with a "Read the full quote" dialog, and the wall shows the first
 * nine cards with a "Show more" button for the rest.
 */
function QuoteWallColumns({
  _key,
  background,
  dataAttribute,
  eyebrow,
  heading,
  testimonialDataAttribute,
  testimonials,
}: QuoteWallProps) {
  const cards = (testimonials ?? []).flatMap((reference, index) => {
    const document = reference.document;
    if (!document || !hasText(document.name) || !document.body?.length) {
      return [];
    }
    const text = stegaClean(toPlainText(document.body)).trim();
    if (!text) return [];

    const path = reference._key
      ? `testimonials[_key=="${reference._key}"]`
      : `testimonials[${index}]`;

    return [
      {
        clamped: text.length > LONG_QUOTE_CHARS,
        document,
        key: reference._key ?? document._id,
        path,
      },
    ];
  });

  if (!heading?.length || !cards.length) return null;

  const theme = stegaClean(background);
  const headingId = `quote-wall-${stegaClean(_key)}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(theme))}
      data-theme={theme ?? "white"}
      id={`quote-wall-${stegaClean(_key)}`}
    >
      <div className="container-content grid gap-12 lg:gap-16">
        <header>
          <div className="grid max-w-3xl gap-5">
            {hasText(eyebrow) ? (
              <p
                className="text-eyebrow text-[var(--section-accent)]"
                data-sanity={dataAttribute?.("eyebrow")}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className="text-balance font-display text-headline"
              data-sanity={dataAttribute?.("heading")}
              id={headingId}
            >
              <PortableText components={headingComponents} value={heading} />
            </h2>
          </div>
        </header>

        <QuoteWallList
          dataSanity={dataAttribute?.("testimonials")}
          initialCount={INITIAL_CARDS}
          items={cards.map(({ clamped, document, key, path }) => ({
            key,
            node: (
              <WallCard
                clamped={clamped}
                referenceDataAttribute={dataAttribute?.(path)}
                testimonial={document}
                testimonialDataAttribute={testimonialDataAttribute}
              />
            ),
          }))}
          onDark={theme === "green"}
          step={MORE_CARDS}
        />
      </div>
    </section>
  );
}

export default function QuoteWall(props: QuoteWallProps) {
  return stegaClean(props.layout) === "track" ? (
    <QuoteWallTrack {...props} />
  ) : (
    <QuoteWallColumns {...props} />
  );
}
