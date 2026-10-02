import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import {
  ArrowLink,
  hasImage,
  hasText,
  SectionImage,
  type DataAttribute,
} from "./section-parts";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type PhotoStripProps = Extract<PageBlock, { _type: "photoStrip" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Photo Strip: a full-bleed row of photos in staggered heights. The second
 * and fourth photos drop by 40px. Track widths follow the prototype
 * (5 4 6 4 5); phones show the first three.
 */
const TRACKS: Record<number, string> = {
  3: "md:grid-cols-[5fr_6fr_5fr]",
  4: "md:grid-cols-[5fr_4fr_6fr_5fr]",
  5: "md:grid-cols-[5fr_4fr_6fr_4fr_5fr]",
};

export default function PhotoStrip({
  _key,
  background,
  caption,
  dataAttribute,
  images,
  link,
}: PhotoStripProps) {
  const photos = (images ?? []).filter(hasImage);
  if (!photos.length) return null;

  return (
    <section
      aria-label={stegaClean(caption) || "Photos from camp"}
      className={cn("flex flex-col gap-4 py-section", sectionThemeClass(background))}
      id={`photo-strip-${stegaClean(_key)}`}
    >
      <div
        className={cn(
          "grid h-[260px] grid-cols-3 gap-3 px-3 md:h-[460px] md:gap-4 md:px-4",
          TRACKS[photos.length] ?? TRACKS[5],
        )}
        data-sanity={dataAttribute?.("images")}
      >
        {photos.map((photo, index) => (
          <div
            className={cn(
              "relative overflow-hidden rounded-card",
              index % 2 === 1 && "mt-6 md:mt-10",
              index >= 3 && "max-md:hidden",
            )}
            data-sanity={dataAttribute?.(`images[_key=="${photo._key}"]`)}
            key={photo._key}
          >
            <SectionImage image={photo} sizes="(min-width: 768px) 25vw, 33vw" width={900} />
          </div>
        ))}
      </div>
      {hasText(caption) || link ? (
        <div className="container-content flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          {hasText(caption) ? (
            <p
              className="-rotate-2 font-accent text-note text-balance text-muted-foreground"
              data-sanity={dataAttribute?.("caption")}
            >
              {caption}
            </p>
          ) : null}
          <ArrowLink button={link} dataSanity={dataAttribute?.("link")} />
        </div>
      ) : null}
    </section>
  );
}
