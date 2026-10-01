import { sectionThemeClass } from "./section-theme";
import { cn } from "@/lib/utils";
import { getSafeLinkHref } from "@/lib/safe-href";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { ArrowRight, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import ActivityCatalogueJumpBar from "./activity-catalogue-jump-bar";
import styles from "./activity-catalogue.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ActivityCatalogueBlock = Extract<PageBlock, { _type: "activityCatalogue" }>;
type CatalogueGroup = NonNullable<ActivityCatalogueBlock["groups"]>[number];
type CatalogueActivity = NonNullable<CatalogueGroup["activities"]>[number];

type ActivityCatalogueProps = ActivityCatalogueBlock & {
  dataAttribute?: (path: string) => string | undefined;
  activityDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
};

/*
 * Activity Catalogue — every activity as a photo card, grouped by where it
 * happens on the island.
 *
 * Pine Night field (the darkest, like the facilities map it shares its
 * place-vocabulary with). A sticky jump bar of place chips, then each place as
 * a numbered header, a card grid (four across on desktop, two on phones), and
 * one parent line in the quiet register. Cards are Forest Panel slabs, flat at
 * rest, lifting on hover. Amber is spent on the eyebrow, the script phrase,
 * and the current chip only.
 */

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent not-italic text-[var(--section-accent)]">{children}</em>
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

function ActivityCard({
  activity,
  activityDataAttribute,
  referenceDataAttribute,
}: Readonly<{
  activity: CatalogueActivity & { _id: string };
  activityDataAttribute?: ActivityCatalogueProps["activityDataAttribute"];
  referenceDataAttribute?: string;
}>) {
  const title = stegaClean(activity.title)?.trim();
  const line = stegaClean(activity.line)?.trim();
  const programHref = getSafeLinkHref(activity.programHref);
  const programTitle = stegaClean(activity.programTitle)?.trim();
  const image = activity.image?.asset?._id ? activity.image : null;

  return (
    <li
      className="group/card min-w-0"
      data-sanity={referenceDataAttribute}
    >
      <div className={cn("flex h-full flex-col overflow-hidden rounded-lg border bg-forest-panel", styles.card)}>
      <div
        className="relative aspect-[4/3] overflow-hidden bg-forest-floor"
        data-sanity={activityDataAttribute?.(activity._id, "image")}
      >
        {image ? (
          <Image
            alt={stegaClean(image.alt) || ""}
            blurDataURL={image.asset?.metadata?.lqip || undefined}
            className="object-cover saturate-[.94] transition-[scale,filter] duration-1000 ease-reveal group-hover/card:scale-[1.06] group-hover/card:saturate-100 motion-reduce:transition-none"
            fill
            placeholder={image.asset?.metadata?.lqip ? "blur" : undefined}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            src={urlFor(image).width(800).height(600).fit("crop").url()}
            style={
              image.hotspot?.x != null && image.hotspot.y != null
                ? {
                    objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`,
                  }
                : undefined
            }
          />
        ) : (
          /* Marked placeholder: an editor can see at a glance which cards
             still need a photo. Never an empty or broken image. */
          <div
            aria-label="Photo to come"
            className="absolute inset-0 grid place-items-center border-b border-dotted border-birch-bark/18 text-birch-bark/60"
            role="img"
          >
            <span className="flex flex-col items-center gap-2">
              <Camera aria-hidden="true" className="size-6" strokeWidth={1.5} />
              <span className="text-label">Photo to come</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-5 pt-4.5 pb-5">
        <h4
          className="font-display text-[17px] font-bold leading-tight tracking-[-0.01em] text-birch-bark sm:text-xl"
          data-sanity={activityDataAttribute?.(activity._id, "title")}
        >
          {title}
        </h4>
        {line ? (
          <p
            className="text-pretty text-[15px] leading-[1.5] text-birch-bark/70"
            data-sanity={activityDataAttribute?.(activity._id, "line")}
          >
            {line}
          </p>
        ) : null}

        {programHref ? (
          <div className="mt-auto pt-2">
            <Link
              className="focus-ring inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-sunlit-moss underline-offset-[0.2em] transition-colors motion-base hover:text-birch-bark hover:underline"
              data-sanity={activityDataAttribute?.(activity._id, "program")}
              href={programHref}
            >
              Specialty program
              {programTitle ? <span className="sr-only">: {programTitle}</span> : null}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover/card:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        ) : null}
      </div>
      </div>
    </li>
  );
}

export default function ActivityCatalogue({
  _key,
  background,
  activityDataAttribute,
  dataAttribute,
  eyebrow,
  groups,
  heading,
  intro,
}: ActivityCatalogueProps) {
  const cleanKey = stegaClean(_key);
  const sectionId = `activity-catalogue-${cleanKey}`;
  const headingId = `${sectionId}-title`;

  const places = (groups ?? []).flatMap((group) => {
    const title = stegaClean(group.title)?.trim();
    const activities = (group.activities ?? []).flatMap((activity) =>
      activity._id && hasText(activity.title)
        ? [activity as CatalogueActivity & { _id: string }]
        : [],
    );
    if (!title || !activities.length) return [];
    return [
      {
        activities,
        group,
        id: `${sectionId}-${stegaClean(group._key)}`,
        title,
      },
    ];
  });

  if (!heading?.length || !places.length) return null;

  return (
    <section
      aria-labelledby={headingId}
      className={`${sectionThemeClass(background ?? "green")} py-section`}
      id={sectionId}
    >
      <div className="container-content">
        <header className={cn("mb-10 max-w-3xl lg:mb-14", styles.reveal)}>
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
            data-sanity={dataAttribute?.("heading")}
            id={headingId}
          >
            <PortableText components={headingComponents} value={heading} />
          </h2>
          {hasText(intro) ? (
            <p
              className="mt-5 max-w-xl text-pretty text-lg/relaxed opacity-80"
              data-sanity={dataAttribute?.("intro")}
            >
              {intro}
            </p>
          ) : null}
        </header>

        <ActivityCatalogueJumpBar
          dataSanity={dataAttribute?.("groups")}
          groups={places.map(({ id, title }) => ({ id, title }))}
        />

        <div className="grid gap-16 pt-12 lg:gap-24 lg:pt-16">
          {places.map(({ activities, group, id, title }, index) => {
            const groupPath = `groups[_key=="${group._key}"]`;
            const groupHeadingId = `${id}-title`;
            const number = String(index + 1).padStart(2, "0");

            return (
              <section
                aria-labelledby={groupHeadingId}
                className={cn(
                  "scroll-mt-[calc(var(--site-header-offset,0px)+5.5rem)]",
                  styles.reveal,
                )}
                id={id}
                key={group._key}
              >
                <header className="mb-6 grid gap-3 lg:mb-8 lg:grid-cols-12 lg:items-end">
                  <div className="lg:col-span-7">
                    <p className="mb-3 text-label opacity-80">
                      <span aria-hidden="true">{number}</span>
                      <span className="sr-only">Place {index + 1}.</span>
                      {" · "}
                      {activities.length}{" "}
                      {activities.length === 1 ? "activity" : "activities"}
                    </p>
                    <h3
                      className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl"
                      data-sanity={dataAttribute?.(`${groupPath}.title`)}
                      id={groupHeadingId}
                    >
                      {title}
                    </h3>
                  </div>
                  {hasText(group.blurb) ? (
                    <p
                      className="text-pretty text-base/relaxed opacity-80 lg:col-span-5 lg:pb-1"
                      data-sanity={dataAttribute?.(`${groupPath}.blurb`)}
                    >
                      {group.blurb}
                    </p>
                  ) : null}
                </header>

                <ul
                  className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 lg:grid-cols-4"
                  data-sanity={dataAttribute?.(`${groupPath}.activities`)}
                >
                  {activities.map((activity) => (
                    <ActivityCard
                      activity={activity}
                      activityDataAttribute={activityDataAttribute}
                      key={activity._key}
                      referenceDataAttribute={dataAttribute?.(
                        `${groupPath}.activities[_key=="${activity._key}"]`,
                      )}
                    />
                  ))}
                </ul>


              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
