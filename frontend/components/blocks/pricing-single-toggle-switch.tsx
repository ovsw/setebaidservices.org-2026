"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

/** One price option, with its click-to-edit attributes resolved on the server. */
export type PricingSingleToggleOption = {
  key: string;
  name: string;
  price: string;
  unit?: string;
  note?: string;
  sanity: {
    option?: string;
    price?: string;
    unit?: string;
    note?: string;
  };
};

/*
 * The price box: one price at a time, and a segmented switch to change the
 * option. The box is always a white card with Pine Night ink so it reads the
 * same on every field. The note under the box follows the selected option.
 */
export function PricingSingleToggleSwitch({
  options,
  sanity,
}: Readonly<{
  options: PricingSingleToggleOption[];
  sanity?: string;
}>) {
  const [selectedKey, setSelectedKey] = useState(options[0]?.key);
  const selected = options.find((option) => option.key === selectedKey) ?? options[0];
  if (!selected) return null;

  return (
    <div data-sanity={sanity}>
      <div
        className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-pine-night/10 bg-white p-5 text-pine-night sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7 sm:py-6"
        data-sanity={selected.sanity.option}
      >
        <p aria-live="polite" className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span
            className="font-display text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold leading-none tracking-[-0.03em] tabular-nums"
            data-sanity={selected.sanity.price}
            key={selected.key}
          >
            {selected.price}
          </span>
          {selected.unit ? (
            <span
              className="text-[15px] font-medium text-ink-soft"
              data-sanity={selected.sanity.unit}
            >
              {selected.unit}
            </span>
          ) : null}
        </p>

        {options.length > 1 ? (
          <div
            aria-label="Price option"
            className="inline-flex shrink-0 self-start rounded-pill border border-pine-night/12 bg-birch-bark p-1 sm:self-auto"
            role="group"
          >
            {options.map((option) => {
              const active = option.key === selected.key;
              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    "focus-ring rounded-pill px-4 py-2 text-[14px] font-semibold leading-none transition-[background-color,color] motion-base motion-reduce:transition-none",
                    active
                      ? "bg-pine-night text-birch-bark"
                      : "text-ink-soft hover:text-pine-night",
                  )}
                  key={option.key}
                  onClick={() => setSelectedKey(option.key)}
                  type="button"
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selected.note ? (
        <p
          className="mt-4 text-[15px] leading-snug text-current/75"
          data-sanity={selected.sanity.note}
        >
          {selected.note}
        </p>
      ) : null}
    </div>
  );
}
