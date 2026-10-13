import type { Path } from "sanity";

/** Whether the Feature Cards section that holds the field at `path` is tilted. */
export function isTiltedSection(document: unknown, path: Path | undefined) {
  const sectionKey = (path?.[1] as { _key?: string } | undefined)?._key;
  const blocks = (document as { blocks?: { _key?: string; layout?: string }[] } | undefined)
    ?.blocks;
  return blocks?.find((block) => block._key === sectionKey)?.layout === "tilted";
}

/**
 * Whether `path` points inside a card's Link in a tilted Feature Cards section.
 * The tilted layout hides that Link, and Studio still validates hidden fields,
 * so leftover link data would raise errors that no editor can reach.
 */
export function isInHiddenCardLink(document: unknown, path: Path | undefined) {
  if (!path) return false;
  const inCardLink = path.some(
    (segment, index) => segment === "cards" && path[index + 2] === "link",
  );
  return inCardLink && isTiltedSection(document, path);
}
