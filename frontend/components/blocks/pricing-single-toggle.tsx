import { Button } from "@/components/ui/button";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import type { ComponentProps } from "react";
import { PricingSingleToggleSwitch, type PricingSingleToggleOption } from "./pricing-single-toggle-switch";
import { sectionThemeClass } from "./section-theme";
import styles from "./pricing-single-toggle.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type PricingSingleToggleProps = Extract<PageBlock, { _type: "pricingSingleToggle" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/*
 * Pricing Single Toggle — one offer, split in two.
 *
 * Left: a dark art panel (Forest Floor into Forest Panel, with the amber
 * band glow in one corner) carrying the eyebrow and the heading at the top.
 * An optional photo sits faintly under the gradient as texture; the text is
 * the subject, not the picture. Right: the intro line, a white price box with a
 * segmented toggle between price options, the note for the chosen option, a
 * check list of what the price includes, and one button. The panel and the price box carry their
 * own ink, so the section reads the same on green as on cream. Phones stack
 * the panel above the details.
 */

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

function resolveButtonVariant(variant: string | null | undefined): ButtonVariant {
  const clean = stegaClean(variant);
  if (
    clean === "default" ||
    clean === "secondary" ||
    clean === "outline" ||
    clean === "ghost" ||
    clean === "link"
  ) {
    return clean;
  }
  return "default";
}

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-campfire-amber not-italic">{children}</em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

export default function PricingSingleToggle({
  _key,
  background,
  button,
  dataAttribute,
  eyebrow,
  facts,
  options,
  footnote,
  image,
  intro,
  title,
}: PricingSingleToggleProps) {
  const optionList: PricingSingleToggleOption[] = (options ?? [])
    .filter((option) => hasText(option.name) && hasText(option.price))
    .map((option) => {
      const path = `options[_key=="${option._key}"]`;
      return {
        key: stegaClean(option._key) ?? option._key,
        name: option.name ?? "",
        price: option.price ?? "",
        unit: hasText(option.unit) ? (option.unit ?? undefined) : undefined,
        note: hasText(option.note) ? (option.note ?? undefined) : undefined,
        sanity: {
          option: dataAttribute?.(path),
          price: dataAttribute?.(`${path}.price`),
          unit: dataAttribute?.(`${path}.unit`),
          note: dataAttribute?.(`${path}.note`),
        },
      };
    });
  const factList = (facts ?? []).filter((fact) => hasText(fact.label));

  if (!title?.length || optionList.length < 1 || factList.length < 2) return null;

  const sectionKey = stegaClean(_key);
  const headingId = `pricing-single-toggle-${sectionKey}-title`;
  const theme = background ?? "white";
  const onDark = theme === "green";
  const hasImage = Boolean(image?.asset?._id);

  const href = getSafeLinkHref(button?.href);
  const buttonLabel = stegaClean(button?.text)?.trim();
  const openInNewTab = Boolean(stegaClean(button?.openInNewTab));
  const action = href && buttonLabel ? { href, label: buttonLabel } : null;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(theme))}
      id={`pricing-single-toggle-${sectionKey}`}
    >
      <div className="container-content">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)] lg:gap-14">
          <div
            className={cn(
              "relative isolate flex min-h-[20rem] flex-col justify-start overflow-hidden rounded-[var(--radius-xl)] p-8 text-birch-bark sm:min-h-[26rem] sm:p-10",
              onDark
                ? "bg-[linear-gradient(160deg,var(--color-forest-panel),var(--color-pine-night))]"
                : "bg-[linear-gradient(160deg,var(--color-forest-floor),var(--color-forest-panel))]",
              styles.panel,
              styles.reveal,
            )}
          >
            {hasImage ? (
              <figure
                aria-hidden="true"
                className="absolute inset-0 -z-10 m-0"
                data-sanity={dataAttribute?.("image")}
              >
                <Image
                  alt=""
                  className={cn("object-cover", styles.texture)}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  src={urlFor(image!).width(1400).height(1000).url()}
                />
              </figure>
            ) : null}
            <div className="relative max-w-[26rem]">
              {hasText(eyebrow) ? (
                <p
                  className="mb-4 text-eyebrow text-campfire-amber"
                  data-sanity={dataAttribute?.("eyebrow")}
                >
                  {eyebrow}
                </p>
              ) : null}
              <h2
                className="text-balance font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.02em]"
                data-sanity={dataAttribute?.("title")}
                id={headingId}
              >
                <PortableText components={headingComponents} value={title} />
              </h2>
            </div>
          </div>

          <div className={cn("flex flex-col justify-center", styles.reveal)}>
            {hasText(intro) ? (
              <p
                className="mb-6 max-w-[34rem] text-pretty text-[17px] leading-[1.6] text-current/80"
                data-sanity={dataAttribute?.("intro")}
              >
                {intro}
              </p>
            ) : null}

            <PricingSingleToggleSwitch options={optionList} sanity={dataAttribute?.("options")} />

            <ul
              className="mt-8 grid gap-4 border-t border-current/15 pt-8"
              data-sanity={dataAttribute?.("facts")}
            >
              {factList.map((fact) => (
                <li
                  className="flex items-start gap-3.5"
                  data-sanity={dataAttribute?.(`facts[_key=="${fact._key}"]`)}
                  key={fact._key}
                >
                  <Check
                    aria-hidden="true"
                    className="mt-1 size-4.5 shrink-0 text-[var(--section-accent)]"
                    strokeWidth={3}
                  />
                  <span className="min-w-0">
                    <span className="block text-[16px] font-semibold leading-snug">
                      {fact.label}
                    </span>
                    {hasText(fact.detail) ? (
                      <span className="mt-0.5 block text-[15px] leading-snug text-current/70">
                        {fact.detail}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>

            {action ? (
              <div className="mt-8" data-sanity={dataAttribute?.("button")}>
                <Button
                  asChild
                  className="w-full sm:w-auto"
                  onDark={onDark}
                  variant={resolveButtonVariant(button?.variant)}
                >
                  <Link
                    href={action.href}
                    rel={openInNewTab ? "noopener noreferrer" : undefined}
                    target={openInNewTab ? "_blank" : undefined}
                  >
                    {action.label}
                    {openInNewTab ? (
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    ) : (
                      <ArrowRight aria-hidden="true" className="size-4" />
                    )}
                  </Link>
                </Button>
              </div>
            ) : null}

            {hasText(footnote) ? (
              <p
                className="mt-6 max-w-[34rem] text-sm leading-relaxed text-current/65"
                data-sanity={dataAttribute?.("footnote")}
              >
                {footnote}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
