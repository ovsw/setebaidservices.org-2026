// Explicit extension so Node can import this module directly (one-off content
// scripts); tsconfig allows importing .ts extensions.
import { campIconArtwork } from "./camp-icon-catalog.ts";

/**
 * Two-tone icons carried over from the legacy website. They live beside the
 * Lucide set in the icon picker under a `camp:` prefix so stored names never
 * collide with Lucide names.
 */
export const CAMP_ICON_PREFIX = "camp:";

type CampIconArtworkName = keyof typeof campIconArtwork;
export type CampIconName = `${typeof CAMP_ICON_PREFIX}${CampIconArtworkName}`;

export const campIconNames = (
  Object.keys(campIconArtwork) as CampIconArtworkName[]
).map((name): CampIconName => `${CAMP_ICON_PREFIX}${name}`);

const campIconNameSet = new Set<string>(campIconNames);

export function isCampIconName(value: unknown): value is CampIconName {
  return typeof value === "string" && campIconNameSet.has(value);
}

/** Human label for the picker: `camp:book-heart` -> `book heart`. */
export function campIconLabel(name: CampIconName): string {
  return name.slice(CAMP_ICON_PREFIX.length).replaceAll("-", " ");
}

/**
 * Standalone SVG markup for a camp icon. Both shapes use currentColor; the
 * secondary shape sits at 40% opacity, which is what makes the icon two-tone.
 * The website renders this markup through a fail-closed allowlist, so keep the
 * grammar minimal: only <svg> and <path> with plain double-quoted attributes.
 */
export function campIconSvg(name: CampIconName): string {
  const artwork = campIconArtwork[name.slice(CAMP_ICON_PREFIX.length) as CampIconArtworkName];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${artwork.viewBox}" fill="currentColor" aria-hidden="true">` +
    `<path d="${artwork.secondary}" opacity=".4"></path>` +
    `<path d="${artwork.primary}"></path>` +
    `</svg>`
  );
}
