import { lucideIconNames } from "./lucide-icon-names";
import { isCampIconName, type CampIconName } from "./camp-icons";

export type CanonicalLucideIconName = (typeof lucideIconNames)[number];
export type NavigationIconName = CanonicalLucideIconName | CampIconName;

export const canonicalLucideIconNames = lucideIconNames;

const canonicalLucideIconNameSet = new Set<string>(canonicalLucideIconNames);

export function isCanonicalLucideIconName(
  value: unknown,
): value is CanonicalLucideIconName {
  return typeof value === "string" && canonicalLucideIconNameSet.has(value);
}

export function isNavigationIconName(value: unknown): value is NavigationIconName {
  return isCanonicalLucideIconName(value) || isCampIconName(value);
}
