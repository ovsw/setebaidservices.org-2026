import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import {
  HeadingText,
  hasImage,
  hasText,
  SectionButtons,
  SectionImage,
  type DataAttribute,
} from "./section-parts";
import { lightGlowClass, sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ImageCollageFeatureProps = Extract<PageBlock, { _type: "imageCollageFeature" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Image Collage, bento layout (prototype "Staff"): a four-column grid. The
 * text card takes the top-left half, the primary photo the whole right half,
 * and the other two photos the bottom-left quarters. Each photo has a dark
 * fade at its foot for a handwritten caption.
 */
const CELLS = [
  {
    path: "primaryImage",
    className: "col-span-2 md:col-start-3 md:row-span-2 md:row-start-1 max-md:aspect-[4/3]",
    sizes: "(min-width: 768px) 50vw, 100vw",
    width: 1400,
  },
  {
    path: "secondaryImage",
    className: "col-span-1 md:col-start-1 md:row-start-2 max-md:aspect-square",
    sizes: "(min-width: 768px) 25vw, 50vw",
    width: 800,
  },
  {
    path: "tertiaryImage",
    className: "col-span-1 md:col-start-2 md:row-start-2 max-md:aspect-square",
    sizes: "(min-width: 768px) 25vw, 50vw",
    width: 800,
  },
] as const;

export default function ImageCollageBento({
  _key,
  background,
  body,
  buttons,
  dataAttribute,
  eyebrow,
  primaryImage,
  secondaryImage,
  tertiaryImage,
  title,
}: ImageCollageFeatureProps) {
  if (!title?.length) return null;

  const headingId = `image-collage-${stegaClean(_key)}-title`;
  const photos = [primaryImage, secondaryImage, tertiaryImage];

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(background),
        lightGlowClass(background, "corners"),
      )}
    >
      <div className="container-content grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-[minmax(290px,auto)_minmax(290px,auto)]">
        <div className="col-span-2 flex flex-col justify-between gap-4 rounded-card bg-card p-8 text-card-foreground shadow-card md:col-start-1 md:row-start-1">
          <div className="flex flex-col gap-3">
            <div aria-hidden="true" className="flex gap-2">
              <span className="h-1 w-9 rounded-xs bg-mark" />
              <span className="h-1 w-9 rounded-xs bg-highlight" />
              <span className="h-1 w-9 rounded-xs bg-fill-cool" />
            </div>
            {hasText(eyebrow) ? (
              <p className="font-ui text-eyebrow text-link" data-sanity={dataAttribute?.("eyebrow")}>
                {eyebrow}
              </p>
            ) : null}
            <h2
              className="text-title-lg text-balance"
              data-sanity={dataAttribute?.("title")}
              id={headingId}
            >
              <HeadingText value={title} />
            </h2>
            {hasText(body) ? (
              <p
                className="max-w-[44ch] text-body text-muted-foreground"
                data-sanity={dataAttribute?.("body")}
              >
                {body}
              </p>
            ) : null}
          </div>
          <SectionButtons buttons={buttons} dataAttribute={dataAttribute} />
        </div>
        {CELLS.map((cell, index) => {
          const photo = photos[index];
          const caption = (photo as { caption?: string | null } | null | undefined)?.caption;
          return (
            <div
              className={cn("relative min-h-0 rounded-card shadow-card", cell.className)}
              data-sanity={dataAttribute?.(cell.path)}
              key={cell.path}
            >
              {hasImage(photo) ? (
                <div className="absolute inset-0 overflow-hidden rounded-card">
                  <SectionImage image={photo} sizes={cell.sizes} width={cell.width} />
                </div>
              ) : null}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[45%] rounded-b-card bg-linear-to-t from-[rgb(10_26_18/0.55)] to-transparent"
              />
              {index === 0 ? (
                <div
                  aria-hidden="true"
                  className="absolute top-7 -left-3.5 size-12 rounded-full bg-highlight shadow-[0_0_0_6px_var(--color-background)]"
                />
              ) : null}
              {hasText(caption) ? (
                <p
                  className={cn(
                    "absolute bottom-3.5 -rotate-2 text-note-sm text-white",
                    index === 0
                      ? "right-5 left-5 origin-bottom-right text-right"
                      : "left-5 origin-bottom-left",
                  )}
                >
                  {caption}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
