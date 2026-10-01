import { sectionThemeClass } from "./section-theme";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import ActivityScheduleBuilder from "./activity-schedule-builder";
import styles from "./activity-schedule.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ActivityScheduleProps = Extract<
  PageBlock,
  { _type: "activitySchedule" }
> & {
  dataAttribute?: (path: string) => string | undefined;
  activityDataAttribute?: (
    documentId: string,
    path: string,
  ) => string | undefined;
};

/** Heading rich text: italic drops to its own handwritten amber line. */
const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="mt-2 block font-accent text-[clamp(2.125rem,3vw,3.4rem)] font-semibold not-italic leading-none text-[var(--section-accent)]">
        {children}
      </em>
    ),
  },
};

/** Flatten the rich-text heading for the activity count's accessible label. */
const headingToPlainText = (
  heading: ActivityScheduleProps["heading"],
): string =>
  stegaClean(
    (heading ?? [])
      .map((block) =>
        (block.children ?? []).map((child) => child.text ?? "").join(""),
      )
      .join(" "),
  ).trim();

export default function ActivitySchedule({
  _key,
  background,
  activityCount,
  activityDataAttribute,
  camperNames,
  dataAttribute,
  description,
  featuredActivities,
  heading,
}: ActivityScheduleProps) {
  const plainHeading = headingToPlainText(heading);
  const cleanDescription = stegaClean(description)?.trim();
  const cleanCamperNames = (camperNames ?? [])
    .map((name) => stegaClean(name)?.trim())
    .filter((name): name is string => Boolean(name));
  const activities = (featuredActivities ?? [])
    .flatMap((activity) => {
      const title = stegaClean(activity.title)?.trim();
      if (!activity._id || !activity._key || !title) return [];

      return [
        {
          _id: activity._id,
          _key: activity._key,
          title,
          titleDataAttribute: activityDataAttribute?.(activity._id, "title"),
        },
      ];
    })
    .slice(0, 18);

  if (
    !plainHeading ||
    !cleanDescription ||
    !cleanCamperNames.length ||
    activities.length < 4
  ) {
    return null;
  }

  const headingId = `activity-schedule-${stegaClean(_key)}`;
  const total = Math.max(activityCount ?? activities.length, activities.length);
  const remaining = Math.max(total - activities.length, 0);
  const activityLinkText =
    remaining > 0
      ? `+ ${remaining} more ${remaining === 1 ? "Activity" : "Activities"}`
      : "Explore all Activities";

  return (
    <section
      aria-labelledby={headingId}
      className={`${sectionThemeClass(background ?? "green")} py-section`}
      id={`activities-${stegaClean(_key)}`}
    >
      <div className="container-content">
        <div className="border-t border-current/20">
          {/* Header row: count and heading read as one line */}
          <header
            className={`flex flex-col gap-6 md:flex-row md:items-center md:gap-5 ${styles.reveal}`}
          >
            <p
              aria-label={`${total} ${plainHeading}`}
              className={styles.activityCount}
            >
              {total}
            </p>
            <h2
              className="text-balance font-display text-display-page font-extrabold"
              data-sanity={dataAttribute?.("heading")}
              id={headingId}
            >
              <PortableText components={headingComponents} value={heading} />
            </h2>
          </header>

          <ActivityScheduleBuilder
            activities={activities}
            activitiesLink={
              <Link
                className="focus-ring w-fit rounded-pill border border-dashed border-current/35 px-5 py-3 text-sm font-semibold transition-colors hover:border-campfire-amber hover:text-campfire-amber motion-reduce:transition-none"
                href="/summer-camp-activities"
                key="activities-link"
              >
                {activityLinkText}
              </Link>
            }
            camperNames={cleanCamperNames}
            camperNamesDataAttribute={dataAttribute?.("camperNames")}
            description={
              <p
                className="max-w-xl text-pretty text-lg/relaxed opacity-80"
                data-sanity={dataAttribute?.("description")}
              >
                {description}
              </p>
            }
            featuredActivitiesDataAttribute={dataAttribute?.(
              "featuredActivities",
            )}
          />
        </div>
      </div>
    </section>
  );
}
