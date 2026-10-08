"use client";

import type { ReactNode } from "react";
import { useOptimistic } from "next-sanity/hooks";

export type FooterMarkLogoItem = Readonly<{
  key: string;
  dataSanity?: string;
  node: ReactNode;
}>;

type FooterDocument = { logos?: Array<{ _key?: string | null } | null> | null };

/**
 * The row of affiliation and historic marks. Each item points at its array
 * entry, so editors can drag the marks into a new order in Presentation. The
 * optimistic order shows a drop at once instead of snapping back until the
 * saved footer is fetched again. Outside Presentation it renders `items` as is.
 */
export function FooterMarkLogos({
  dataSanity,
  items,
}: {
  dataSanity?: string;
  items: readonly FooterMarkLogoItem[];
}) {
  const ordered = useOptimistic<readonly FooterMarkLogoItem[], FooterDocument>(
    items,
    (state, action) => {
      if (action.id !== "footer" || !action.document.logos) return state;
      // The site lockup is not in this row, and a new logo has no rendered
      // node yet; both resolve when the saved footer arrives.
      const byKey = new Map(state.map((item) => [item.key, item]));
      return action.document.logos.flatMap((logo) => {
        const item = logo?._key ? byKey.get(logo._key) : undefined;
        return item ? [item] : [];
      });
    },
  );

  return (
    <ul
      aria-label="Affiliations and history"
      className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 border-b border-birch-bark/15 py-10 tablet:justify-between"
      data-sanity={dataSanity}
    >
      {ordered.map((item) => (
        <li data-sanity={item.dataSanity} key={item.key}>
          {item.node}
        </li>
      ))}
    </ul>
  );
}
