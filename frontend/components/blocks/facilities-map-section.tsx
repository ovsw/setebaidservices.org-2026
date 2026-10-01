import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import FacilitiesMapBigTopCarousel, {
  type BigTopSlide,
} from "./facilities-map-big-top-carousel";
import FacilitiesMapBigTopMetric from "./facilities-map-big-top-metric";
import FacilitiesMapInteractive, {
  type PublicFacilityPlacement,
} from "./facilities-map-interactive";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import styles from "./facilities-map-section.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type FacilitiesMapSectionProps = Extract<
  PageBlock,
  { _type: "facilitiesMapSection" }
> & {
  dataAttribute?: (path: string) => string | undefined;
  facilityDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
  mapDataAttribute?: (path: string) => string | undefined;
};

const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
};

export default function FacilitiesMapSection({
  _key,
  bigTopArea,
  bigTopBody,
  bigTopGallery,
  bigTopGalleryAutoplay,
  bigTopHeading,
  bigTopTagline,
  bigTopUnit,
  dataAttribute,
  eyebrow,
  facilityDataAttribute,
  heading,
  introduction,
  map,
  mapDataAttribute,
  mapHeading,
  mapLocationLabel,
  showBigTop,
  stopLabel,
}: FacilitiesMapSectionProps) {
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayIntroduction = stegaClean(introduction)?.trim();
  const displayBigTopHeading = stegaClean(bigTopHeading)?.trim();
  const displayBigTopTagline = stegaClean(bigTopTagline)?.trim();
  const displayBigTopUnit = stegaClean(bigTopUnit)?.trim();
  const displayBigTopArea = stegaClean(bigTopArea);
  const displayBigTop = stegaClean(showBigTop) !== false;
  const displayMapLocationLabel =
    stegaClean(mapLocationLabel)?.trim() || "ADVENTURE ISLAND · LAKE TEMAGAMI";
  const displayStopLabel = stegaClean(stopLabel)?.trim() || "STOP";
  const sectionKey = stegaClean(_key);
  const headingId = `facilities-map-${sectionKey}-title`;
  const mapHeadingId = `facilities-map-${sectionKey}-map-title`;

  if (!displayEyebrow || !heading?.length || !displayIntroduction || !map) {
    return null;
  }

  const slides: BigTopSlide[] = (bigTopGallery ?? []).flatMap((image) => {
    const caption = stegaClean(image.caption)?.trim();
    const alt = stegaClean(image.alt)?.trim() ?? "";
    if (!image._key || !image.asset?._id || !caption) return [];
    return [
      {
        alt,
        caption,
        key: image._key,
        lqip: image.asset.metadata?.lqip || undefined,
        url: urlFor(image).width(1200).height(1200).fit("crop").url(),
      },
    ];
  });

  const placements: PublicFacilityPlacement[] = (map.placements ?? []).flatMap(
    (placement) => {
      const name = stegaClean(placement.facility?.name)?.trim();
      const description = stegaClean(placement.facility?.description)?.trim();
      const x = stegaClean(placement.x);
      const y = stegaClean(placement.y);
      if (
        !placement._key ||
        !placement.facility?._id ||
        !name ||
        !description ||
        typeof x !== "number" ||
        typeof y !== "number"
      ) {
        return [];
      }

      const labelPosition = stegaClean(placement.labelPosition);
      const featuredImage = placement.facility.featuredImage;
      const featuredImageAlt = stegaClean(featuredImage?.alt)?.trim();

      return [
        {
          description,
          descriptionDataAttribute: facilityDataAttribute?.(
            placement.facility._id,
            "description",
          ),
          featuredImage:
            featuredImage?.asset?._id
              ? {
                  alt: featuredImageAlt ?? "",
                  lqip: featuredImage.asset.metadata?.lqip || undefined,
                  url: urlFor(featuredImage)
                    .width(720)
                    .height(540)
                    .fit("crop")
                    .url(),
                }
              : undefined,
          id: placement.facility._id,
          key: placement._key,
          labelPosition:
            labelPosition === "above" ||
            labelPosition === "below" ||
            labelPosition === "left" ||
            labelPosition === "right"
              ? labelPosition
              : "auto",
          name,
          nameDataAttribute: facilityDataAttribute?.(
            placement.facility._id,
            "name",
          ),
          placementDataAttribute: mapDataAttribute?.(
            `placements[_key=="${placement._key}"]`,
          ),
          prominent: stegaClean(placement.prominent) === true,
          x,
          y,
        },
      ];
    },
  );
  const mapAlt = stegaClean(map.mapImage?.alt)?.trim() ?? "";
  const mapUrl = map.mapImage?.asset?._id
    ? urlFor(map.mapImage).width(2000).fit("max").url()
    : undefined;
  // The frame follows the image the visitor actually sees: the asset's
  // dimensions reduced by any Studio crop.
  const mapDimensions = map.mapImage?.asset?.metadata?.dimensions;
  const mapCrop = map.mapImage?.crop;
  const mapWidth = mapDimensions?.width
    ? mapDimensions.width * (1 - (mapCrop?.left ?? 0) - (mapCrop?.right ?? 0))
    : undefined;
  const mapHeight = mapDimensions?.height
    ? mapDimensions.height * (1 - (mapCrop?.top ?? 0) - (mapCrop?.bottom ?? 0))
    : undefined;
  const mapAspectRatio =
    mapWidth && mapHeight ? `${mapWidth} / ${mapHeight}` : undefined;

  return (
    <section
      aria-labelledby={headingId}
      className={`${styles.section} px-content-x py-section`}
      id={`facilities-${sectionKey}`}
    >
      <div className={styles.glow} />
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow} data-sanity={dataAttribute?.("eyebrow")}>
              {eyebrow}
            </p>
            <h2
              className={styles.title}
              data-sanity={dataAttribute?.("heading")}
              id={headingId}
            >
              <PortableText components={headingComponents} value={heading} />
            </h2>
          </div>
          <p
            className={styles.introduction}
            data-sanity={dataAttribute?.("introduction")}
          >
            {introduction}
          </p>
        </header>

        {displayBigTop &&
        displayBigTopHeading &&
        typeof displayBigTopArea === "number" &&
        displayBigTopUnit &&
        displayBigTopTagline &&
        bigTopBody?.length ? (
          <div
            className={`${styles.bigTop} ${
              slides.length ? "" : styles.bigTopWithoutGallery
            }`}
            data-sanity={dataAttribute?.("showBigTop")}
          >
            {slides.length ? (
              <FacilitiesMapBigTopCarousel
                autoplay={stegaClean(bigTopGalleryAutoplay) !== false}
                slides={slides}
              />
            ) : null}
            <div>
              <h3
                className={styles.bigTopHeading}
                data-sanity={dataAttribute?.("bigTopHeading")}
              >
                {bigTopHeading}
              </h3>
              <div data-sanity={dataAttribute?.("bigTopArea")}>
                <FacilitiesMapBigTopMetric
                  area={displayBigTopArea}
                  tagline={displayBigTopTagline}
                  unit={displayBigTopUnit}
                />
              </div>
              <div
                className={styles.bigTopBody}
                data-sanity={dataAttribute?.("bigTopBody")}
              >
                <PortableText
                  components={simpleRichTextComponents}
                  value={bigTopBody}
                />
              </div>
            </div>
          </div>
        ) : null}

        {mapHeading?.length && mapUrl && placements.length >= 2 ? (
          <div className={styles.mapSection}>
            <h3
              className={styles.mapHeading}
              data-sanity={dataAttribute?.("mapHeading")}
              id={mapHeadingId}
            >
              <PortableText components={headingComponents} value={mapHeading} />
            </h3>
            <FacilitiesMapInteractive
              mapAlt={mapAlt}
              mapAspectRatio={mapAspectRatio}
              mapDataAttribute={mapDataAttribute?.("mapImage")}
              mapLocationDataAttribute={dataAttribute?.("mapLocationLabel")}
              mapLocationLabel={displayMapLocationLabel}
              mapLqip={map.mapImage?.asset?.metadata?.lqip || undefined}
              mapUrl={mapUrl}
              placements={placements}
              stopLabel={displayStopLabel}
              stopLabelDataAttribute={dataAttribute?.("stopLabel")}
              websiteAutoplay={stegaClean(map.websiteAutoplay) !== false}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
