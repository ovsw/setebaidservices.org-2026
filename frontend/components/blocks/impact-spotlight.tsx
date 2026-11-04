import { ArrowLink, hasText, type DataAttribute } from "@/components/blocks/section-parts";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import { ImpactFigure, ImpactHeader, revealClass, usableStats } from "./impact-parts";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ImpactSpotlightProps = Extract<PageBlock, { _type: "impactSpotlight" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Impact Spotlight — who paid for camp, for donors. The first figure is set
 * at display size beside a 2x2 grid of up to four more. Below them, on its
 * own full-width row, the bar shows the family share in camp green and the
 * donor share in the same marigold stripes as the price page, with the
 * promise ("every child gets the same camp…") set as a statement before it.
 * No card and no rule between the rows: the spacing alone separates them.
 */

/** The family and donor shares of the cost, clamped to whole percents. */
export function costShares(familiesShare: number | null | undefined) {
  const families = Math.min(100, Math.max(0, Math.round(familiesShare ?? 0)));
  return { donors: 100 - families, families };
}

const DONOR_STRIPES =
  "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-highlight) 50%, var(--color-card)) 0 7px, color-mix(in oklab, var(--color-highlight) 28%, var(--color-card)) 7px 14px)";

export default function ImpactSpotlight({
  _key,
  background,
  dataAttribute,
  donorsLabel,
  eyebrow,
  familiesLabel,
  familiesShare,
  intro,
  link,
  shareCaption,
  shareTitle,
  statement,
  stats,
  title,
}: ImpactSpotlightProps) {
  const figures = usableStats(stats);
  if (!title?.length || !figures.length) return null;

  const cleanKey = stegaClean(_key);
  const headingId = `impact-spotlight-${cleanKey}-title`;
  const [hero, ...rest] = figures;
  const hasShare = typeof familiesShare === "number";
  const hasStatement = hasText(statement);
  const { donors, families } = costShares(familiesShare);
  const familiesName = stegaClean(familiesLabel)?.trim() || "Families";
  const donorsName = stegaClean(donorsLabel)?.trim() || "Donors";

  return (
    <section
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 py-section", sectionThemeClass(background))}
      id={`impact-spotlight-${cleanKey}`}
    >
      <div className="container-content">
        <ImpactHeader
          dataAttribute={dataAttribute}
          eyebrow={eyebrow}
          headingId={headingId}
          intro={intro}
          title={title}
        />

        {/* The hero figure and the 2x2 grid are separate lists, so every
            dt/dd group sits right under its dl. */}
        <div
          className={cn(
            "mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16",
            revealClass,
          )}
          data-sanity={dataAttribute?.("stats")}
        >
          <dl className="m-0">
            <ImpactFigure dataAttribute={dataAttribute} emphasis size="hero" stat={hero} />
          </dl>
          {rest.length ? (
            <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-7 self-end">
              {rest.slice(0, 4).map((stat) => (
                <ImpactFigure dataAttribute={dataAttribute} key={stat._key} size="small" stat={stat} />
              ))}
            </dl>
          ) : null}
        </div>

        {hasShare || hasStatement ? (
          <div
            className={cn(
              "mt-14 grid gap-10 lg:mt-20 lg:gap-16",
              hasShare && hasStatement && "lg:grid-cols-2 lg:items-center",
              revealClass,
            )}
          >
            {hasStatement ? (
              <p
                className="max-w-[24ch] text-balance text-statement text-foreground"
                data-sanity={dataAttribute?.("statement")}
              >
                {statement}
              </p>
            ) : null}

            {hasShare ? (
              <div>
                {hasText(shareTitle) ? (
                  <h3 className="font-display text-title text-foreground" data-sanity={dataAttribute?.("shareTitle")}>
                    {shareTitle}
                  </h3>
                ) : null}
                {hasText(shareCaption) ? (
                  <p className="mt-1 text-small text-muted-foreground" data-sanity={dataAttribute?.("shareCaption")}>
                    {shareCaption}
                  </p>
                ) : null}
                {/* The same bar as the price page. The sentence is for readers
                    who do not see the bar. */}
                <p className="sr-only">
                  {familiesName} paid {families}% of the cost. {donorsName} covered {donors}%.
                </p>
                <div
                  aria-hidden="true"
                  className="mt-5 flex h-11 overflow-hidden rounded-sm font-ui text-sm font-bold whitespace-nowrap tabular-nums"
                  data-sanity={dataAttribute?.("familiesShare")}
                >
                  <div
                    className="flex min-w-1.5 items-center justify-center bg-primary px-2 text-primary-foreground"
                    style={{ flex: `0 0 ${families}%` }}
                  >
                    {families >= 10 ? `${families}%` : null}
                  </div>
                  <div
                    className="flex min-w-0 flex-1 items-center justify-end px-4 text-card-foreground"
                    style={{ background: DONOR_STRIPES }}
                  >
                    {donors >= 30 ? `${donorsName} covered ${donors}%` : `${donors}%`}
                  </div>
                </div>
                <ul aria-hidden="true" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-ui text-[13px] font-medium text-muted-foreground">
                  <li className="flex items-center gap-2" data-sanity={dataAttribute?.("familiesLabel")}>
                    <span className="size-3 rounded-[3px] bg-primary" />
                    {familiesName}
                  </li>
                  <li className="flex items-center gap-2" data-sanity={dataAttribute?.("donorsLabel")}>
                    <span className="size-3 rounded-[3px]" style={{ background: DONOR_STRIPES }} />
                    {donorsName}
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {link ? (
          <ArrowLink button={link} className="mt-10 inline-block" dataSanity={dataAttribute?.("link")} />
        ) : null}
      </div>
    </section>
  );
}
