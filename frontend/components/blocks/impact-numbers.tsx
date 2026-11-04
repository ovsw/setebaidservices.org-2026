import {
  ArrowLink,
  HeadingText,
  hasText,
  type DataAttribute,
} from "@/components/blocks/section-parts";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import styles from "./impact-numbers.module.css";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ImpactNumbersBlock = Extract<PageBlock, { _type: "impactNumbers" }>;

type ImpactNumbersProps = ImpactNumbersBlock & {
  dataAttribute?: DataAttribute;
};

type Stat = NonNullable<ImpactNumbersBlock["stats"]>[number];
type Share = NonNullable<ImpactNumbersBlock["share"]>;

/*
 * Impact Numbers — last season in numbers, for donors.
 *
 * Band: the headline, then four to six large figures in a row, each over a
 * marigold rule, with an optional arrow link. Spotlight: the first figure is
 * set at display size beside a 2x2 grid of the rest; below them, on its own
 * full-width row under a hairline, the bar shows who paid for camp (the family
 * share in camp green, the donor share in the same marigold stripes as the
 * price page) with the "every child gets the same camp" line set large beside
 * it. Both read the field tokens, so they sit on Cream, Sand and Forest.
 */

/** The family and donor shares of the cost, clamped to whole percents. */
export function costShares(familiesShare: number | null | undefined) {
  const families = Math.min(100, Math.max(0, Math.round(familiesShare ?? 0)));
  return { donors: 100 - families, families };
}

const DONOR_STRIPES =
  "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-highlight) 50%, var(--color-card)) 0 7px, color-mix(in oklab, var(--color-highlight) 28%, var(--color-card)) 7px 14px)";

function statPath(stat: Stat) {
  return `stats[_key=="${stat._key}"]`;
}

function usableStats(stats: ImpactNumbersBlock["stats"]) {
  return (stats ?? []).filter((stat) => hasText(stat.value) && hasText(stat.label));
}

function Header({
  dataAttribute,
  eyebrow,
  headingId,
  intro,
  season,
  title,
}: Pick<ImpactNumbersProps, "dataAttribute" | "eyebrow" | "intro" | "season" | "title"> & {
  headingId: string;
}) {
  return (
    <header className={cn("max-w-3xl", styles.reveal)}>
      {hasText(eyebrow) ? (
        <p className="mb-5 text-eyebrow text-link" data-sanity={dataAttribute?.("eyebrow")}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-headline text-foreground" data-sanity={dataAttribute?.("title")} id={headingId}>
        <HeadingText value={title} />
        {hasText(season) ? (
          <span
            className="ml-3 inline-block -rotate-3 align-baseline text-note text-muted-foreground"
            data-sanity={dataAttribute?.("season")}
          >
            {season}
          </span>
        ) : null}
      </h2>
      {hasText(intro) ? (
        <p
          className="mt-6 max-w-[38rem] text-pretty text-[17px] leading-[1.6] text-muted-foreground"
          data-sanity={dataAttribute?.("intro")}
        >
          {intro}
        </p>
      ) : null}
    </header>
  );
}

/** A figure with its small detail and its label. dt/dd keep source order for assistive tech. */
function Figure({
  className,
  dataAttribute,
  emphasis,
  size,
  stat,
}: {
  className?: string;
  dataAttribute?: DataAttribute;
  emphasis?: boolean;
  size: "hero" | "band" | "small";
  stat: Stat;
}) {
  const path = statPath(stat);
  // The div groups one dt/dd pair, so it must sit right under a dl.
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <dt
        className={cn(
          "order-2 font-ui font-semibold text-foreground",
          size === "hero" ? "mt-3 max-w-[28ch] text-lg leading-snug" : "mt-2 max-w-[22ch] text-[15px] leading-snug",
        )}
        data-sanity={dataAttribute?.(`${path}.label`)}
      >
        {stat.label}
      </dt>
      <dd
        className={cn(
          "order-1 m-0 font-display font-extrabold tabular-nums",
          size === "hero" && "text-display-hero",
          size === "band" && "text-display-page",
          size === "small" && "text-figure",
          emphasis ? "text-emphasis" : "text-foreground",
        )}
      >
        <span data-sanity={dataAttribute?.(`${path}.value`)}>{stat.value}</span>
        {hasText(stat.detail) ? (
          <span
            className={cn(
              "ml-1.5 font-bold tracking-normal text-muted-foreground",
              size === "hero" ? "text-[0.38em]" : "text-[0.45em]",
            )}
            data-sanity={dataAttribute?.(`${path}.detail`)}
          >
            {stat.detail}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

function ShareRow({
  dataAttribute,
  share,
}: {
  dataAttribute?: DataAttribute;
  share: Share;
}) {
  const hasShare = typeof share.familiesShare === "number";
  const hasNote = hasText(share.note);
  if (!hasShare && !hasNote) return null;

  const { donors, families } = costShares(share.familiesShare);
  const familiesLabel = stegaClean(share.familiesLabel)?.trim() || "Families";
  const donorsLabel = stegaClean(share.donorsLabel)?.trim() || "Donors";

  return (
    <div
      className={cn(
        // No card: the bar and the line sit on the field under a hairline.
        "grid gap-10 border-t border-border pt-10 lg:gap-16 lg:pt-12",
        hasShare && hasNote && "lg:grid-cols-2 lg:items-center",
        styles.reveal,
      )}
      data-sanity={dataAttribute?.("share")}
    >
      {hasShare ? (
        <div>
          {hasText(share.title) ? (
            <h3 className="font-display text-title text-foreground" data-sanity={dataAttribute?.("share.title")}>
              {share.title}
            </h3>
          ) : null}
          {hasText(share.subtitle) ? (
            <p className="mt-1 text-small text-muted-foreground" data-sanity={dataAttribute?.("share.subtitle")}>
              {share.subtitle}
            </p>
          ) : null}
          {/* The same bar as the price page: the family share in camp green, the
              donor share in marigold stripes. The sentence below is for readers
              who do not see the bar. */}
          <p className="sr-only">
            {familiesLabel} paid {families}% of the cost. {donorsLabel} covered {donors}%.
          </p>
          <div
            aria-hidden="true"
            className="mt-5 flex h-11 overflow-hidden rounded-sm font-ui text-sm font-bold whitespace-nowrap tabular-nums"
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
              {donors >= 30 ? `${donorsLabel} covered ${donors}%` : `${donors}%`}
            </div>
          </div>
          <ul aria-hidden="true" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-ui text-[13px] font-medium text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-[3px] bg-primary" />
              {familiesLabel}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-[3px]" style={{ background: DONOR_STRIPES }} />
              {donorsLabel}
            </li>
          </ul>
        </div>
      ) : null}

      {hasNote ? (
        // The promise behind the bar, set as a statement, not a footnote.
        <p
          className="max-w-[24ch] text-balance text-statement text-foreground"
          data-sanity={dataAttribute?.("share.note")}
        >
          {share.note}
        </p>
      ) : null}
    </div>
  );
}

export default function ImpactNumbers({
  _key,
  background,
  dataAttribute,
  eyebrow,
  intro,
  layout,
  link,
  season,
  share,
  stats,
  title,
}: ImpactNumbersProps) {
  const figures = usableStats(stats);
  if (!title?.length || !figures.length) return null;

  const cleanKey = stegaClean(_key);
  const headingId = `impact-numbers-${cleanKey}-title`;
  const spotlight = stegaClean(layout) === "spotlight";
  const [hero, ...rest] = figures;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 py-section", sectionThemeClass(background))}
      id={`impact-numbers-${cleanKey}`}
    >
      <div className="container-content">
        <Header
          dataAttribute={dataAttribute}
          eyebrow={eyebrow}
          headingId={headingId}
          intro={intro}
          season={season}
          title={title}
        />

        {spotlight ? (
          <>
            {/* The hero figure and the 2x2 grid are separate lists, so every
                dt/dd group sits right under its dl. */}
            <div
              className={cn(
                "mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16",
                styles.reveal,
              )}
              data-sanity={dataAttribute?.("stats")}
            >
              <dl className="m-0">
                <Figure dataAttribute={dataAttribute} emphasis size="hero" stat={hero} />
              </dl>
              {rest.length ? (
                <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-7 self-end">
                  {rest.slice(0, 4).map((stat) => (
                    <Figure dataAttribute={dataAttribute} key={stat._key} size="small" stat={stat} />
                  ))}
                </dl>
              ) : null}
            </div>
            {share ? (
              <div className="mt-12 lg:mt-16">
                <ShareRow dataAttribute={dataAttribute} share={share} />
              </div>
            ) : null}
          </>
        ) : (
          <dl
            className={cn(
              // Six figures stay at three columns: two even rows, no orphan.
              "mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3",
              figures.length === 4 && "xl:grid-cols-4",
              figures.length === 5 && "xl:grid-cols-5",
              styles.reveal,
            )}
            data-sanity={dataAttribute?.("stats")}
          >
            {figures.map((stat, index) => (
              <Figure
                className="border-t-[3px] border-highlight pt-4"
                dataAttribute={dataAttribute}
                emphasis={index === 0}
                key={stat._key}
                size="band"
                stat={stat}
              />
            ))}
          </dl>
        )}

        {link ? (
          <ArrowLink button={link} className="mt-10 inline-block" dataSanity={dataAttribute?.("link")} />
        ) : null}
      </div>
    </section>
  );
}
