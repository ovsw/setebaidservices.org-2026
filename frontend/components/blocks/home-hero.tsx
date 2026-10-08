import HomeHeroVideoLightbox from "@/components/blocks/home-hero-video-lightbox";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import {
  BodyText,
  HeadingText,
  hasImage,
  hasText,
  SectionButtons,
  SectionImage,
  type DataAttribute,
  type PageButtonContext,
} from "./section-parts";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type HomeHeroProps = Extract<PageBlock, { _type: "homeHero" }> &
  PageButtonContext & {
    dataAttribute?: DataAttribute;
  };

/*
 * Home Hero (prototype "Hero"): on the Cream field, the status line,
 * display heading, lead, buttons and two facts sit left; a round photo in the
 * open brand ring sits right. A marigold play button on the ring opens the
 * camp film, and a handwritten note with a drawn arrow points to it.
 */
export default function HomeHero({
  _key,
  body,
  buttons,
  dataAttribute,
  filmButton,
  giving,
  homePage,
  image,
  stats,
  status,
  title,
}: HomeHeroProps) {
  if (!title?.length) return null;

  const headingId = `home-hero-${stegaClean(_key)}-title`;
  const filmUrl = stegaClean(filmButton?.url)?.trim();
  const filmLabel = stegaClean(filmButton?.label)?.trim() || "Watch the camp film";

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "overflow-x-clip pt-[calc(var(--header-height)+var(--header-gap)+2.5rem)] pb-(--section-pad-bottom) lg:pt-[calc(var(--header-height)+var(--header-gap)+3rem)]",
        sectionThemeClass("white"),
        "glow-sunrise",
      )}
      data-header-overlay="light"
      id={`hero-${stegaClean(_key)}`}
    >
      <div className="container-content grid items-center gap-12 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-16">
        <div className="relative flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            {hasText(status) ? (
              <p
                className="flex items-center gap-2 font-ui text-base leading-[1.3] font-semibold text-link"
                data-sanity={dataAttribute?.("status")}
              >
                <span aria-hidden="true" className="inline-block size-2.5 shrink-0 rounded-full bg-highlight" />
                {status}
              </p>
            ) : null}
            <h1
              className="text-display-hero text-balance"
              data-sanity={dataAttribute?.("title")}
              id={headingId}
            >
              <HeadingText value={title} />
            </h1>
            {body?.length ? (
              <div
                className="grid max-w-[40ch] gap-4 text-lead text-muted-foreground"
                data-sanity={dataAttribute?.("body")}
              >
                <BodyText value={body} />
              </div>
            ) : null}
          </div>
          <SectionButtons
            buttons={buttons}
            dataAttribute={dataAttribute}
            giving={giving}
            size="hero"
            // On the home page the second action is Donate, in marigold.
            variants={homePage ? ["primary", "highlight"] : ["primary", "outline"]}
          />
          {stats?.length ? (
            <dl
              className="grid max-w-[480px] grid-cols-[repeat(2,minmax(0,max-content))] gap-x-12 gap-y-6 border-t border-border pt-7 font-ui"
              data-sanity={dataAttribute?.("stats")}
            >
              {stats.map((stat) => (
                <div className="flex flex-col-reverse gap-1" key={stat._key}>
                  <dt className="text-[0.9375rem] text-muted-foreground">{stat.label}</dt>
                  <dd className="text-[1.0625rem] font-semibold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-col lg:mr-0 lg:ml-auto lg:max-w-[560px]">
          <div className="relative aspect-square w-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 -rotate-[38deg] rounded-full border-[14px] border-mark border-l-transparent lg:border-[18px]"
            />
            {hasImage(image) ? (
              <div
                className="absolute inset-[28px] overflow-hidden rounded-full bg-muted lg:inset-[38px]"
                data-sanity={dataAttribute?.("image")}
              >
                <SectionImage image={image} priority sizes="(min-width: 1024px) 560px, 420px" width={1100} />
              </div>
            ) : null}
            {filmUrl ? (
              <HomeHeroVideoLightbox href={filmUrl} label={filmLabel}>
                <button
                  aria-label={filmLabel}
                  className="focus-ring absolute bottom-[44px] left-1 flex size-20 cursor-pointer items-center justify-center rounded-full bg-highlight shadow-[0_0_0_8px_var(--color-background)] transition-transform motion-base hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 lg:bottom-[58px] lg:left-1.5 lg:size-[100px]"
                  data-sanity={dataAttribute?.("filmButton.url")}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="ml-2 size-0 border-y-[13px] border-l-[22px] border-y-transparent border-l-highlight-foreground lg:border-y-[16px] lg:border-l-[27px]"
                  />
                </button>
              </HomeHeroVideoLightbox>
            ) : null}
          </div>
          {filmUrl && hasText(filmButton?.label) ? (
            <div aria-hidden="true" className="pointer-events-none mt-2 flex items-start gap-2 pl-7 lg:pl-[38px]">
              <svg
                className="-mt-[54px] flex-none text-foreground"
                fill="none"
                height="64"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 36 64"
                width="36"
              >
                <path d="M34 60 C 20 58, 13 38, 18 4" />
                <path d="M12 11 L18 3 L24 11" />
              </svg>
              {/* The arrow stays click-through; the note itself takes pointer
                  events so Presentation can open its field on click. */}
              <span
                className="pointer-events-auto w-[6.5em] origin-top-left -rotate-3 text-note leading-none"
                data-sanity={dataAttribute?.("filmButton.label")}
              >
                {filmButton?.label}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
