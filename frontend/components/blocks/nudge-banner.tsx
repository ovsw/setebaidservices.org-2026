import { sectionThemeClass } from "./section-theme";
import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import styles from "./cta-banner.module.css";
import { CtaButtons } from "./cta-buttons";
import type { PageButtonContext } from "./section-parts";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type NudgeBannerProps = Extract<PageBlock, { _type: "nudgeBanner" }> &
  PageButtonContext & {
    dataAttribute?: (path: string) => string | undefined;
  };

/*
 * In-page nudge: a quiet card between sections for "not sure yet?" moments.
 * The card takes the surface one step off its field (cream on white, white
 * on cream, Forest Panel on green) and a hairline divides copy from action on
 * desktop. Uses the section rhythm and tucks like every other section.
 * Buttons stack on phones. Reveals on scroll; reduced motion skips it.
 */
export default function NudgeBanner({
  _key,
  background,
  buttons,
  dataAttribute,
  description,
  giving,
  title,
}: NudgeBannerProps) {
  if (!title) return null;

  const cleanKey = stegaClean(_key);
  const titleId = `cta-banner-${cleanKey}-title`;
  const cleanDescription = stegaClean(description)?.trim();
  const theme = background ?? "white";

  return (
    <section
      aria-labelledby={titleId}
      className={`${sectionThemeClass(theme)} py-section`}
      id={`cta-banner-${cleanKey}`}
    >
      <div className="container-content">
        <div
          className={cn(
            // A flat card fill from the field, no outline (DESIGN.md § Elevation).
            "grid gap-7 rounded-xl bg-card px-6 py-7 text-card-foreground sm:px-[38px] sm:py-[34px] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-0",
            styles.reveal,
          )}
        >
          <div className="grid gap-3 lg:pr-12">
            <h2
              className="text-balance font-display text-title-lg leading-[1.05] tracking-[-0.02em] font-extrabold sm:text-[34px]"
              data-sanity={dataAttribute?.("title")}
              id={titleId}
            >
              {title}
            </h2>
            {cleanDescription ? (
              <p
                className="max-w-[36rem] text-pretty text-[17px]/[1.6] opacity-75"
                data-sanity={dataAttribute?.("description")}
              >
                {description}
              </p>
            ) : null}
          </div>
          <div className="border-current/15 lg:border-l lg:pl-12">
            <CtaButtons
              buttons={buttons}
              dataAttribute={dataAttribute}
              giving={giving}
              onDark={theme === "green"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
