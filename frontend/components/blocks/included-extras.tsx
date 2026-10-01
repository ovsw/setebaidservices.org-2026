import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { sectionThemeClass } from "./section-theme";
import styles from "./included-extras.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type IncludedExtrasProps = Extract<PageBlock, { _type: "includedExtras" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * Price, Included & Extras — the price first, then a two-plan comparison.
 *
 * The cards carry their own Pine Night ink and opaque surfaces, so they read
 * the same on a green section as on cream; they never inherit the field's text
 * colour.
 *
 * The price sheet is a white card above the columns. One price sits beside
 * its name; two or three prices become equal columns with a divider. Under
 * it, the included card is a pale green check list (positive); the extras
 * card is a white price sheet, price on the right in the mono legend.
 * Phones: everything stacks, price stays on the row.
 */

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-[var(--section-accent)] not-italic">{children}</em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

export default function IncludedExtras({
  _key,
  background,
  dataAttribute,
  extras,
  eyebrow,
  footnote,
  included,
  intro,
  prices,
  title,
}: IncludedExtrasProps) {
  const priceTiers = (prices ?? []).filter(
    (tier) => hasText(tier.name) && hasText(tier.price),
  );
  const includedItems = (included?.items ?? []).filter((item) =>
    hasText(item.label),
  );
  const extraItems = (extras?.items ?? []).filter(
    (item) => hasText(item.label) && hasText(item.price),
  );

  if (
    !title?.length ||
    !hasText(included?.heading) ||
    !hasText(extras?.heading) ||
    includedItems.length < 2 ||
    extraItems.length < 1
  ) {
    return null;
  }

  const sectionKey = stegaClean(_key);
  const headingId = `included-extras-${sectionKey}-title`;
  const includedId = `included-extras-${sectionKey}-included`;
  const extrasId = `included-extras-${sectionKey}-extras`;
  const pricesId = `included-extras-${sectionKey}-prices`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(background))}
      id={`included-extras-${sectionKey}`}
    >
      <div className="container-content">
        <header className={cn("max-w-3xl", styles.reveal)}>
          {hasText(eyebrow) ? (
            <p
              className="mb-5 text-eyebrow text-[var(--section-accent)]"
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className="text-balance font-display text-headline"
            data-sanity={dataAttribute?.("title")}
            id={headingId}
          >
            <PortableText components={headingComponents} value={title} />
          </h2>
          {hasText(intro) ? (
            <p
            className="mt-6 max-w-xl text-pretty text-[17px] leading-[1.6] text-current/75"
              data-sanity={dataAttribute?.("intro")}
            >
              {intro}
            </p>
          ) : null}
        </header>

        {priceTiers.length > 0 ? (
          <section
            aria-labelledby={pricesId}
            className={cn(
              "mt-14 rounded-[1.625rem] border border-pine-night/10 bg-white p-7 text-pine-night sm:p-10",
              styles.reveal,
            )}
            data-sanity={dataAttribute?.("prices")}
          >
            <h3 className="sr-only" id={pricesId}>
              Price
            </h3>
            <ul
              className={cn(
                "grid gap-8",
                priceTiers.length > 1 &&
                  "sm:grid-flow-col sm:auto-cols-fr sm:gap-x-10",
              )}
            >
              {priceTiers.map((tier, index) => {
                const tierPath = `prices[_key=="${tier._key}"]`;
                const single = priceTiers.length === 1;

                return (
                  <li
                    className={cn(
                      "flex flex-col gap-3",
                      single &&
                        "sm:flex-row sm:items-end sm:justify-between sm:gap-10",
                      !single &&
                        index > 0 &&
                        "border-t border-pine-night/10 pt-8 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-10",
                    )}
                    data-sanity={dataAttribute?.(tierPath)}
                    key={tier._key}
                  >
                    <div className={cn("min-w-0", single && "max-w-md")}>
                      <p
                        className="text-label text-ink-soft"
                        data-sanity={dataAttribute?.(`${tierPath}.name`)}
                      >
                        {tier.name}
                      </p>
                      {hasText(tier.note) ? (
                        <p
                          className="mt-2 text-[15px] leading-snug text-ink-muted"
                          data-sanity={dataAttribute?.(`${tierPath}.note`)}
                        >
                          {tier.note}
                        </p>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "flex flex-wrap items-baseline gap-x-3 gap-y-1",
                        single ? "sm:justify-end sm:text-right" : "order-first",
                      )}
                    >
                      <span
                        className="font-display text-[clamp(2.75rem,6vw,4.25rem)] font-extrabold leading-none tracking-[-0.03em] tabular-nums"
                        data-sanity={dataAttribute?.(`${tierPath}.price`)}
                      >
                        {tier.price}
                      </span>
                      {hasText(tier.unit) ? (
                        <span
                          className="font-mono text-[14px] font-bold tracking-[0.01em] text-ink-soft"
                          data-sanity={dataAttribute?.(`${tierPath}.unit`)}
                        >
                          {tier.unit}
                        </span>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div
          className={cn(
            "grid gap-6 lg:grid-cols-2 lg:gap-8",
            priceTiers.length > 0 ? "mt-6 lg:mt-8" : "mt-14",
          )}
        >
          {/* Included: pale green card (Sunlit Moss mixed into Birch Bark), check list */}
          <section
            aria-labelledby={includedId}
            className={cn(
              "flex flex-col rounded-[1.625rem] border border-cedar/20 bg-[color-mix(in_oklab,var(--color-sunlit-moss)_40%,var(--color-birch-bark))] p-7 text-pine-night sm:p-10",
              styles.reveal,
            )}
            data-sanity={dataAttribute?.("included")}
          >
            <p className="text-label text-cedar-deep">Included</p>
            <h3
              className="mt-4 font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-tight sm:text-[2rem]"
              data-sanity={dataAttribute?.("included.heading")}
              id={includedId}
            >
              {included?.heading}
            </h3>
            {hasText(included?.note) ? (
              <p
                className="mt-2 text-[15px] leading-snug text-ink-muted"
                data-sanity={dataAttribute?.("included.note")}
              >
                {included?.note}
              </p>
            ) : null}
            <ul
              className="mt-8 divide-y divide-pine-night/12 border-t border-pine-night/12"
              data-sanity={dataAttribute?.("included.items")}
            >
              {includedItems.map((item) => (
                <li
                  className="flex items-start gap-4 py-4"
                  data-sanity={dataAttribute?.(
                    `included.items[_key=="${item._key}"]`,
                  )}
                  key={item._key}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-cedar text-birch-bark"
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold leading-snug">
                      {item.label}
                    </span>
                    {hasText(item.detail) ? (
                      <span className="mt-1 block text-[15px] leading-snug text-ink-muted">
                        {item.detail}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Extras: white price sheet, priced rows */}
          <section
            aria-labelledby={extrasId}
            className={cn(
              "flex flex-col rounded-[1.625rem] border border-pine-night/10 bg-white p-7 text-pine-night sm:p-10",
              styles.reveal,
            )}
            data-sanity={dataAttribute?.("extras")}
          >
            <p className="text-label text-ink-soft">Extra</p>
            <h3
              className="mt-4 font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-tight sm:text-[2rem]"
              data-sanity={dataAttribute?.("extras.heading")}
              id={extrasId}
            >
              {extras?.heading}
            </h3>
            {hasText(extras?.note) ? (
              <p
                className="mt-2 text-[15px] leading-snug text-ink-muted"
                data-sanity={dataAttribute?.("extras.note")}
              >
                {extras?.note}
              </p>
            ) : null}
            <ul
              className="mt-8 divide-y divide-pine-night/10 border-t border-pine-night/10"
              data-sanity={dataAttribute?.("extras.items")}
            >
              {extraItems.map((item) => {
                const itemPath = `extras.items[_key=="${item._key}"]`;
                const href = getSafeLinkHref(item.link?.href);
                const linkText = stegaClean(item.link?.text)?.trim();
                const link = href && linkText ? { href, text: linkText } : null;

                return (
                  <li
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 py-4"
                    data-sanity={dataAttribute?.(itemPath)}
                    key={item._key}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-pine-night/25 text-pine-night"
                    >
                      <Plus className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-[17px] font-semibold leading-snug"
                        data-sanity={dataAttribute?.(`${itemPath}.label`)}
                      >
                        {item.label}
                      </span>
                      {hasText(item.detail) ? (
                        <span
                          className="mt-1 block text-[15px] leading-snug text-ink-muted"
                          data-sanity={dataAttribute?.(`${itemPath}.detail`)}
                        >
                          {item.detail}
                        </span>
                      ) : null}
                      {link ? (
                        <Link
                          className="focus-ring mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold text-cedar transition-colors hover:text-cedar-deep motion-reduce:transition-none"
                          data-sanity={dataAttribute?.(`${itemPath}.link`)}
                          href={link.href}
                          rel={
                            stegaClean(item.link?.openInNewTab)
                              ? "noopener noreferrer"
                              : undefined
                          }
                          target={
                            stegaClean(item.link?.openInNewTab)
                              ? "_blank"
                              : undefined
                          }
                        >
                          {link.text}
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        </Link>
                      ) : null}
                    </span>
                    <span
                      className="whitespace-nowrap pt-1 text-right font-mono text-[14px] font-bold tracking-[0.01em] text-ink-soft"
                      data-sanity={dataAttribute?.(`${itemPath}.price`)}
                    >
                      {item.price}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {hasText(footnote) ? (
          <p
            className="mt-6 max-w-3xl text-sm leading-relaxed text-current/70"
            data-sanity={dataAttribute?.("footnote")}
          >
            {footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
