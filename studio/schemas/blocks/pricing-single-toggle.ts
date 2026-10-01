import { Ticket } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const richTextToPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: { text?: string }[] })?.children;
      if (!Array.isArray(children)) return "";
      return children.map((child) => child?.text ?? "").join("");
    })
    .join(" ")
    .trim();
};

const option = defineArrayMember({
  name: "pricingSingleToggleOption",
  title: "Option",
  type: "object",
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: 'The toggle label, e.g. "Round trip" or "Yearly". Keep it to two or three words.',
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      name: "price",
      type: "string",
      description: 'The number as written, e.g. "$265".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unit",
      type: "string",
      description: 'Shown beside the number, e.g. "CAD, plus HST".',
    }),
    defineField({
      name: "note",
      type: "string",
      description: 'One line under the price box for this option, e.g. "Toronto or Huntsville to the dock and back".',
    }),
  ],
  preview: { select: { title: "name", subtitle: "price" } },
});

const fact = defineArrayMember({
  name: "pricingSingleToggleFact",
  title: "Fact",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: 'What the price includes, e.g. "CAC staff on board, there and back".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      type: "string",
      description: "Optional one-line note under the label.",
    }),
  ],
  preview: { select: { title: "label", subtitle: "detail" } },
});

export default defineType({
  name: "pricingSingleToggle",
  title: "Pricing: Single Plan with Toggle",
  type: "object",
  icon: Ticket,
  description:
    "One offer, split in two: a dark art panel with the heading beside a price box with a toggle between price options, a check list, and one button.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label above the heading inside the panel.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Shown inside the art panel. Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Panel texture",
      description:
        "Optional photo shown faintly behind the heading, as decoration. Screen readers skip it, so it needs no alt text.",
      options: { hotspot: true },
    }),
    defineField({
      name: "intro",
      title: "Intro line",
      type: "text",
      rows: 2,
      description: "Optional. One or two sentences above the price box.",
    }),
    defineField({
      name: "options",
      title: "Price options",
      type: "array",
      of: [option],
      description:
        "The prices the reader can toggle between, e.g. round trip and one way, or monthly and yearly. The first is selected on load.",
      validation: (rule) => rule.required().min(1).max(3),
    }),
    defineField({
      name: "facts",
      title: "What the price includes",
      type: "array",
      of: [fact],
      validation: (rule) => rule.required().min(2).max(8),
    }),
    defineField({
      name: "button",
      title: "Button",
      type: "button",
      description: "Optional. The one action under the list.",
    }),
    defineField({
      name: "footnote",
      type: "text",
      rows: 2,
      description: "Optional small print under the button.",
    }),
  ],
  preview: {
    select: { title: "title", options: "options", facts: "facts", media: "image" },
    prepare: ({ title, options, facts, media }) => ({
      title: richTextToPlainText(title) || "Pricing: Single Plan with Toggle",
      subtitle: `${Array.isArray(options) ? options.length : 0} options · ${Array.isArray(facts) ? facts.length : 0} facts`,
      media,
    }),
  },
});
