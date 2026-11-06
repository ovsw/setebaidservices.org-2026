import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import { ParentsGuideFields } from "./parents-guide-fields";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type ParentsGuideFormProps = Extract<PageBlock, { _type: "parentsGuideForm" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/** One per page (the Studio enforces it), so its anchor is fixed. */
export default function ParentsGuideForm({
  background,
  dataAttribute,
  errorMessage,
  intro,
  officePhone,
  privacyLine,
  successMessage,
  title,
}: ParentsGuideFormProps) {
  if (!title) return null;

  return (
    <section
      aria-labelledby="parents-guide-form-title"
      className={`${sectionThemeClass(background)} py-section`}
      id="parents-guide-form"
    >
      <div className="container-content">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
          <header className="lg:pt-4">
            <h2
              className="text-headline font-display font-extrabold text-balance"
              data-sanity={dataAttribute?.("title")}
              id="parents-guide-form-title"
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
          <ParentsGuideFields
            editing={{
              errorMessage: dataAttribute?.("errorMessage"),
              privacyLine: dataAttribute?.("privacyLine"),
              successMessage: dataAttribute?.("successMessage"),
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
