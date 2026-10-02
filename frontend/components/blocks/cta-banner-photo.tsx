import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import {
  hasImage,
  hasText,
  resolveButton,
  SectionButtonLink,
  SectionImage,
  type DataAttribute,
} from "./section-parts";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type CtaBannerProps = Extract<PageBlock, { _type: "ctaBanner" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Call to Action, photo band (prototype "Donate"): a full-bleed photo with a
 * dark fade rising from the bottom. The heading and text sit on the fade at
 * the left; the main button and a text link sit at the right. The Forest
 * field re-points the text tokens to cream and marigold.
 */
export default function CtaBannerPhoto({
  _key,
  buttons,
  dataAttribute,
  description,
  eyebrow,
  image,
  title,
}: CtaBannerProps) {
  if (!title) return null;

  const headingId = `cta-banner-${stegaClean(_key)}-title`;
  const [main, secondary] = buttons ?? [];
  const secondaryLink = resolveButton(secondary);

  return (
    <section
      aria-labelledby={headingId}
      className="field-forest relative flex min-h-[560px] items-end overflow-hidden md:min-h-[640px]"
    >
      {hasImage(image) ? (
        <div className="absolute inset-0" data-sanity={dataAttribute?.("image")}>
          <SectionImage image={image} sizes="100vw" width={2400} />
        </div>
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_26_18/0.92)_0%,rgb(10_26_18/0.55)_45%,rgb(10_26_18/0.05)_100%)]"
      />
      <div className="container-content relative grid w-full items-end gap-8 pt-[200px] pb-(--section-pad-bottom) md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div className="flex flex-col gap-4">
          {hasText(eyebrow) ? (
            <p className="font-ui text-eyebrow text-highlight" data-sanity={dataAttribute?.("eyebrow")}>
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-headline" data-sanity={dataAttribute?.("title")} id={headingId}>
            {title}
          </h2>
          {hasText(description) ? (
            <p
              className="max-w-[48ch] text-body text-muted-foreground"
              data-sanity={dataAttribute?.("description")}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-4" data-sanity={dataAttribute?.("buttons")}>
          <SectionButtonLink arrow button={main} fallbackVariant="highlight" size="hero" />
          {secondaryLink ? (
            <Link
              className="focus-ring font-ui text-base font-semibold text-foreground underline hover:text-highlight"
              href={secondaryLink.href}
              rel={secondaryLink.openInNewTab ? "noopener noreferrer" : undefined}
              target={secondaryLink.openInNewTab ? "_blank" : undefined}
            >
              {secondaryLink.label}&nbsp;→
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
