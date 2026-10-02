"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type FlipCard = {
  back: string;
  dataSanity?: string;
  emoji: string;
  front: string;
  key: string;
};

/*
 * Each card takes the next tone in this order. The back is a full card fill;
 * the front is the same hue washed into the field, with no outline (like the
 * other cards on the site) and an accent for the small text.
 */
const TONES = [
  {
    back: "card-deep",
    front: "bg-[color-mix(in_oklab,var(--color-fill-deep)_12%,var(--color-background))]",
    accent: "text-foreground",
  },
  {
    back: "card-bold",
    front: "bg-[color-mix(in_oklab,var(--color-fill-bold)_14%,var(--color-background))]",
    accent: "text-link",
  },
  {
    back: "card-warm",
    front: "bg-[color-mix(in_oklab,var(--color-fill-warm)_26%,var(--color-background))]",
    accent: "text-warm-text",
  },
  {
    back: "card-cool",
    front: "bg-[color-mix(in_oklab,var(--color-fill-cool)_26%,var(--color-background))]",
    accent: "text-cool-text",
  },
] as const;

/*
 * On the Forest field the washes above turn muddy (marigold and lake mixed
 * into ink) and the deep fill is the field itself. Every front takes the
 * field's card surface instead, the small text a colour that reads on dark,
 * and the first back the quiet Sand fill so it does not vanish.
 */
const DARK_TONES = [
  { back: "card-quiet", front: "bg-card", accent: "text-muted-foreground" },
  { back: "card-bold", front: "bg-card", accent: "text-foreground" },
  { back: "card-warm", front: "bg-card", accent: "text-highlight" },
  { back: "card-cool", front: "bg-card", accent: "text-[var(--color-fill-cool)]" },
] as const;

function TurnIcon({ className, strokeWidth }: { className?: string; strokeWidth: number }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M6.5 7.5A8 8 0 1 1 5 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M3 4.5v6h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export default function FlipCardGrid({
  backLabel,
  cards,
  dark = false,
  frontLabel,
  turnLabel,
}: {
  backLabel: string;
  cards: FlipCard[];
  /** The section sits on the Forest field. */
  dark?: boolean;
  frontLabel: string;
  turnLabel: string;
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  // When the row first scrolls into view, each card turns part-way and
  // settles back, one after another, to show that it can be turned.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        grid.querySelectorAll<HTMLElement>("[data-peek]").forEach((node, index) => {
          node.animate(
            [
              { transform: "rotateY(0deg)" },
              { transform: "rotateY(60deg)", offset: 0.42 },
              { transform: "rotateY(-7deg)", offset: 0.78 },
              { transform: "rotateY(0deg)" },
            ],
            { delay: index * 110, duration: 720, easing: "cubic-bezier(.45,0,.25,1)" },
          );
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "grid gap-5 sm:grid-cols-2",
        cards.length >= 4 ? "lg:grid-cols-4" : cards.length === 3 ? "lg:grid-cols-3" : "",
      )}
      ref={gridRef}
    >
      {cards.map((card, index) => {
        const tones = dark ? DARK_TONES : TONES;
        const tone = tones[index % tones.length];
        const isFlipped = Boolean(flipped[card.key]);
        return (
          <button
            aria-pressed={isFlipped}
            className="focus-ring block h-[340px] w-full cursor-pointer rounded-card text-left [perspective:1200px] lg:h-[400px]"
            data-sanity={card.dataSanity}
            key={card.key}
            onClick={() =>
              setFlipped((current) => ({ ...current, [card.key]: !current[card.key] }))
            }
            type="button"
          >
            <span className="relative block size-full [transform-style:preserve-3d]" data-peek="">
              <span
                className="relative block size-full transition-transform duration-800 ease-flip [transform-style:preserve-3d] motion-reduce:transition-none"
                style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <span
                  aria-hidden={isFlipped || undefined}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-between rounded-card p-7 text-foreground [backface-visibility:hidden]",
                    tone.front,
                  )}
                >
                  <span className={cn("text-eyebrow", tone.accent)}>{frontLabel}</span>
                  <span className="text-statement text-pretty">{card.front}</span>
                  <span className={cn("flex items-center gap-2 text-note-sm", tone.accent)}>
                    <TurnIcon className="size-6" strokeWidth={3} />
                    {turnLabel}
                  </span>
                </span>
                <span
                  aria-hidden={!isFlipped || undefined}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-between overflow-hidden rounded-card p-7 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    tone.back,
                  )}
                >
                  <TurnIcon
                    className="absolute -right-[50px] -bottom-[50px] size-[220px] opacity-[0.06]"
                    strokeWidth={2.5}
                  />
                  <span className="text-eyebrow">{backLabel}</span>
                  <span className="relative text-statement-sm text-pretty">{card.back}</span>
                  <span aria-hidden="true" className="relative text-[34px] leading-none">
                    {card.emoji}
                  </span>
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
