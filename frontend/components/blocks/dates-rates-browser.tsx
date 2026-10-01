"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./dates-rates-section.module.css";
import {
  enrollmentHref,
  formatRate,
  getSeasonTicks,
  maxSessionRows,
  type PreparedLength,
} from "./dates-rates-model";

/** Label colours hold 4.5:1 on cream; the bar colour carries the status. */
function availabilityClass(status: string) {
  if (status === "full") {
    return "text-ink-muted";
  }
  if (status === "limited") {
    return "text-cedar-deep";
  }
  return "text-ink-muted";
}

/** Animates the displayed rate from its previous value to the active length's rate over ~620ms. */
function useAnimatedRate(rateValue: number) {
  const [displayValue, setDisplayValue] = useState(rateValue);
  const previousRateRef = useRef(rateValue);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = previousRateRef.current;
    const to = rateValue;
    previousRateRef.current = rateValue;

    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (from === to || reduceMotion) {
      setDisplayValue(to);
      return;
    }

    const duration = 620;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [rateValue]);

  return displayValue;
}

export default function DatesRatesBrowser({
  lengths,
  portalLink,
  seasonStart,
}: {
  lengths: PreparedLength[];
  portalLink?: {
    dataSanity?: string;
    href: string;
    openInNewTab: boolean;
    text: string;
  };
  seasonStart: string;
}) {
  const [selectedKey, setSelectedKey] = useState(lengths[0]?.key);
  const activeLength =
    lengths.find((length) => length.key === selectedKey) ?? lengths[0];
  const ticks = useMemo(() => getSeasonTicks(seasonStart), [seasonStart]);
  const animatedRate = useAnimatedRate(activeLength?.rateValue ?? 0);

  if (!activeLength) return null;

  const slots = Array.from({ length: maxSessionRows }, (_, index) => {
    const isOpenSlot = index < activeLength.rows.length;
    const row =
      activeLength.rows[Math.min(index, activeLength.rows.length - 1)];
    return { isOpenSlot, row };
  });

  return (
    <div className="md:rounded-[1.75rem] md:border md:border-pine-night/10 md:bg-birch-bark-bright md:p-8 md:shadow-[0_30px_70px_rgba(22,32,15,0.12)]">
      <div className="flex flex-col lg:block">
      <div className="max-lg:contents lg:mb-9 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
        <div
          aria-label="Session length"
          className="order-2 mt-8 flex flex-wrap gap-2 lg:order-none lg:mt-0"
          role="tablist"
        >
          {lengths.map((length) => {
            const selected = length.key === activeLength.key;
            return (
              <button
                aria-selected={selected}
                className={
                  selected
                    ? `focus-ring rounded-pill border border-cedar bg-cedar px-5 py-3 text-sm font-bold tracking-normal text-birch-bark ${styles.tab}`
                    : `focus-ring rounded-pill border border-pine-night/18 bg-transparent px-5 py-3 text-sm font-bold tracking-normal text-ink-muted motion-reduce:transition-none ${styles.tab}`
                }
                key={length.key}
                onClick={() => setSelectedKey(length.key)}
                role="tab"
                type="button"
              >
                {length.label}
              </button>
            );
          })}
        </div>
        {/* Every open row carries its own Enroll bar, so the only action up
            here is the quiet portal link for returning families. */}
        {portalLink ? (
          <div className="order-4 mt-8 lg:order-none lg:ml-auto lg:mt-0">
            <a
              className="focus-ring inline-flex w-fit items-center gap-1.5 text-[15px] font-semibold text-cedar underline decoration-cedar/30 underline-offset-4 transition-colors hover:text-cedar-deep hover:decoration-cedar-deep motion-reduce:transition-none"
              data-sanity={portalLink.dataSanity}
              href={portalLink.href}
              rel={portalLink.openInNewTab ? "noopener noreferrer" : undefined}
              target={portalLink.openInNewTab ? "_blank" : undefined}
            >
              {portalLink.text}
              <span aria-hidden="true">{"\u2197"}</span>
            </a>
          </div>
        ) : null}
      </div>

      <div className="max-lg:contents lg:grid lg:grid-cols-[320px_1fr] lg:gap-14">
        <aside className="order-1 lg:order-none">
          <p className="text-label text-ink-muted">
            Per camper &middot; session rate
          </p>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span
              className="font-display text-[clamp(3.5rem,7vw,4.75rem)] font-extrabold leading-none tabular-nums"
              data-sanity={activeLength.rateAttribute}
            >
              {formatRate(animatedRate)}
            </span>
            <span className="font-mono text-[14px] font-bold tracking-[0.01em] text-ink-soft">
              +tax
            </span>
          </div>
          <p
            className="mt-3 font-accent text-3xl font-semibold leading-tight text-cedar"
            data-sanity={activeLength.descriptionAttribute}
          >
            {activeLength.description}
          </p>
        </aside>

        <div className="order-3 mt-6 flex flex-col lg:order-none lg:mt-0">
          <div className="mb-3 hidden gap-3 md:grid md:grid-cols-[7.5rem_1fr] md:gap-3.5">
                <span className="text-label hidden self-end text-ink-soft md:block">
              Session dates
            </span>
            <span className="relative hidden h-[15px] md:block">
              {ticks.map((tick, index) => (
                <span
                  className={`absolute bottom-0 font-mono text-[14px] leading-snug tracking-[0.01em] text-ink-muted ${index % 2 === 1 ? "hidden xl:inline" : ""}`}
                  key={tick.date}
                  style={
                    index === 0
                      ? { left: 0 }
                      : index === ticks.length - 1
                        ? { right: 0 }
                        : {
                            left: `${(index / (ticks.length - 1)) * 100}%`,
                            transform: "translateX(-50%)",
                          }
                  }
                >
                  {tick.label}
                </span>
              ))}
            </span>
          </div>

          <div className="relative flex flex-1 flex-col justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden md:grid md:grid-cols-[7.5rem_1fr] md:gap-3.5"
            >
              <span />
              {/* Dividers mark the true date positions; bars inset from them. */}
              <span className="relative block">
                <span className="absolute inset-y-0 left-1/4 border-l border-dashed border-pine-night/14" />
                <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-pine-night/14" />
                <span className="absolute inset-y-0 left-3/4 border-l border-dashed border-pine-night/14" />
              </span>
            </div>
            {slots.map(({ isOpenSlot, row }, index) => {
              const isFull = isOpenSlot && row.isFull;
              const interactive = isOpenSlot && !isFull;
              const RowElement = interactive ? "a" : "div";
              // Availability label sits in the empty track beside the bar;
              // when the bar ends near the right edge, flip it to the left side.
              const labelOnLeft = row.left + row.width > 85;

              return (
                <div
                  className={`${styles.slot} ${isOpenSlot ? styles.slotOpen : ""}`}
                  key={index}
                >
                  <RowElement
                    aria-hidden={isOpenSlot ? undefined : true}
                    className={`${styles.row} flex h-full flex-col justify-center gap-y-2 pb-1.5 pt-4 no-underline md:grid md:grid-cols-[7.5rem_1fr] md:items-center md:gap-3.5 md:py-[9px] ${interactive ? "" : "pointer-events-none"}`}
                    data-open={interactive}
                    {...(interactive
                      ? {
                          href: enrollmentHref,
                          rel: "noreferrer",
                          target: "_blank",
                        }
                      : {})}
                  >
                    <span className="flex items-baseline gap-x-3 md:flex-col md:items-start md:gap-y-1">
                      <span
                        className={`${styles.dates} font-mono text-[14px] leading-snug tracking-[0.01em]`}
                        data-sanity={row.startDateAttribute}
                      >
                        {row.dates}
                      </span>
                      <span className="font-mono text-[14px] leading-snug tracking-[0.01em] text-ink-muted">
                        {row.weeksLabel}
                      </span>
                    </span>
                    <span
                      className={`${styles.track} relative block h-10 overflow-hidden rounded-xs bg-pine-night/5`}
                    >
                      {/* Mobile dividers: the desktop overlay grid is hidden below md. */}
                      <span aria-hidden="true" className="absolute inset-y-0 left-1/4 border-l border-dashed border-pine-night/14 md:hidden" />
                      <span aria-hidden="true" className="absolute inset-y-0 left-1/2 border-l border-dashed border-pine-night/14 md:hidden" />
                      <span aria-hidden="true" className="absolute inset-y-0 left-3/4 border-l border-dashed border-pine-night/14 md:hidden" />
                      <span
                        className={`${styles.bar} inline-flex items-center justify-center font-mono text-[14px] font-bold tracking-[0.01em] ${isFull ? styles.barFull : ""} ${row.status === "limited" ? styles.barLimited : ""}`}
                        data-sanity={row.availabilityStatusAttribute}
                        style={{
                          left: `${row.left}%`,
                          right: `${100 - row.left - row.width}%`,
                        }}
                      >
                        {interactive ? <>Enroll&nbsp;&rarr;</> : null}
                      </span>
                      {/* Gap is measured from the bar edge, which the bar's own margin insets. */}
                      <span
                        className={`absolute inset-y-0 inline-flex items-center whitespace-nowrap font-mono text-[14px] font-bold tracking-[0.01em] ${availabilityClass(row.status)}`}
                        data-sanity={row.availabilityNoteAttribute}
                        style={
                          labelOnLeft
                            ? {
                                right: `calc(${100 - row.left}% + var(--bar-gap) + 12px)`,
                              }
                            : {
                                left: `calc(${row.left + row.width}% + var(--bar-gap) + 12px)`,
                              }
                        }
                      >
                        {row.label}
                      </span>
                    </span>
                  </RowElement>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

    </div>
  );
}
