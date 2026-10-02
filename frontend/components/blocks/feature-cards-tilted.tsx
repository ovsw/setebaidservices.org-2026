import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import {
  ArrowLink,
  HeadingText,
  hasImage,
  hasText,
  SectionButtonLink,
  SectionImage,
  type DataAttribute,
} from "./section-parts";
import { lightGlowClass, sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type FeatureCardsProps = Extract<PageBlock, { _type: "featureCards" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Feature Cards, tilted layout (prototype "Camps"): large cards with a photo
 * tilted a degree and a half, alternating left and right, and a date badge
 * pinned over its lower edge. Badges alternate marigold and camp green. Row
 * headings are not shown; the cards of every row run as one grid.
 */
const BADGES = ["card-warm", "card-bold"] as const;
const TILTS = ["-rotate-[1.5deg]", "rotate-[1.5deg]"] as const;

export default function FeatureCardsTilted({
  _key,
  background,
  dataAttribute,
  groups,
  link,
  title,
}: FeatureCardsProps) {
  const cards = (groups ?? []).flatMap((group) =>
    (group.cards ?? []).map((card) => ({
      ...card,
      path: `groups[_key=="${group._key}"].cards[_key=="${card._key}"]`,
    })),
  );
  if (!title?.length || !cards.length) return null;

  const headingId = `feature-cards-${stegaClean(_key)}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("relative overflow-x-clip py-section", sectionThemeClass(background),
        lightGlowClass(background, "right"),
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-[140px] size-[260px] rounded-full bg-highlight opacity-10"
      />
      <div className="container-content relative flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            className="max-w-[22ch] text-headline"
            data-sanity={dataAttribute?.("title")}
            id={headingId}
          >
            <HeadingText value={title} />
          </h2>
          <ArrowLink button={link} dataSanity={dataAttribute?.("link")} />
        </div>
        <div
          className={cn(
            "grid gap-x-8 gap-y-14",
            cards.length >= 2 && "md:grid-cols-2",
            cards.length >= 3 && "lg:grid-cols-3",
          )}
          data-sanity={dataAttribute?.("groups")}
        >
          {cards.map((card, index) => {
            const cardData: DataAttribute | undefined = dataAttribute
              ? (path) => dataAttribute(`${card.path}.${path}`)
              : undefined;
            const hasBadge = hasText(card.badgeLabel) || hasText(card.badgeValue);
            return (
              <article className="flex flex-col" key={card._key}>
                <div className="relative mb-6">
                  {hasImage(card.image) ? (
                    <div
                      className={cn(
                        "relative aspect-[4/3] overflow-hidden rounded-card",
                        TILTS[index % TILTS.length],
                      )}
                      data-sanity={cardData?.("image")}
                    >
                      <SectionImage
                        image={card.image}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        width={1200}
                      />
                    </div>
                  ) : null}
                  {hasBadge ? (
                    <div
                      className={cn(
                        "absolute -bottom-6 left-5 flex items-baseline gap-2 rounded-card px-4 py-3 leading-none shadow-badge",
                        BADGES[index % BADGES.length],
                      )}
                    >
                      {hasText(card.badgeLabel) ? (
                        <span className="text-eyebrow leading-none">{card.badgeLabel}</span>
                      ) : null}
                      {hasText(card.badgeValue) ? (
                        <span className="text-title-lg leading-none">{card.badgeValue}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3 px-1">
                  {hasText(card.eyebrow) ? (
                    <p
                      className="mt-3 font-ui text-eyebrow text-link"
                      data-sanity={cardData?.("eyebrow")}
                    >
                      {card.eyebrow}
                    </p>
                  ) : null}
                  <h3 className="text-title-lg text-balance" data-sanity={cardData?.("title")}>
                    {card.title}
                  </h3>
                  {hasText(card.text) ? (
                    <p className="text-body text-muted-foreground" data-sanity={cardData?.("text")}>
                      {card.text}
                    </p>
                  ) : null}
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <SectionButtonLink
                      arrow
                      button={card.link}
                      dataSanity={cardData?.("link")}
                    />
                    <SectionButtonLink
                      button={card.secondaryLink}
                      dataSanity={cardData?.("secondaryLink")}
                      fallbackVariant="outline"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
