import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import FlipCardGrid from "./flip-cards-grid";
import { BodyText, type DataAttribute } from "./section-parts";
import { lightGlowClass, sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type FlipCardsProps = Extract<PageBlock, { _type: "flipCards" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Flip Cards (prototype "Turn it around"): one sentence, then a row of cards
 * that turn over on tap. The front states a hard part of living with
 * diabetes; the back says how camp turns it around.
 */
export default function FlipCards({
  _key,
  background,
  backLabel,
  cards,
  dataAttribute,
  frontLabel,
  intro,
  turnLabel,
}: FlipCardsProps) {
  if (!cards?.length) return null;

  const introId = `flip-cards-${stegaClean(_key)}-intro`;

  return (
    <section
      aria-labelledby={introId}
      className={cn("py-section", sectionThemeClass(background),
        lightGlowClass(background, "left"),
      )}
    >
      <div className="container-content flex flex-col gap-7">
        <div
          className="max-w-[64ch] text-lead text-balance text-muted-foreground"
          data-sanity={dataAttribute?.("intro")}
          id={introId}
        >
          <BodyText value={intro} />
        </div>
        <FlipCardGrid
          backLabel={stegaClean(backLabel) || "Setebaid"}
          cards={cards.map((card) => ({
            back: card.back ?? "",
            dataSanity: dataAttribute?.(`cards[_key=="${card._key}"]`),
            emoji: card.emoji ?? "",
            front: card.front ?? "",
            key: card._key,
          }))}
          frontLabel={stegaClean(frontLabel) || "Diabetes"}
          turnLabel={turnLabel || "turn it around"}
        />
      </div>
    </section>
  );
}
