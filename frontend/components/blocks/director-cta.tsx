import { sectionThemeClass } from "./section-theme";
import { Button } from "@/components/ui/button";
import { getSafeLinkHref } from "@/lib/safe-href";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import styles from "./director-cta.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type DirectorCtaProps = Extract<PageBlock, { _type: "directorCta" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-[1.08em] font-semibold leading-none not-italic text-[var(--section-accent)]">
        {children}
      </em>
    ),
  },
};

export default function DirectorCta({
  _key,
  background,
  buttons,
  dataAttribute,
  description,
  image,
  title,
}: DirectorCtaProps) {
  if (!title?.length) return null;

  const theme = background ?? "green";
  const onDark = theme === "green";
  const sectionKey = stegaClean(_key);
  const headingId = `director-cta-${sectionKey}-title`;
  const message = stegaClean(description)?.trim();
  const portrait = image?.asset?._id ? image : undefined;
  const portraitWidth = portrait?.asset?.metadata?.dimensions?.width ?? 1;
  const portraitHeight = portrait?.asset?.metadata?.dimensions?.height ?? 1;
  const actions = (buttons ?? []).slice(0, 2).flatMap((button, index) => {
    const href = getSafeLinkHref(button.href);
    const label = stegaClean(button.text)?.trim();
    if (!href || !label) return [];
    return [{ button, href, index, label }];
  });

  return (
    <section
      aria-labelledby={headingId}
      className={`${sectionThemeClass(theme)} relative overflow-hidden py-section`}
      id={`director-cta-${sectionKey}`}
    >
      <div className="container-content">
        <div
          className={`grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-10 ${styles.reveal}`}
        >
          <div className="order-2 pt-[26px] text-center lg:order-1 lg:pt-0 lg:text-left">
            <h2
              className="text-balance font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.02em] lg:text-headline"
              data-sanity={dataAttribute?.("title")}
              id={headingId}
            >
              <PortableText components={headingComponents} value={title} />
            </h2>
            {message ? (
              <p
                className="mx-auto mt-[18px] max-w-[32rem] text-pretty text-base/[1.6] opacity-80 lg:mx-0 lg:mt-6 lg:text-[17px]"
                data-sanity={dataAttribute?.("description")}
              >
                {message}
              </p>
            ) : null}
            {actions.length ? (
              <div
                className="mt-[26px] flex flex-col gap-3 lg:mt-[34px] lg:flex-row lg:flex-wrap"
                data-sanity={dataAttribute?.("buttons")}
              >
                {actions.map(({ button, href, index, label }) => {
                  const openInNewTab = Boolean(stegaClean(button.openInNewTab));
                  return (
                    <Button
                      asChild
                      className="w-full lg:w-auto"
                      key={button._key ?? `${href}-${index}`}
                      onDark={onDark}
                      variant={index === 0 ? "default" : "outline"}
                    >
                      <Link
                        data-sanity={dataAttribute?.(`buttons[_key=="${button._key}"]`)}
                        href={href}
                        rel={openInNewTab ? "noopener noreferrer" : undefined}
                        target={openInNewTab ? "_blank" : undefined}
                      >
                        {label}
                        {openInNewTab ? (
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        ) : index === 0 ? (
                          <ArrowRight aria-hidden="true" className="size-4" />
                        ) : null}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* One-sided bleed: the portrait column is the top edge on phones and
              the bottom edge on desktop, so it cancels the section padding on
              that side only. The copy honours the padding. On desktop the
              column has no height of its own: it stretches to the row the
              copy sets, and the portrait scales to fill it, so the section
              is as tall as its copy and never taller. */}
          <div
            className="relative order-1 -mx-5 -mt-(--section-pad-top) h-80 overflow-hidden lg:order-2 lg:mx-0 lg:mt-0 lg:-mb-(--section-pad-bottom) lg:h-auto lg:self-stretch lg:overflow-visible"
            data-sanity={dataAttribute?.("image")}
          >
            <div
              aria-hidden="true"
              className={`absolute left-1/2 top-[70px] size-[330px] -translate-x-1/2 rounded-full after:absolute after:inset-0 after:rounded-full lg:left-[calc(50%_-_40px)] lg:top-auto lg:bottom-[-110px] lg:size-[600px] ${
                onDark
                  ? "bg-forest-panel after:bg-[radial-gradient(55%_45%_at_50%_42%,color-mix(in_oklab,var(--color-campfire-amber)_16%,transparent),transparent_70%)]"
                  : "bg-[color-mix(in_oklab,var(--color-sunlit-moss)_45%,var(--section-surface))] after:bg-[radial-gradient(55%_45%_at_50%_42%,color-mix(in_oklab,var(--color-campfire-amber)_14%,transparent),transparent_70%)]"
              }`}
            />
            {portrait ? (
              <Image
                alt={stegaClean(portrait.alt)?.trim() || ""}
                className={`absolute bottom-0 left-1/2 z-10 h-[300px] w-auto max-w-none -translate-x-[47%] lg:h-full lg:-translate-x-1/2 ${
                  onDark
                    ? "drop-shadow-[0_34px_38px_rgba(13,18,8,0.55)]"
                    : "drop-shadow-[0_28px_34px_rgba(13,18,8,0.22)]"
                }`}
                height={portraitHeight}
                sizes="(max-width: 1023px) 400px, 827px"
                src={urlFor(portrait).width(1400).url()}
                width={portraitWidth}
              />
            ) : null}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-30 bg-gradient-to-b from-transparent to-[var(--section-surface)] lg:hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
