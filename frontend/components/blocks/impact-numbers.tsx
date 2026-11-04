import { ArrowLink, type DataAttribute } from "@/components/blocks/section-parts";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import { ImpactFigure, ImpactHeader, revealClass, usableStats } from "./impact-parts";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ImpactNumbersProps = Extract<PageBlock, { _type: "impactNumbers" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Impact Numbers — last season in numbers, for donors: the headline with a
 * handwritten season note, then four to six large figures in a row, each
 * over a marigold rule, with an optional arrow link. The first figure takes
 * the emphasis colour. Six figures keep three columns, so the rows stay even.
 */

export default function ImpactNumbers({
  _key,
  background,
  dataAttribute,
  eyebrow,
  intro,
  link,
  season,
  stats,
  title,
}: ImpactNumbersProps) {
  const figures = usableStats(stats);
  if (!title?.length || !figures.length) return null;

  const cleanKey = stegaClean(_key);
  const headingId = `impact-numbers-${cleanKey}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 py-section", sectionThemeClass(background))}
      id={`impact-numbers-${cleanKey}`}
    >
      <div className="container-content">
        <ImpactHeader
          dataAttribute={dataAttribute}
          eyebrow={eyebrow}
          headingId={headingId}
          intro={intro}
          season={season}
          title={title}
        />

        <dl
          className={cn(
            "mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3",
            figures.length === 4 && "xl:grid-cols-4",
            figures.length === 5 && "xl:grid-cols-5",
            revealClass,
          )}
          data-sanity={dataAttribute?.("stats")}
        >
          {figures.map((stat, index) => (
            <ImpactFigure
              className="border-t-[3px] border-highlight pt-4"
              dataAttribute={dataAttribute}
              emphasis={index === 0}
              key={stat._key}
              size="band"
              stat={stat}
            />
          ))}
        </dl>

        {link ? (
          <ArrowLink button={link} className="mt-10 inline-block" dataSanity={dataAttribute?.("link")} />
        ) : null}
      </div>
    </section>
  );
}
