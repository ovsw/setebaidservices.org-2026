import type { ReferenceRule, ValidationContext } from "sanity";

export const HIDDEN_LINK_TARGET_WARNING =
  "This page is Hidden: the link leads to a 404 on the public Website until the page is made visible (untick Hidden on it).";

type ReferenceValue = { _ref?: string } | null | undefined;

/**
 * Warns when an internal link points at a Hidden document. The public
 * Website reads the published version, so that decides; a target that has
 * only a draft is judged by the draft.
 */
export async function checkHiddenLinkTarget(
  value: ReferenceValue,
  context: ValidationContext,
) {
  const id = value?._ref?.replace(/^drafts\./, "");
  if (!id) return true;

  const client = context
    .getClient({ apiVersion: "2026-03-23" })
    .withConfig({ perspective: "raw" });
  const hidden = await client.fetch<boolean | null>(
    `select(
      count(*[_id == $id]) > 0 => *[_id == $id][0].hidden,
      *[_id == $draftId][0].hidden
    ) == true`,
    { draftId: `drafts.${id}`, id },
  );

  return hidden ? HIDDEN_LINK_TARGET_WARNING : true;
}

/**
 * A warning, never an error: editors can prepare a link to a page that goes
 * public later. `isActive` skips a reference the link does not use, for
 * example when the editor switched the link to an external URL.
 */
export function hiddenLinkTargetWarning(
  rule: ReferenceRule,
  isActive: (context: ValidationContext) => boolean = () => true,
) {
  return rule
    .custom((value: ReferenceValue, context) =>
      isActive(context) ? checkHiddenLinkTarget(value, context) : true,
    )
    .warning();
}
