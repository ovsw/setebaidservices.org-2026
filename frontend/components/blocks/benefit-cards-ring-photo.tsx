import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import {
  ArrowLink,
  BodyText,
  HeadingText,
  hasImage,
  hasText,
  SectionImage,
  type DataAttribute,
} from "./section-parts";
import { lightGlowClass, sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type BenefitCardsProps = Extract<PageBlock, { _type: "benefitCards" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Feature Grid, round photo layout (prototype "Why Setebaid"): a round photo
 * inside the open brand ring with a marigold dot and a handwritten caption,
 * beside the heading and short points, each under a coloured rule.
 */
const RULES = ["border-mark", "border-highlight", "border-fill-cool"] as const;

export default function BenefitCardsRingPhoto({
  _key,
  background,
  caption,
  cards,
  dataAttribute,
  image,
  link,
  title,
}: BenefitCardsProps) {
  if (!title?.length) return null;

  const headingId = `benefit-cards-${stegaClean(_key)}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("overflow-x-clip py-section", sectionThemeClass(background),
        lightGlowClass(background, "corners"),
      )}
    >
      <div className="container-content grid items-center gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <figure className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-4 md:mx-0 md:max-w-[440px] md:justify-self-end">
          <div className="relative aspect-square w-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 rotate-[140deg] rounded-full border-[14px] border-mark border-l-transparent"
            />
            {hasImage(image) ? (
              <div
                className="absolute inset-[30px] overflow-hidden rounded-full"
                data-sanity={dataAttribute?.("image")}
              >
                <SectionImage image={image} sizes="(min-width: 768px) 440px, 320px" width={900} />
              </div>
            ) : null}
            <div
              aria-hidden="true"
              className="absolute top-[22px] right-1.5 size-[52px] rounded-full bg-highlight shadow-[0_0_0_8px_var(--color-background)]"
            />
          </div>
          {hasText(caption) ? (
            <figcaption
              className="-rotate-3 text-note text-muted-foreground"
              data-sanity={dataAttribute?.("caption")}
            >
              {caption}
            </figcaption>
          ) : null}
        </figure>
        <div className="flex max-w-[620px] flex-col gap-10">
          <h2 className="text-headline" data-sanity={dataAttribute?.("title")} id={headingId}>
            <HeadingText value={title} />
          </h2>
          {cards?.length ? (
            <ul
              className="grid list-none grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-7 p-0"
              data-sanity={dataAttribute?.("cards")}
            >
              {cards.map((card, index) => (
                <li
                  className={cn(
                    "flex flex-col gap-3 border-t-[3px] pt-4",
                    RULES[index % RULES.length],
                  )}
                  key={card._key}
                >
                  <h3 className="text-title leading-[1.15]">{card.title}</h3>
                  <div className="grid gap-3 text-body leading-[1.6] text-muted-foreground">
                    <BodyText value={card.body} />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <ArrowLink button={link} className="self-start" dataSanity={dataAttribute?.("link")} />
        </div>
      </div>
    </section>
  );
}
