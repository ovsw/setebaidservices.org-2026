import {
  HeadingText,
  hasText,
  type DataAttribute,
} from "@/components/blocks/section-parts";
import { cn } from "@/lib/utils";
import type { PortableTextProps } from "@portabletext/react";
import styles from "./impact-parts.module.css";

/*
 * Parts shared by the two impact sections, Impact Numbers (a band of figures)
 * and Impact Spotlight (one hero figure, a share bar and a statement): the
 * header with its handwritten season note, and the figure with its small
 * detail and label. Both read the field tokens.
 */

export type ImpactStat = {
  _key: string;
  value?: string | null;
  detail?: string | null;
  label?: string | null;
};

export const revealClass = styles.reveal;

/** Figures that have both a value and a label; the rest cannot render. */
export function usableStats<T extends ImpactStat>(stats: T[] | null | undefined) {
  return (stats ?? []).filter((stat) => hasText(stat.value) && hasText(stat.label));
}

export function ImpactHeader({
  dataAttribute,
  eyebrow,
  headingId,
  intro,
  season,
  title,
}: {
  dataAttribute?: DataAttribute;
  eyebrow?: string | null;
  headingId: string;
  intro?: string | null;
  season?: string | null;
  title?: PortableTextProps["value"] | null;
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

/**
 * A figure with its small detail and its label. The div groups one dt/dd
 * pair, so it must sit right under a dl. dt/dd keep source order for
 * assistive tech; the value shows above its label with flex order.
 */
export function ImpactFigure({
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
  stat: ImpactStat;
}) {
  const path = `stats[_key=="${stat._key}"]`;
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
