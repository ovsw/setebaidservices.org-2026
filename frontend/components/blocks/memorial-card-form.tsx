import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { stegaClean } from "next-sanity";
import { MemorialCardFields } from "./memorial-card-fields";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type MemorialCardFormProps = Extract<PageBlock, { _type: "memorialCardForm" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

/** The anchor that "Fill in the card form" links jump to. One form per page (the Studio enforces it). */
export const CARD_FORM_ID = "card-form";

export default function MemorialCardForm({
  background,
  byMailLine,
  cardDesigns,
  dataAttribute,
  errorMessage,
  givingLink,
  intro,
  messages,
  officePhone,
  privacyLine,
  successMessage,
  title,
}: MemorialCardFormProps) {
  if (!title) return null;

  const cards = (cardDesigns ?? []).flatMap((card) => {
    const value = stegaClean(card.name)?.trim();
    if (!value) return [];
    return [
      {
        key: card._key,
        label: card.name ?? value,
        value,
        // The whole card, never cropped: card fronts come in both orientations.
        imageUrl: card.image?.asset?._id ? urlFor(card.image).width(600).fit("max").url() : undefined,
      },
    ];
  });
  const presets = (messages ?? []).flatMap((message) => {
    const value = stegaClean(message)?.trim();
    return value ? [{ label: message, value }] : [];
  });

  return (
    <section
      aria-labelledby="memorial-card-form-title"
      className={`${sectionThemeClass(background)} relative py-section`}
      id={CARD_FORM_ID}
    >
      <div className="container-content">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
          <header className="lg:pt-4">
            <h2
              className="text-headline font-display font-extrabold text-balance"
              data-sanity={dataAttribute?.("title")}
              id="memorial-card-form-title"
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
          <MemorialCardFields
            byMailLine={byMailLine ?? ""}
            cards={cards}
            editing={{
              byMailLine: dataAttribute?.("byMailLine"),
              cardDesigns: dataAttribute?.("cardDesigns"),
              errorMessage: dataAttribute?.("errorMessage"),
              messages: dataAttribute?.("messages"),
              privacyLine: dataAttribute?.("privacyLine"),
              successMessage: dataAttribute?.("successMessage"),
            }}
            errorMessage={errorMessage ?? ""}
            givingLink={stegaClean(givingLink)?.trim() || undefined}
            messages={presets}
            officePhone={stegaClean(officePhone)?.trim() || undefined}
            privacyLine={privacyLine ?? ""}
            successMessage={successMessage ?? ""}
          />
        </div>
      </div>
    </section>
  );
}
