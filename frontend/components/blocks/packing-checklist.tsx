import PackingChecklistList, {
  type ChecklistGroup,
} from "@/components/blocks/packing-checklist-list";
import { createCustomLinkMarkRenderer } from "@/components/portable-text/custom-link-mark";
import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import {
  PortableText,
  toPlainText,
  type PortableTextComponents,
} from "@portabletext/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { stegaClean } from "next-sanity";
import styles from "./packing-checklist.module.css";
import { sectionThemeClass } from "./section-theme";

/*
 * Packing checklist: the kit list as a tick-off list, written to the camper.
 *
 * Pine Night field so it can sit between a cream section and a Forest Floor
 * one. Desktop: intro and note side by side, then the toolbar, then group
 * cards in three columns, then the PDF link. Phones: everything in one
 * column; the toolbar stays under the intro, groups collapse.
 *
 * Ticks and printing live in the client half (PackingChecklistList). This
 * file flattens the Sanity shape into plain data so the client component
 * never receives a function prop.
 */

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type PackingChecklistProps = Extract<PageBlock, { _type: "packingChecklist" }> & {
  dataAttribute?: (path: string) => string | undefined;
};

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => (
      <em className="font-accent text-[var(--section-accent)] not-italic">{children}</em>
    ),
  },
};

const noteComponents: PortableTextComponents = {
  ...simpleRichTextComponents,
  marks: {
    ...simpleRichTextComponents?.marks,
    customLink: createCustomLinkMarkRenderer(
      "font-medium text-current underline decoration-current/40 underline-offset-4 hover:decoration-current",
    ),
  },
};

function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

/**
 * Groups the renderer can show: a title and at least one labelled item. A
 * half-filled group never renders as an empty card.
 */
export function getRenderableGroups(
  groups: PackingChecklistProps["groups"],
  dataAttribute?: PackingChecklistProps["dataAttribute"],
): ChecklistGroup[] {
  return (groups ?? []).flatMap((group) => {
    if (!group?._key || !hasText(group.title)) return [];
    const groupPath = `groups[_key=="${group._key}"]`;
    const items = (group.items ?? []).flatMap((item) => {
      if (!item?._key || !hasText(item.label)) return [];
      return [
        {
          key: stegaClean(item._key),
          label: item.label as string,
          quantity: hasText(item.quantity) ? (item.quantity as string) : null,
          sanity: dataAttribute?.(`${groupPath}.items[_key=="${item._key}"]`),
        },
      ];
    });
    if (!items.length) return [];
    return [
      {
        key: stegaClean(group._key),
        title: group.title as string,
        tone: stegaClean(group.tone) === "leaveAtHome" ? "leaveAtHome" : "normal",
        items,
        sanity: {
          title: dataAttribute?.(`${groupPath}.title`),
          items: dataAttribute?.(`${groupPath}.items`),
        },
      } satisfies ChecklistGroup,
    ];
  });
}

export default function PackingChecklist({
  _key,
  background,
  dataAttribute,
  eyebrow,
  groups,
  image,
  intro,
  note,
  pdf,
  title,
}: PackingChecklistProps) {
  const renderableGroups = getRenderableGroups(groups, dataAttribute);
  if (!title?.length || !renderableGroups.length) return null;

  const sectionKey = stegaClean(_key);
  const sectionId = `packing-checklist-${sectionKey}`;
  const headingId = `${sectionId}-title`;
  const hasNote = Boolean(note?.length && hasText(toPlainText(note)));
  const hasImage = Boolean(image?.asset?._id);
  const imageAlt = stegaClean(image?.alt)?.trim() ?? "";
  const pdfHref = getSafeLinkHref(pdf?.url);
  const pdfName = stegaClean(pdf?.originalFilename)?.trim();

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(background), styles.section)}
      id={sectionId}
    >
      <div className={cn("container-content", styles.inner)}>
        <div
          className={cn(
            "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-end lg:gap-16",
            styles.header,
          )}
        >
          <header className="max-w-[38rem]">
            {hasText(eyebrow) ? (
              <p
                className="mb-5 text-eyebrow text-[var(--section-accent)]"
                data-sanity={dataAttribute?.("eyebrow")}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={cn("text-balance font-display text-headline", styles.heading)}
              data-sanity={dataAttribute?.("title")}
              id={headingId}
            >
              <PortableText components={headingComponents} value={title} />
            </h2>
            {hasText(intro) ? (
              <p
              className="mt-6 max-w-[34rem] text-pretty text-[17px] leading-[1.6] text-current/75"
                data-sanity={dataAttribute?.("intro")}
              >
                {intro}
              </p>
            ) : null}
          </header>

          {hasNote || hasImage ? (
            <aside
              aria-label="Before you pack"
              className={cn(
                "grid gap-5 rounded-xl border border-birch-bark/12 bg-forest-panel p-2",
                styles.aside,
              )}
            >
              {hasImage && image ? (
                <figure
                  className="relative aspect-[16/10] overflow-hidden rounded-lg bg-forest-floor"
                  data-sanity={dataAttribute?.("image")}
                >
                  <Image
                    alt={imageAlt}
                    blurDataURL={image.asset?.metadata?.lqip || undefined}
                    className="object-cover"
                    fill
                    placeholder={image.asset?.metadata?.lqip ? "blur" : undefined}
                    sizes="(min-width: 1024px) 34vw, 100vw"
                    src={urlFor(image).width(1200).height(750).url()}
                  />
                </figure>
              ) : null}
              {hasNote ? (
                <div
                  className="grid gap-3 px-5 pb-5 pt-3 text-[15px] leading-[1.55] text-birch-bark/80 [&_strong]:text-birch-bark"
                  data-sanity={dataAttribute?.("note")}
                >
                  <PortableText components={noteComponents} value={note} />
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>

        <div className="mt-10 lg:mt-14">
          <PackingChecklistList
            groups={renderableGroups}
            sanity={{ groups: dataAttribute?.("groups") }}
            sectionId={sectionId}
          />
        </div>

        {pdfHref ? (
          <p className={cn("mt-8", styles.pdf)} data-sanity={dataAttribute?.("pdf")}>
            <a
              className="focus-ring inline-flex items-center gap-2 font-semibold text-current underline decoration-current/40 underline-offset-4 hover:decoration-current"
              download={pdfName || undefined}
              href={pdfHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              Download the list as a PDF
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
