import type { StringRule } from "sanity";

/**
 * A required string that must hold more than spaces. Renderers trim text
 * before they draw it, so a field of spaces would hide its section or item
 * while Studio still let the page publish.
 */
export function requiredText(rule: StringRule, message: string) {
  return rule
    .required()
    .custom((value) => (typeof value === "string" && !value.trim() ? message : true))
    .error(message);
}
