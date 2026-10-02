import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import { BodyText, type DataAttribute } from "./section-parts";
import { sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type WordSwapProps = Extract<PageBlock, { _type: "wordSwap" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Word Swap (prototype "Name story"): a display-size word crossed out in
 * marigold, the word that replaces it below, and a hand-drawn arrow curling
 * from one to the other. The paragraph sits beside it.
 */
export default function WordSwap({
  _key,
  background,
  body,
  dataAttribute,
  struckWord,
  word,
}: WordSwapProps) {
  if (!struckWord || !word) return null;

  const headingId = `word-swap-${stegaClean(_key)}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(background))}
    >
      <div className="container-content grid items-center gap-10 md:grid-cols-2 md:gap-12">
        <h2
          className="relative flex w-max max-w-full flex-col gap-2 text-display-hero"
          id={headingId}
        >
          <svg
            aria-hidden="true"
            className="absolute top-[0.42em] left-full ml-[0.12em] h-[0.82em] w-[0.62em] overflow-visible text-highlight"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            viewBox="0 0 60 80"
          >
            <path d="M4 6 C 40 2, 58 30, 46 52 C 40 63, 28 69, 12 71" />
            <path d="M24 60 L11 71 L25 79" />
          </svg>
          <del
            className="text-muted-foreground no-underline line-through decoration-highlight opacity-70 [text-decoration-thickness:0.075em]"
            data-sanity={dataAttribute?.("struckWord")}
          >
            {struckWord}
          </del>
          <span data-sanity={dataAttribute?.("word")}>{word}</span>
        </h2>
        <div
          className="grid max-w-[44ch] gap-4 text-lead text-muted-foreground"
          data-sanity={dataAttribute?.("body")}
        >
          <BodyText value={body} />
        </div>
      </div>
    </section>
  );
}
