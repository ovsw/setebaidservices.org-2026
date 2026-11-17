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

type CtaBannerProps = Extract<PageBlock, { _type: "ctaBanner" }> &
  PageButtonContext & {
    dataAttribute?: (path: string) => string | undefined;
  };

/*
 * Call to Action, closing band: the last thing before the footer. Forest
 * Floor field with rounded top corners tucked under the section above,
 * headline left, the two actions right, one amber primary and one ghost.
 * Uses the section rhythm and tucks like every other section. Buttons stack
 * on phones. Reveals on scroll; reduced motion skips it.
 */
export default function CtaBanner({
  _key,
  background,
  buttons,
  dataAttribute,
  description,
  giving,
  title,
}: CtaBannerProps) {
  if (!title) return null;

  const cleanKey = stegaClean(_key);
  const titleId = `cta-banner-${cleanKey}-title`;
  const cleanDescription = stegaClean(description)?.trim();
  const theme = background ?? "green";

  return (
    <section
      aria-labelledby={titleId}
      className={cn("py-section", sectionThemeClass(theme))}
      id={`cta-banner-${cleanKey}`}
    >
      <div
        className={cn(
          "container-content grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-14",
          styles.reveal,
        )}
      >
        <div className="lg:col-span-8">
          <h2
            className="max-w-3xl text-balance font-display text-headline"
            data-sanity={dataAttribute?.("title")}
            id={titleId}
          >
            {title}
          </h2>
          {cleanDescription ? (
            <p
              className="mt-6 max-w-xl text-pretty text-lg/relaxed opacity-80"
              data-sanity={dataAttribute?.("description")}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className="lg:col-span-4 lg:flex lg:justify-end">
          <CtaButtons
            buttons={buttons}
            dataAttribute={dataAttribute}
            giving={giving}
            onDark={theme === "green"}
          />
        </div>
      </div>
    </section>
  );
}
