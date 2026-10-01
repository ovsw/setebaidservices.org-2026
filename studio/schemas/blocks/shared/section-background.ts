import { defineField, defineType } from "sanity";

export const SECTION_BACKGROUNDS = [
  { title: "White", value: "white" },
  { title: "Cream", value: "cream" },
  { title: "Green", value: "green" },
] as const;

type SectionBackground = (typeof SECTION_BACKGROUNDS)[number]["value"];

function isLastSection(value: unknown, document: unknown, parent: unknown) {
  if (!document || typeof document !== "object" || !parent || typeof parent !== "object") {
    return false;
  }

  const blocks = (document as { blocks?: unknown }).blocks;
  const key = (parent as { _key?: unknown })._key;
  if (!Array.isArray(blocks) || typeof key !== "string") return false;

  const lastBlock = blocks.at(-1);
  return (
    !!lastBlock &&
    typeof lastBlock === "object" &&
    (lastBlock as { _key?: unknown })._key === key &&
    value === "green"
  );
}

export const sectionBackgroundField = defineField({
  name: "background",
  title: "Background",
  type: "sectionBackground",
  description: "Choose the field behind this section. The final section before the footer cannot be green.",
  initialValue: "white",
  validation: (rule) =>
    rule.custom((value, context) =>
      isLastSection(value, context.document, context.parent)
        ? "Choose White or Cream for the final section above the footer."
        : true,
    ),
});

export const sectionBackground = defineType({
  name: "sectionBackground",
  title: "Section Background",
  type: "string",
  options: { list: [...SECTION_BACKGROUNDS] },
  initialValue: "white" satisfies SectionBackground,
});
