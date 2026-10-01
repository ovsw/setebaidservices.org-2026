import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { stegaClean } from "next-sanity";
import { sectionThemeClass } from "./section-theme";
import type { CSSProperties } from "react";
import styles from "./journey.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type JourneyProps = Extract<PageBlock, { _type: "journey" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

type JourneyStop = NonNullable<JourneyProps["stops"]>[number];

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-[var(--section-accent)] not-italic">
        {children}
      </em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

function formatStopNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

/**
 * Stops the renderer can show: label and one line are required by the schema
 * and by the renderer, so a half-filled stop never breaks the path.
 */
export function getRenderableStops(stops: JourneyProps["stops"]) {
  return (stops ?? []).filter(
    (stop): stop is JourneyStop =>
      Boolean(stop?._key) && hasText(stop.label) && hasText(stop.text),
  );
}

export default function Journey({
  _key,
  background,
  dataAttribute,
  eyebrow,
  intro,
  stops,
  title,
}: JourneyProps) {
  const renderableStops = getRenderableStops(stops);

  if (!title?.length || renderableStops.length < 2) return null;

  const sectionKey = stegaClean(_key);
  const headingId = `journey-${sectionKey}-title`;
  const stopCount = renderableStops.length;
  const imageSizes = `(min-width: 1024px) ${Math.ceil(100 / stopCount)}vw, 100vw`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(background))}
      id={`journey-${sectionKey}`}
    >
      <div className="container-content">
        <header className="max-w-3xl">
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
            className="mt-6 max-w-[38rem] text-pretty text-[17px] leading-[1.6] text-current/75"
              data-sanity={dataAttribute?.("intro")}
            >
              {intro}
            </p>
          ) : null}
        </header>

        <ol
          aria-label="Stops, in travel order"
          className={cn("mt-14 list-none p-0 lg:mt-20", styles.path)}
          data-sanity={dataAttribute?.("stops")}
          style={{ "--journey-stops": stopCount } as CSSProperties}
        >
          {renderableStops.map((stop, index) => {
            const stopPath = `stops[_key=="${stop._key}"]`;
            const stopKey = stegaClean(stop._key);
            const labelId = `journey-${sectionKey}-${stopKey}-label`;
            const textId = `journey-${sectionKey}-${stopKey}-text`;
            const number = formatStopNumber(index);
            const time = stegaClean(stop.time)?.trim();
            const imageAlt = stegaClean(stop.image?.alt)?.trim() ?? "";

            return (
              <li
                aria-describedby={textId}
                aria-labelledby={labelId}
                className={cn(
                  "focus-ring rounded-lg",
                  styles.stop,
                  styles.reveal,
                )}
                data-journey-stop={number}
                key={stop._key}
                tabIndex={0}
              >
                <span aria-hidden="true" className={styles.rail}>
                  <span className={styles.dot} />
                </span>

                <div className={styles.body}>
                  <p className="flex items-center gap-2 text-label text-current/75">
                    <span>{number}</span>
                    {time ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span data-sanity={dataAttribute?.(`${stopPath}.time`)}>
                          {time}
                        </span>
                      </>
                    ) : null}
                  </p>
                  <h3
                    className="mt-3 font-display text-title"
                    data-sanity={dataAttribute?.(`${stopPath}.label`)}
                    id={labelId}
                  >
                    {stop.label}
                  </h3>
                  <p
                    className="mt-2 text-pretty text-[15px] leading-[1.55] text-current/75"
                    data-sanity={dataAttribute?.(`${stopPath}.text`)}
                    id={textId}
                  >
                    {stop.text}
                  </p>
                </div>

                {stop.image?.asset?._id ? (
                  <figure
                    className={cn(
                      "relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-birch-bark/12 bg-forest-panel",
                      styles.figure,
                    )}
                    data-sanity={dataAttribute?.(`${stopPath}.image`)}
                  >
                    <Image
                      alt={imageAlt}
                      blurDataURL={stop.image.asset.metadata?.lqip || undefined}
                      className="object-cover"
                      fill
                      placeholder={
                        stop.image.asset.metadata?.lqip ? "blur" : undefined
                      }
                      sizes={imageSizes}
                      src={urlFor(stop.image).width(800).height(600).url()}
                    />
                  </figure>
                ) : (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-birch-bark/12 bg-forest-panel",
                      styles.figure,
                    )}
                    data-sanity={dataAttribute?.(`${stopPath}.image`)}
                  >
                    <span className="font-display text-[3.5rem] font-extrabold leading-none tracking-[-0.03em] text-current/20">
                      {number}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
