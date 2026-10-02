import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLink,
  HeadingText,
  hasText,
  resolveButton,
  type DataAttribute,
} from "./section-parts";
import { lightGlowClass, sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type StackedTimelineProps = Extract<PageBlock, { _type: "stackedTimeline" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Timeline, date cards layout (prototype "Events"): up to three coloured
 * cards that lead with the item's small label set large, usually a date.
 * Fills rotate camp green, marigold and lake. The first section button shows
 * as a text link beside the heading. A faint open brand ring and a marigold
 * dot sit behind the cards.
 */
const FILLS = ["card-bold", "card-warm", "card-cool"] as const;

function CardShell({
  children,
  className,
  dataSanity,
  link,
}: {
  children: ReactNode;
  className: string;
  dataSanity?: string;
  link: ReturnType<typeof resolveButton>;
}) {
  if (!link) {
    return (
      <div className={className} data-sanity={dataSanity}>
        {children}
      </div>
    );
  }
  return (
    <Link
      className={cn(
        className,
        "focus-ring transition-transform motion-base hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
      )}
      data-sanity={dataSanity}
      href={link.href}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      target={link.openInNewTab ? "_blank" : undefined}
    >
      {children}
    </Link>
  );
}

export default function StackedTimelineDateCards({
  _key,
  background,
  buttons,
  dataAttribute,
  items,
  title,
}: StackedTimelineProps) {
  const cards = (items ?? []).slice(0, 3);
  if (!title?.length || !cards.length) return null;

  const headingId = `stacked-timeline-${stegaClean(_key)}-title`;
  const headerLink = buttons?.[0];

  return (
    <section
      aria-labelledby={headingId}
      className={cn("relative overflow-hidden py-section", sectionThemeClass(background),
        lightGlowClass(background, "corners"),
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-[420px] -mt-[380px] size-[760px] rotate-180 rounded-full border-[60px] border-mark border-l-transparent opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-[8%] size-7 rounded-full bg-highlight opacity-35"
      />
      <div className="container-content relative flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-headline" data-sanity={dataAttribute?.("title")} id={headingId}>
            <HeadingText value={title} />
          </h2>
          <ArrowLink
            button={headerLink}
            dataSanity={dataAttribute?.(`buttons[_key=="${headerLink?._key}"]`)}
          />
        </div>
        <ul
          className={cn(
            "grid list-none gap-5 p-0",
            cards.length >= 2 && "sm:grid-cols-2",
            cards.length >= 3 && "lg:grid-cols-3",
          )}
          data-sanity={dataAttribute?.("items")}
        >
          {cards.map((card, index) => {
            const cardLink = resolveButton(card.link);
            return (
              <li className="flex" key={card._key}>
                <CardShell
                  className={cn(
                    "flex w-full flex-col gap-4 rounded-card p-7 font-ui no-underline",
                    FILLS[index % FILLS.length],
                  )}
                  dataSanity={dataAttribute?.(`items[_key=="${card._key}"]`)}
                  link={cardLink}
                >
                  {hasText(card.meta) ? <span className="text-figure">{card.meta}</span> : null}
                  <span className="mt-2 text-title">{card.title}</span>
                  {hasText(card.text) ? (
                    <span className="text-small opacity-90">{card.text}</span>
                  ) : null}
                  {cardLink ? (
                    <span className="mt-auto pt-3 typo-button underline underline-offset-[0.22em]">
                      {cardLink.label}&nbsp;→
                    </span>
                  ) : null}
                </CardShell>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
