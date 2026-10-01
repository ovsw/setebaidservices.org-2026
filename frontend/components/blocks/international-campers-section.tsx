import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { getSafeLinkHref } from "@/lib/safe-href";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import InternationalCampersGlobe from "./international-campers-globe";
import styles from "./international-campers-section.module.css";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type InternationalCampersSectionProps = Extract<
  PageBlock,
  { _type: "internationalCampersSection" }
> & {
  dataAttribute?: (path: string) => string | undefined;
};

/** Route data: fixed in code per issue spec. */
export const routes = [
  { code: "YYZ", city: "Toronto", country: "Canada", lat: 43.68, lng: -79.63, km: 364, pickup: true as const },
  { code: "JFK", city: "New York", country: "United States", lat: 40.64, lng: -73.78, km: 862, pickup: false as const },
  { code: "MEX", city: "Mexico City", country: "Mexico", lat: 19.44, lng: -99.07, km: 3512, pickup: false as const },
  { code: "GRU", city: "Sao Paulo", country: "Brazil", lat: -23.44, lng: -46.47, km: 8521, pickup: false as const },
  { code: "LHR", city: "London", country: "United Kingdom", lat: 51.47, lng: -0.45, km: 5513, pickup: false as const },
  { code: "CDG", city: "Paris", country: "France", lat: 49.01, lng: 2.55, km: 5834, pickup: false as const },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", lat: 22.31, lng: 113.91, km: 12188, pickup: false as const },
  { code: "NRT", city: "Tokyo", country: "Japan", lat: 35.77, lng: 140.39, km: 9973, pickup: false as const },
  { code: "SYD", city: "Sydney", country: "Australia", lat: -33.95, lng: 151.18, km: 15534, pickup: false as const },
] as const;

/** Adventure Island destination coordinates. */
export const destination = { lat: 46.94, lng: -80.05 } as const;

/** Heading rich text: italic gets the handwritten amber accent. */
const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="block font-accent text-[clamp(2.625rem,5vw,4.25rem)] font-semibold not-italic leading-none text-campfire-amber">
        {children}
      </em>
    ),
  },
};

export default function InternationalCampersSection({
  _key,
  dataAttribute,
  description,
  eyebrow,
  heading,
  link,
  linkLabel,
}: InternationalCampersSectionProps) {
  const cleanEyebrow = stegaClean(eyebrow)?.trim();
  const cleanDescription = stegaClean(description)?.trim();
  const cleanLinkLabel = stegaClean(linkLabel)?.trim();
  const href = getSafeLinkHref(link?.href);

  if (!cleanEyebrow || !heading || !cleanDescription) return null;

  const headingId = `international-campers-${stegaClean(_key)}`;

  return (
    <section
      aria-labelledby={headingId}
      className="relative overflow-hidden bg-pine-night text-birch-bark"
      id={`international-${stegaClean(_key)}`}
    >
      {/* Subtle green radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_circle_at_72%_52%,rgba(82,112,51,.28),transparent_70%)]" />

      <div className="container-content relative py-section">
        {/* Row 1: Eyebrow + Heading | Description + Link */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-[70px]">
          <div>
            <p
              className={`text-eyebrow mb-5 text-campfire-amber ${styles.reveal}`}
              data-sanity={dataAttribute?.("eyebrow")}
            >
              {eyebrow}
            </p>

            <h2
              className={`font-display text-display-page font-extrabold leading-[1.02] tracking-tight text-birch-bark ${styles.reveal}`}
              data-sanity={dataAttribute?.("heading")}
              id={headingId}
            >
              <PortableText components={headingComponents} value={heading} />
            </h2>
          </div>

          <div className="lg:flex lg:flex-col lg:justify-end">
            <p
              className={`max-w-[500px] text-[17px] leading-relaxed text-birch-bark/75 ${styles.reveal}`}
              data-sanity={dataAttribute?.("description")}
            >
              {description}
            </p>

            {href && cleanLinkLabel && (
              <Link
                className={`mt-6 inline-flex w-auto self-start items-center gap-2 rounded-pill border border-dashed border-birch-bark/35 px-5 py-3 text-sm font-semibold text-birch-bark/65 transition-colors hover:border-campfire-amber hover:text-campfire-amber focus-ring motion-reduce:transition-none ${styles.reveal}`}
                data-sanity={dataAttribute?.("linkLabel")}
                href={href}
                {...(stegaClean(link?.openInNewTab) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {linkLabel}
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17 17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            )}
          </div>
        </div>

        {/* Row 2: Route List | Globe */}
        <div className="mt-12 lg:mt-16">
          <InternationalCampersGlobe routes={routes} destination={destination}>
            <div className={styles.reveal}>
              {/* List header */}
              <div className="-mx-3.5 flex items-center gap-[9px] border-b border-birch-bark/[.22] px-3.5 pb-3">
                <span className="h-[7px] w-[7px] rounded-full bg-campfire-amber" />
                <span className="font-mono text-[14px] leading-snug font-medium tracking-[.01em] text-birch-bark/75">
                  Campers join us from
                </span>
              </div>

              {/* City rows */}
              <div role="list" aria-label="Camper origin cities">
                {routes.map((route) => (
                  <div key={route.code} role="listitem">
                  <button
                    type="button"
                    data-route={route.code}
                    className={`group flex w-full items-center gap-4 border-b border-dashed border-birch-bark/[.13] px-3.5 py-3 -mx-3.5 transition-colors hover:bg-birch-bark/[.06] focus-visible:outline-2 focus-visible:outline-campfire-amber focus-visible:outline-offset-[-2px] ${styles.routeRow}`}
                    aria-label={`${route.city}, ${route.country}${route.pickup ? " - pickup hub" : ""}`}
                  >
                    {/* Airport code badge */}
                    <span className={`shrink-0 rounded-lg border px-0 py-1.5 text-center font-mono text-[14px] font-bold tracking-[.01em] w-[58px] transition-colors ${
                      route.pickup
                        ? "border-campfire-amber/60 bg-campfire-amber/15 text-campfire-amber"
                        : "border-birch-bark/20 bg-birch-bark/[.06] text-birch-bark/70 group-hover:border-birch-bark/40"
                    }`}>
                      {route.code}
                    </span>

                    {/* City + country */}
                    <span className="flex min-w-0 items-baseline gap-2.5 flex-wrap">
                      <span className="font-display text-[18.5px] font-bold text-birch-bark">
                        {route.city}
                      </span>
                      <span className="text-[14px] leading-snug text-birch-bark/75">
                        {route.country}
                      </span>
                    </span>

                    {/* EN ROUTE indicator - hidden when list is narrow */}
                    <span className={`ml-auto font-mono text-[14px] leading-snug font-medium tracking-[.01em] text-campfire-amber opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${styles.enRouteLabel}`}>
                      EN ROUTE ✦
                    </span>
                  </button>
                  </div>
                ))}
              </div>
            </div>
          </InternationalCampersGlobe>
        </div>
      </div>
    </section>
  );
}
