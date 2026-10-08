import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { DIRECTOR_HASH } from "@/lib/ask-about-camp";
import { stegaClean } from "next-sanity";
import { AskAboutCampFields } from "./ask-about-camp-fields";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type AskAboutCampFormProps = Extract<PageBlock, { _type: "askAboutCampForm" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/** One per page (the Studio enforces it), so its anchors are fixed. */
export default function AskAboutCampForm({
  background,
  dataAttribute,
  directorTopic,
  errorMessage,
  intro,
  officePhone,
  privacyLine,
  successMessage,
  title,
  topics,
}: AskAboutCampFormProps) {
  if (!title) return null;

  const director = stegaClean(directorTopic)?.trim() || "Talk with the camp director";
  const choices = (topics ?? []).flatMap((topic) => {
    const value = stegaClean(topic)?.trim();
    return value && value !== director ? [{ label: topic, value }] : [];
  });

  return (
    <section
      aria-labelledby="ask-about-camp-title"
      className={`${sectionThemeClass(background)} relative py-section`}
      id="ask-about-camp"
    >
      {/* The "Talk to the director" link lands here; the form ticks that choice. */}
      <span className="absolute top-0 scroll-mt-28" id={DIRECTOR_HASH.slice(1)} />
      <div className="container-content">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <header className="lg:pt-4">
            <h2
              className="text-headline font-display font-extrabold text-balance"
              data-sanity={dataAttribute?.("title")}
              id="ask-about-camp-title"
            >
              {title}
            </h2>
            {intro ? (
              <p
                className="mt-5 max-w-[34rem] text-pretty text-base/[1.6] text-muted-foreground sm:text-lg/[1.6]"
                data-sanity={dataAttribute?.("intro")}
              >
                {intro}
              </p>
            ) : null}
          </header>
          <AskAboutCampFields
            choices={choices}
            director={{ label: directorTopic ?? director, value: director }}
            editing={{
              errorMessage: dataAttribute?.("errorMessage"),
              privacyLine: dataAttribute?.("privacyLine"),
              successMessage: dataAttribute?.("successMessage"),
              topics: dataAttribute?.("topics"),
            }}
            errorMessage={errorMessage ?? ""}
            officePhone={stegaClean(officePhone)?.trim() || undefined}
            privacyLine={privacyLine ?? ""}
            successMessage={successMessage ?? ""}
          />
        </div>
      </div>
    </section>
  );
}
