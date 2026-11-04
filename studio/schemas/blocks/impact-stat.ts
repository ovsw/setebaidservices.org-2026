import { defineArrayMember, defineField } from "sanity";

/**
 * One number with its label, shared by Impact Numbers and Impact Spotlight:
 * "48" + "of 50" + "families paid a reduced price". The office types the
 * value as text, so "About 50", "90%+" and "$3,700" all work without a
 * format rule.
 */
export const impactStat = defineArrayMember({
  name: "impactStat",
  title: "Number",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Number",
      type: "string",
      description: 'The big figure, as text: "50", "48", "90%+", "$3,700".',
      validation: (rule) => rule.required().max(12),
    }),
    defineField({
      name: "detail",
      title: "Detail",
      type: "string",
      description: 'Optional. A few small words right after the figure: "of 50".',
      validation: (rule) => rule.max(24),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'What the number counts: "campers came to camp".',
      validation: (rule) => rule.required().max(90),
    }),
  ],
  preview: {
    select: { detail: "detail", label: "label", value: "value" },
    prepare: ({ detail, label, value }) => ({
      title: [value, detail].filter(Boolean).join(" ") || "Untitled number",
      subtitle: label,
    }),
  },
});

export const richTextToPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const children = (block as { children?: Array<{ text?: string }> }).children;
      return Array.isArray(children) ? children.map((child) => child.text ?? "").join("") : "";
    })
    .join(" ")
    .trim();
};
